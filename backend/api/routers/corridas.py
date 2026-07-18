
"""
routers/corridas.py - Rotas de Corridas
Gerencia todo o ciclo de vida de uma corrida: criar, listar, consultar e finalizar.
"""
 
 
import random                                                   # Para simular distância aleatória
from datetime import date                                       # Para verificar e resetar o limite diário
from fastapi import APIRouter, Depends, HTTPException           # Ferramentas do FastAPI
from sqlalchemy.orm import Session                              # Para trabalhar com sessões do banco
 
from ..database import get_db                  # Função para obter sessão do banco
from ..models.usuario import UsuarioDB         # Modelo do usuário (passageiro autenticado)
from ..models.corrida import CorridaDB         # Modelo da corrida no banco
from ..schemas.corrida import CorridaCreate, CorridaResponse, CorridaCancelar  # Schemas de entrada e saída
from ..auth import exigir_passageiro, exigir_motorista          # Dependência que garante que é passageiro ou motorista
 
 
# Cria o grupo de rotas para corridas
router = APIRouter()
 
 
# Tarifa em reais por quilômetro para cada tipo de veículo
TARIFAS = {
    "Moto": 1.0,    # R$1,00 por km — opção mais barata
    "Carro": 2.0,   # R$2,00 por km — opção padrão
    "VIP": 4.0      # R$4,00 por km — opção premium
}
 
 
 # ===================== LISTAR CORRIDAS PENDENTES (MOTORISTA) =====================
@router.get(
    "/pendentes",                          # URL completa: GET /corridas/pendentes
    response_model=list[CorridaResponse]   # Retorna lista de corridas pendentes
)
def listar_corridas_pendentes(
    motorista: UsuarioDB = Depends(exigir_motorista),   # Garante que é motorista logado
    db: Session = Depends(get_db)
):
    """
    Lista todas as corridas com status 'pendente'.
    O motorista vê as corridas disponíveis para aceitar.
    """

    # Busca todas as corridas pendentes — de qualquer passageiro
    return db.query(CorridaDB).filter(
        CorridaDB.status == "pendente"   # Apenas corridas que ainda não foram aceitas
    ).all()


# ===================== LISTAR CORRIDAS DO MOTORISTA =====================
@router.get(
    "/motorista/minhas",                   # URL completa: GET /corridas/motorista/minhas
    response_model=list[CorridaResponse]
)
def listar_corridas_motorista(
    motorista: UsuarioDB = Depends(exigir_motorista),   # Garante que é motorista logado
    db: Session = Depends(get_db)
):
    """
    Lista todas as corridas associadas ao motorista logado.
    Inclui corridas confirmadas, canceladas pelo motorista e finalizadas.
    O motorista só vê as corridas que aceitou — nunca as de outros motoristas.
    """

    # Busca todas as corridas onde motorista_id corresponde ao motorista logado
    # Inclui todos os status — confirmada, cancelada, finalizada
    return db.query(CorridaDB).filter(
        CorridaDB.motorista_id == motorista.id   # Filtra apenas as corridas deste motorista
    ).all() 



# ===================== SOLICITAR CORRIDA (PASSAGEIRO) =====================
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
    Status inicial é 'pendente' — o motorista precisa aceitar antes de confirmar.
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
        status="pendente"            # Corrida já inicia como confirmada (simplificação)
    )
 
    db.add(nova_corrida)      # Prepara para inserção
    db.commit()               # Salva no banco
    db.refresh(nova_corrida)  # Recarrega para obter id e criado_em gerados pelo banco
 
    return nova_corrida
 
 
# ===================== LISTAR MINHAS CORRIDAS (PASSAGEIRO) =====================
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
 
 
# ===================== DETALHE DE UMA CORRIDA (PASSAGEIRO) =====================
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
 

# ===================== CANCELAR CORRIDA (PASSAGEIRO) =====================
@router.patch(
    "/{corrida_id}/passageiro/cancelar",   # URL completa: PATCH /corridas/{id}/passageiro/cancelar
    response_model=CorridaResponse
)
def passageiro_cancelar_corrida(
    corrida_id: str,
    passageiro: UsuarioDB = Depends(exigir_passageiro),   # Garante que é passageiro logado
    db: Session = Depends(get_db)
):
    """
    Passageiro cancela uma corrida que ainda está pendente.
    Só é possível cancelar antes de um motorista aceitar.
    Se um motorista já aceitou — corrida está 'confirmada' — não é possível cancelar.
    """

    # Busca a corrida verificando que pertence ao passageiro logado
    corrida = db.query(CorridaDB).filter(
        CorridaDB.id == corrida_id,
        CorridaDB.passageiro_id == passageiro.id   # Segurança — só o próprio passageiro pode cancelar
    ).first()

    if not corrida:
        raise HTTPException(status_code=404, detail="Corrida não encontrada")

    # Só pode cancelar corridas pendentes — nenhum motorista aceitou ainda
    if corrida.status != "pendente":
        raise HTTPException(
            status_code=400,
            detail=f"Não é possível cancelar — status atual: '{corrida.status}'. "
                   f"Só é possível cancelar corridas que ainda não foram aceitas por um motorista."
        )

    corrida.status = "cancelada"   # Cancelada definitivamente — sai de circulação
    db.commit()
    db.refresh(corrida)

    return corrida


# ===================== FINALIZAR CORRIDA =====================
@router.patch(
    "/{corrida_id}/finalizar",   # URL completa: PATCH /corridas/{id}/finalizar
    response_model=CorridaResponse
)
def finalizar_corrida(
    corrida_id: str,
    motorista: UsuarioDB = Depends(exigir_motorista),   # Motorista finaliza — não o passageiro
    db: Session = Depends(get_db)
):
    """
    Motorista finaliza uma corrida confirmada.
    Ciclo: pendente → confirmada → finalizada → [pagamento]
    """
 
    # Busca a corrida com as mesmas duas condições de segurança
    corrida = db.query(CorridaDB).filter(
        CorridaDB.id == corrida_id,
        CorridaDB.motorista_id == motorista.id   # Verifica que é o motorista desta corrida
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


# ===================== RECUSAR CORRIDA (MOTORISTA) =====================
@router.patch(
    "/{corrida_id}/recusar",           # URL completa: PATCH /corridas/{id}/recusar
    response_model=CorridaResponse
)
def recusar_corrida(
    corrida_id: str,
    motorista: UsuarioDB = Depends(exigir_motorista),   # Garante que é motorista logado
    db: Session = Depends(get_db)
):
    """
    Motorista recusa uma corrida pendente sem penalização.
    Diferente do cancelar — o motorista nunca aceitou esta corrida.
    A corrida continua pendente e disponível para outros motoristas.
    Não conta no limite diário de cancelamentos.
    """

    corrida = db.query(CorridaDB).filter(
        CorridaDB.id == corrida_id
    ).first()

    if not corrida:
        raise HTTPException(status_code=404, detail="Corrida não encontrada")

    # Só pode recusar corridas pendentes — nunca confirmadas
    if corrida.status != "pendente":
        raise HTTPException(
            status_code=400,
            detail=f"Só é possível recusar corridas pendentes. Status atual: '{corrida.status}'"
        )

    # Corrida fica pendente — apenas marca que este motorista recusou
    # Em fases futuras: guardar lista de motoristas que recusaram para não mostrar de novo
    # Por agora: a corrida continua visível para todos os motoristas
    return corrida   # Retorna a corrida sem alterar o status


# ===================== ACEITAR CORRIDA (MOTORISTA) =====================
@router.patch(
    "/{corrida_id}/aceitar",           # URL completa: PATCH /corridas/{id}/aceitar
    response_model=CorridaResponse
)
def aceitar_corrida(
    corrida_id: str,
    motorista: UsuarioDB = Depends(exigir_motorista),   # Garante que é motorista logado
    db: Session = Depends(get_db)
):
    """
    Motorista aceita uma corrida pendente.
    Muda o status de 'pendente' para 'confirmada'.
    """

    # Busca a corrida pelo ID — qualquer corrida pendente pode ser aceita
    corrida = db.query(CorridaDB).filter(
        CorridaDB.id == corrida_id   # Busca pelo ID fornecido na URL
    ).first()

    if not corrida:
        raise HTTPException(status_code=404, detail="Corrida não encontrada")

    # Só pode aceitar corridas pendentes
    if corrida.status != "pendente":
        raise HTTPException(
            status_code=400,
            detail=f"Corrida não pode ser aceita — status atual: '{corrida.status}'"
        )

    corrida.status = "confirmada"        # Motorista aceitou — corrida confirmada
    corrida.motorista_id = motorista.id  # Regista o motorista que aceitou
    db.commit()
    db.refresh(corrida)

    return corrida


# ===================== CANCELAR CORRIDA (MOTORISTA) =====================
@router.patch(
    "/{corrida_id}/cancelar",          # URL completa: PATCH /corridas/{id}/cancelar
    response_model=CorridaResponse
)
def cancelar_corrida(
    corrida_id: str,
    dados: CorridaCancelar,                              # Dados com o motivo do cancelamento
    motorista: UsuarioDB = Depends(exigir_motorista),   # Garante que é motorista logado
    db: Session = Depends(get_db)
):
    """
    Motorista cancela uma corrida com motivo obrigatório.
    Regras:
    - Só pode cancelar corridas 'confirmadas'
    - O contador só incrementa se a corrida estava 'confirmada'
      (ou seja, o motorista já tinha aceitado e depois desistiu)
    - Limite de 5 cancelamentos por dia — reset automático à meia-noite
    """

    # Busca a corrida pelo ID
    corrida = db.query(CorridaDB).filter(
        CorridaDB.id == corrida_id
    ).first()

    if not corrida:
        raise HTTPException(status_code=404, detail="Corrida não encontrada")
    

    # Motorista só pode cancelar corridas que JÁ ACEITOU — status "confirmada"
    # Corridas "pendentes" nunca foram aceitas — não há nada para cancelar
    if corrida.status != "confirmada":
        raise HTTPException(
            status_code=400,
            detail=f"Só é possível cancelar corridas que já foram aceitas. Status atual: '{corrida.status}'"
        )

    # ===== RESET DIÁRIO DO CONTADOR =====
    # Pega a data de hoje no formato "YYYY-MM-DD"
    hoje = str(date.today())

    # Se o último cancelamento foi num dia diferente de hoje — reseta o contador
    if motorista.data_ultimo_cancelamento != hoje:
        motorista.cancelamentos = 0              # Reset do contador
        motorista.data_ultimo_cancelamento = hoje # Atualiza para hoje

    # ===== VERIFICAR LIMITE DIÁRIO =====
    # Só verifica o limite se a corrida estava confirmada
    # Corridas pendentes não contam — motorista nunca se comprometeu
    LIMITE_CANCELAMENTOS = 5
    if corrida.status == "confirmada" and motorista.cancelamentos >= LIMITE_CANCELAMENTOS:
        raise HTTPException(
            status_code=400,
            detail=f"Limite de {LIMITE_CANCELAMENTOS} cancelamentos diários atingido. Tente novamente amanhã."
        )

    # ===== PROCESSAR CANCELAMENTO =====
    # Guarda o status ANTES de alterar — necessário para verificar depois
    status_anterior = corrida.status   # Guarda "pendente" ou "confirmada"

    # Se o motorista tinha aceitado e agora cancela — corrida volta à circulação
    # Outros motoristas podem ver e aceitar novamente
    if status_anterior == "confirmada":
        corrida.status = "pendente"                # Volta à circulação — não "cancelada"
        motorista.cancelamentos += 1               # Penaliza o motorista
        motorista.data_ultimo_cancelamento = hoje

    db.commit()
    db.refresh(corrida)

    return corrida
