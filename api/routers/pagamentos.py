"""
routers/pagamentos.py - Endpoints de pagamentos
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from api.database import obter_db
from api.models import UsuarioDB, CorridaDB, PagamentoDB
from api.schemas import PagamentoCriar, PagamentoResposta
from api.auth import exigir_passageiro

roteador = APIRouter(prefix="/pagamentos", tags=["Pagamentos"])


# =========================
# POST /pagamentos
# =========================
@roteador.post("", response_model=PagamentoResposta, status_code=201)
def processar_pagamento(
    dados: PagamentoCriar,
    passageiro: UsuarioDB = Depends(exigir_passageiro),
    db: Session = Depends(obter_db)
):
    """Processa o pagamento de uma corrida finalizada."""

    # Verifica se a corrida existe e pertence ao passageiro autenticado
    corrida = db.query(CorridaDB).filter(
        CorridaDB.id == dados.corrida_id,
        CorridaDB.passageiro_id == passageiro.id
    ).first()

    if not corrida:
        raise HTTPException(status_code=404, detail="Corrida não encontrada")
    if corrida.status != "finalizada":
        raise HTTPException(status_code=400, detail="Só é possível pagar corridas com status 'finalizada'")

    # Verifica se a corrida já foi paga
    if db.query(PagamentoDB).filter(PagamentoDB.corrida_id == dados.corrida_id).first():
        raise HTTPException(status_code=400, detail="Esta corrida já foi paga")

    novo_pagamento = PagamentoDB(
        corrida_id = dados.corrida_id,
        usuario_id = passageiro.id,
        valor      = corrida.valor,
        metodo     = dados.metodo,
        status     = "aprovado",
    )
    db.add(novo_pagamento)
    db.commit()
    db.refresh(novo_pagamento)
    return novo_pagamento


# =========================
# GET /pagamentos
# =========================
@roteador.get("", response_model=list[PagamentoResposta])
def listar_meus_pagamentos(
    passageiro: UsuarioDB = Depends(exigir_passageiro),
    db: Session = Depends(obter_db)
):
    """Lista todos os pagamentos do passageiro autenticado."""
    return db.query(PagamentoDB).filter(PagamentoDB.usuario_id == passageiro.id).all()
