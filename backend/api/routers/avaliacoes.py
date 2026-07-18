
"""
routers/avaliacoes.py - Endpoints de avaliações
Passageiro avalia o motorista após o pagamento da corrida.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.usuario import UsuarioDB
from ..models.corrida import CorridaDB
from ..models.pagamento import PagamentoDB
from ..models.avaliacao import AvaliacaoDB
from ..schemas.avaliacao import AvaliacaoCreate, AvaliacaoResponse
from ..auth import exigir_passageiro


router = APIRouter()


# ===================== CRIAR AVALIAÇÃO =====================
@router.post(
    "",                              # URL completa: POST /avaliacoes
    response_model=AvaliacaoResponse,
    status_code=201
)
def criar_avaliacao(
    dados: AvaliacaoCreate,
    passageiro: UsuarioDB = Depends(exigir_passageiro),   # Só passageiros avaliam
    db: Session = Depends(get_db)
):
    """
    Passageiro avalia o motorista após o pagamento da corrida.
    Regras:
    - A corrida deve existir e pertencer ao passageiro logado
    - A corrida deve estar finalizada
    - A corrida deve ter sido paga
    - Cada corrida só pode ser avaliada uma vez
    """

    # REGRA 1: Verifica que a corrida existe e pertence ao passageiro
    corrida = db.query(CorridaDB).filter(
        CorridaDB.id == dados.corrida_id,
        CorridaDB.passageiro_id == passageiro.id
    ).first()

    if not corrida:
        raise HTTPException(status_code=404, detail="Corrida não encontrada")

    # REGRA 2: Corrida deve estar finalizada
    if corrida.status != "finalizada":
        raise HTTPException(
            status_code=400,
            detail="Só é possível avaliar corridas finalizadas"
        )

    # REGRA 3: Corrida deve ter sido paga
    pagamento = db.query(PagamentoDB).filter(
        PagamentoDB.corrida_id == dados.corrida_id,
        PagamentoDB.status == "aprovado"
    ).first()

    if not pagamento:
        raise HTTPException(
            status_code=400,
            detail="Só é possível avaliar corridas que já foram pagas"
        )

    # REGRA 4: Corrida não pode ser avaliada duas vezes
    avaliacao_existente = db.query(AvaliacaoDB).filter(
        AvaliacaoDB.corrida_id == dados.corrida_id
    ).first()

    if avaliacao_existente:
        raise HTTPException(
            status_code=400,
            detail="Esta corrida já foi avaliada"
        )

    # Verifica que a corrida tem um motorista associado
    if not corrida.motorista_id:
        raise HTTPException(
            status_code=400,
            detail="Esta corrida não tem motorista associado"
        )

    # Cria a avaliação
    nova_avaliacao = AvaliacaoDB(
        passageiro_id=passageiro.id,
        motorista_id=corrida.motorista_id,   # Motorista vem da corrida — não do frontend
        corrida_id=dados.corrida_id,
        nota=dados.nota,
        comentario=dados.comentario
    )

    db.add(nova_avaliacao)
    db.commit()
    db.refresh(nova_avaliacao)

    return nova_avaliacao


# ===================== VER AVALIAÇÕES DO MOTORISTA =====================
@router.get(
    "/motorista/{motorista_id}",     # URL completa: GET /avaliacoes/motorista/{id}
    response_model=list[AvaliacaoResponse]
)
def listar_avaliacoes_motorista(
    motorista_id: str,
    db: Session = Depends(get_db)   # Público — qualquer um pode ver as avaliações
):
    """
    Lista todas as avaliações de um motorista específico.
    Endpoint público — não precisa de autenticação.
    """

    return db.query(AvaliacaoDB).filter(
        AvaliacaoDB.motorista_id == motorista_id
    ).all()


# ===================== VER MINHAS AVALIAÇÕES FEITAS =====================
@router.get(
    "/minhas",                       # URL completa: GET /avaliacoes/minhas
    response_model=list[AvaliacaoResponse]
)
def listar_minhas_avaliacoes(
    passageiro: UsuarioDB = Depends(exigir_passageiro),
    db: Session = Depends(get_db)
):
    """
    Lista todas as avaliações feitas pelo passageiro logado.
    Usado para saber quais corridas já foram avaliadas.
    """

    return db.query(AvaliacaoDB).filter(
        AvaliacaoDB.passageiro_id == passageiro.id
    ).all()

