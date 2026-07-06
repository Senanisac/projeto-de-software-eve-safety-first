
"""
routers/corridas.py - Rotas de Corridas
Gerencia todo o ciclo de vida de uma corrida: criar, listar, consultar e finalizar.
"""
 
 
import random                                                   # Para simular distância aleatória
from fastapi import APIRouter, Depends, HTTPException           # Ferramentas do FastAPI
from sqlalchemy.orm import Session                              # Para trabalhar com sessões do banco
 
from ..database import get_db                  # Função para obter sessão do banco
from ..models.usuario import UsuarioDB         # Modelo do usuário (passageiro autenticado)
from ..models.corrida import CorridaDB         # Modelo da corrida no banco
from ..schemas.corrida import CorridaCreate, CorridaResponse   # Schemas de entrada e saída
from ..auth import exigir_passageiro           # Dependência que garante que é passageiro
 
 
# Cria o grupo de rotas para corridas
router = APIRouter()
 
 
# Tarifa em reais por quilômetro para cada tipo de veículo
TARIFAS = {
    "Moto": 1.0,    # R$1,00 por km — opção mais barata
    "Carro": 2.0,   # R$2,00 por km — opção padrão
    "VIP": 4.0      # R$4,00 por km — opção premium
}
 
 
# ===================== SOLICITAR CORRIDA =====================
@router.post(
    "",                          # URL completa: POST /corridas
    response_model=CorridaResponse,
    status_code=201              # 201 = Created
)
def solicitar_corrida(
    dados: CorridaCreate,                                      # Dados validados pelo Pydantic
    passageiro: UsuarioDB = Depends(exigir_passageiro),        # Garante que é passageiro logado
    db: Session = Depends(get_db)                              # Sessão do banco
):
    """
    Passageiro solicita uma nova corrida.
    A distância é simulada aleatoriamente — em produção seria calculada por uma API de mapas.
    O valor é calculado automaticamente pelo servidor — o passageiro não define o preço.
    """
 
    # Simula o cálculo de distância entre origem e destino
    # Em produção: chamada para Google Maps API ou similar
    distancia = round(random.uniform(1, 50), 2)   # Entre 1 e 50 km, com 2 casas decimais
 
    # Calcula o valor total: distância × tarifa do veículo escolhido
    tarifa = TARIFAS[dados.tipo_veiculo]           # Pega a tarifa do dicionário acima
    valor = round(distancia * tarifa, 2)           # Arredonda para 2 casas decimais (evita R$59.38001...)
 
    # Cria o objeto da nova corrida com todos os dados calculados
    nova_corrida = CorridaDB(
        passageiro_id=passageiro.id,   # ID do passageiro autenticado — vem do token, não do frontend
        origem=dados.origem,           # Local de origem enviado pelo frontend
        destino=dados.destino,         # Local de destino enviado pelo frontend
        distancia=distancia,           # Distância calculada pelo servidor
        tipo_veiculo=dados.tipo_veiculo,   # Tipo escolhido pelo passageiro
        valor=valor,                   # Valor calculado pelo servidor
        status="confirmada"            # Corrida já inicia como confirmada (simplificação)
    )
 
    db.add(nova_corrida)      # Prepara para inserção
    db.commit()               # Salva no banco
    db.refresh(nova_corrida)  # Recarrega para obter id e criado_em gerados pelo banco
 
    return nova_corrida
 
 
# ===================== LISTAR MINHAS CORRIDAS =====================
@router.get(
    "",                                    # URL completa: GET /corridas
    response_model=list[CorridaResponse]   # Retorna uma lista de corridas
)
def listar_minhas_corridas(
    passageiro: UsuarioDB = Depends(exigir_passageiro),   # Garante que é passageiro logado
    db: Session = Depends(get_db)
):
    """
    Lista todas as corridas do passageiro autenticado.
    Cada passageiro só vê as suas próprias corridas — nunca as de outros.
    """
 
    # Busca todas as corridas onde passageiro_id é igual ao ID do usuário logado
    return db.query(CorridaDB).filter(
        CorridaDB.passageiro_id == passageiro.id   # Filtra apenas as corridas deste passageiro
    ).all()   # .all() retorna uma lista — diferente de .first() que retorna um único objeto
 
 
# ===================== DETALHE DE UMA CORRIDA =====================
@router.get(
    "/{corrida_id}",           # URL completa: GET /corridas/{id}
    response_model=CorridaResponse
)
def detalhe_corrida(
    corrida_id: str,                                          # ID da corrida extraído da URL automaticamente
    passageiro: UsuarioDB = Depends(exigir_passageiro),
    db: Session = Depends(get_db)
):
    """
    Retorna os detalhes de uma corrida específica.
    Verifica que a corrida pertence ao passageiro logado — segurança.
    """
 
    # Busca a corrida com DUAS condições: ID correto E pertence a este passageiro
    corrida = db.query(CorridaDB).filter(
        CorridaDB.id == corrida_id,                  # ID da URL deve bater com o banco
        CorridaDB.passageiro_id == passageiro.id     # Corrida deve pertencer ao passageiro logado
    ).first()
 
    # Se não encontrou — corrida não existe OU não pertence a este passageiro
    # Retornamos 404 em ambos os casos — não revelamos se a corrida existe mas é de outro usuário
    if not corrida:
        raise HTTPException(status_code=404, detail="Corrida não encontrada")
 
    return corrida
 
 
# ===================== FINALIZAR CORRIDA =====================
@router.patch(
    "/{corrida_id}/finalizar",   # URL completa: PATCH /corridas/{id}/finalizar
    response_model=CorridaResponse
)
def finalizar_corrida(
    corrida_id: str,
    passageiro: UsuarioDB = Depends(exigir_passageiro),
    db: Session = Depends(get_db)
):
    """
    Finaliza uma corrida que está com status 'confirmada'.
    Somente corridas confirmadas podem ser finalizadas.
    Após finalizar, o passageiro pode pagar.
    """
 
    # Busca a corrida com as mesmas duas condições de segurança
    corrida = db.query(CorridaDB).filter(
        CorridaDB.id == corrida_id,
        CorridaDB.passageiro_id == passageiro.id
    ).first()
 
    if not corrida:
        raise HTTPException(status_code=404, detail="Corrida não encontrada")
 
    # Verifica o ciclo de vida — só pode finalizar se estiver confirmada
    if corrida.status != "confirmada":
        raise HTTPException(
            status_code=400,   # 400 = Bad Request — ação inválida para o estado atual
            detail=f"Corrida não pode ser finalizada — status atual: '{corrida.status}'"
        )
 
    corrida.status = "finalizada"   # Atualiza o status em memória — SQLAlchemy detecta a mudança
    db.commit()                     # Salva a mudança no banco (UPDATE SQL)
    db.refresh(corrida)             # Recarrega os dados atualizados do banco
 
    return corrida
