
"""
routers/pagamentos.py - Rotas de Pagamentos
Gerencia o processamento e consulta de pagamentos de corridas.
"""
 
 
from fastapi import APIRouter, Depends, HTTPException           # Ferramentas do FastAPI
from sqlalchemy.orm import Session                              # Para trabalhar com sessões do banco
 
from ..database import get_db                    # Função para obter sessão do banco
from ..models.usuario import UsuarioDB           # Modelo do usuário
from ..models.corrida import CorridaDB           # Modelo da corrida — para buscar o valor
from ..models.pagamento import PagamentoDB       # Modelo do pagamento no banco
from ..schemas.pagamento import PagamentoCreate, PagamentoResponse   # Schemas de entrada e saída
from ..auth import exigir_passageiro             # Dependência que garante que é passageiro
 
 
# Cria o grupo de rotas para pagamentos
router = APIRouter()
 
 
# ===================== PROCESSAR PAGAMENTO =====================
@router.post(
    "",                            # URL completa: POST /pagamentos
    response_model=PagamentoResponse,
    status_code=201                # 201 = Created
)
def processar_pagamento(
    dados: PagamentoCreate,                                    # Dados validados pelo Pydantic
    passageiro: UsuarioDB = Depends(exigir_passageiro),        # Garante que é passageiro logado
    db: Session = Depends(get_db)                              # Sessão do banco
):
    """
    Processa o pagamento de uma corrida finalizada.
    Regras de negócio:
    1. A corrida deve existir e pertencer ao passageiro logado
    2. A corrida deve estar com status 'finalizada'
    3. A corrida não pode já ter sido paga
    O valor é buscado da corrida — o frontend não pode definir o valor.
    """
 
    # REGRA 1: Busca a corrida com duas condições de segurança
    corrida = db.query(CorridaDB).filter(
        CorridaDB.id == dados.corrida_id,            # ID deve bater com o banco
        CorridaDB.passageiro_id == passageiro.id     # Corrida deve pertencer ao passageiro logado
    ).first()
 
    if not corrida:
        # Corrida não existe ou não pertence a este passageiro
        raise HTTPException(status_code=404, detail="Corrida não encontrada")
 
    # REGRA 2: Só pode pagar corridas finalizadas
    if corrida.status != "finalizada":
        raise HTTPException(
            status_code=400,
            detail=f"Só é possível pagar corridas com status 'finalizada'. Status atual: '{corrida.status}'"
        )
 
    # REGRA 3: Verifica se esta corrida já foi paga
    pagamento_existente = db.query(PagamentoDB).filter(
        PagamentoDB.corrida_id == dados.corrida_id   # Busca pagamento com este ID de corrida
    ).first()
 
    if pagamento_existente:
        # Já existe um pagamento para esta corrida — não pode pagar duas vezes
        raise HTTPException(status_code=400, detail="Esta corrida já foi paga")
 
    # Cria o pagamento com o valor buscado da corrida — nunca do frontend
    novo_pagamento = PagamentoDB(
        corrida_id=dados.corrida_id,       # ID da corrida que está sendo paga
        usuario_id=passageiro.id,          # ID do passageiro logado — vem do token
        valor=corrida.valor,               # Valor vem da corrida no banco — não do frontend
        metodo=dados.metodo,               # Método escolhido pelo passageiro
        status="aprovado"                  # Em produção: começaria como "pendente" e seria atualizado pela API de pagamento
    )
 
    db.add(novo_pagamento)       # Prepara para inserção
    db.commit()                  # Salva no banco
    db.refresh(novo_pagamento)   # Recarrega para obter id e criado_em
 
    return novo_pagamento
 
 
# ===================== LISTAR MEUS PAGAMENTOS =====================
@router.get(
    "",                                       # URL completa: GET /pagamentos
    response_model=list[PagamentoResponse]    # Retorna uma lista de pagamentos
)
def listar_meus_pagamentos(
    passageiro: UsuarioDB = Depends(exigir_passageiro),   # Garante que é passageiro logado
    db: Session = Depends(get_db)
):
    """
    Lista todos os pagamentos do passageiro autenticado.
    Cada passageiro só vê os seus próprios pagamentos.
    """
 
    # Busca todos os pagamentos onde usuario_id é igual ao ID do passageiro logado
    return db.query(PagamentoDB).filter(
        PagamentoDB.usuario_id == passageiro.id   # Filtra apenas os pagamentos deste passageiro
    ).all()
 