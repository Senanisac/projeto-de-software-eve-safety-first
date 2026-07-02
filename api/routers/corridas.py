"""
routers/corridas.py - Endpoints de corridas
"""

import random
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from api.database import obter_db
from api.models import UsuarioDB, CorridaDB
from api.schemas import CorridaCriar, CorridaResposta
from api.auth import exigir_passageiro

roteador = APIRouter(prefix="/corridas", tags=["Corridas"])

# Tarifa por quilômetro para cada tipo de veículo
TARIFAS = {"Moto": 1.0, "Carro": 2.0, "VIP": 4.0}


# =========================
# POST /corridas
# =========================
@roteador.post("", response_model=CorridaResposta, status_code=201)
def solicitar_corrida(
    dados: CorridaCriar,
    passageiro: UsuarioDB = Depends(exigir_passageiro),
    db: Session = Depends(obter_db)
):
    """Solicita uma nova corrida para o passageiro autenticado."""

    # Calcula distância aleatória e valor total
    distancia = round(random.uniform(1, 50), 2)
    tarifa    = TARIFAS[dados.tipo_veiculo]
    valor     = round(distancia * tarifa, 2)

    nova_corrida = CorridaDB(
        passageiro_id = passageiro.id,
        origem        = dados.origem,
        destino       = dados.destino,
        tipo_veiculo  = dados.tipo_veiculo,
        distancia     = distancia,
        valor         = valor,
        status        = "confirmada",
    )
    db.add(nova_corrida)
    db.commit()
    db.refresh(nova_corrida)
    return nova_corrida


# =========================
# GET /corridas
# =========================
@roteador.get("", response_model=list[CorridaResposta])
def listar_minhas_corridas(
    passageiro: UsuarioDB = Depends(exigir_passageiro),
    db: Session = Depends(obter_db)
):
    """Lista todas as corridas do passageiro autenticado."""
    return db.query(CorridaDB).filter(CorridaDB.passageiro_id == passageiro.id).all()


# =========================
# GET /corridas/{id}
# =========================
@roteador.get("/{corrida_id}", response_model=CorridaResposta)
def detalhe_corrida(
    corrida_id: str,
    passageiro: UsuarioDB = Depends(exigir_passageiro),
    db: Session = Depends(obter_db)
):
    """Retorna os detalhes de uma corrida específica do passageiro."""
    corrida = db.query(CorridaDB).filter(
        CorridaDB.id == corrida_id,
        CorridaDB.passageiro_id == passageiro.id
    ).first()

    if not corrida:
        raise HTTPException(status_code=404, detail="Corrida não encontrada")
    return corrida


# =========================
# PATCH /corridas/{id}/finalizar
# =========================
@roteador.patch("/{corrida_id}/finalizar", response_model=CorridaResposta)
def finalizar_corrida(
    corrida_id: str,
    passageiro: UsuarioDB = Depends(exigir_passageiro),
    db: Session = Depends(obter_db)
):
    """Finaliza uma corrida com status 'confirmada'."""
    corrida = db.query(CorridaDB).filter(
        CorridaDB.id == corrida_id,
        CorridaDB.passageiro_id == passageiro.id
    ).first()

    if not corrida:
        raise HTTPException(status_code=404, detail="Corrida não encontrada")
    if corrida.status != "confirmada":
        raise HTTPException(
            status_code=400,
            detail=f"Corrida não pode ser finalizada — status atual: {corrida.status}"
        )

    corrida.status = "finalizada"
    db.commit()
    db.refresh(corrida)
    return corrida
