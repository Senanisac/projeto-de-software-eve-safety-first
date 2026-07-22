
"""
routers/suporte.py - Endpoints de suporte ao cliente
Passageiro e motorista podem enviar e consultar mensagens de suporte.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.usuario import UsuarioDB
from ..models.suporte import SuporteDB
from ..schemas.suporte import SuporteCreate, SuporteResponse
from ..auth import obter_usuario_atual


router = APIRouter()


# ===================== ENVIAR MENSAGEM =====================
@router.post(
    "",                              # URL completa: POST /suporte
    response_model=SuporteResponse,
    status_code=201
)
def enviar_mensagem(
    dados: SuporteCreate,
    usuario: UsuarioDB = Depends(obter_usuario_atual),   # Qualquer utilizador logado
    db: Session = Depends(get_db)
):
    """
    Envia uma mensagem de suporte.
    Disponível para passageiros e motoristas.
    """

    nova_mensagem = SuporteDB(
        usuario_id=usuario.id,
        assunto=dados.assunto,
        mensagem=dados.mensagem,
    )

    db.add(nova_mensagem)
    db.commit()
    db.refresh(nova_mensagem)

    return nova_mensagem


# ===================== VER MINHAS MENSAGENS =====================
@router.get(
    "/minhas",                       # URL completa: GET /suporte/minhas
    response_model=list[SuporteResponse]
)
def listar_minhas_mensagens(
    usuario: UsuarioDB = Depends(obter_usuario_atual),   # Qualquer utilizador logado
    db: Session = Depends(get_db)
):
    """
    Lista todas as mensagens de suporte do utilizador logado.
    Cada utilizador só vê as suas próprias mensagens.
    """

    return db.query(SuporteDB).filter(
        SuporteDB.usuario_id == usuario.id   # Filtra pelo utilizador logado
    ).all()

    