
"""
schemas/avaliacao.py - Schemas Pydantic para validação de avaliações
"""

from pydantic import BaseModel, Field
from datetime import datetime


# ===================== SCHEMA PARA CRIAR AVALIAÇÃO =====================
class AvaliacaoCreate(BaseModel):
    """
    Dados que o passageiro envia para avaliar o motorista.
    A avaliação só pode ser feita após o pagamento da corrida.
    """

    corrida_id: str = Field(
        ...,
        min_length=36,
        max_length=36   # UUID tem exatamente 36 caracteres
    )

    nota: int = Field(
        ...,
        ge=1,   # ge = greater or equal — nota mínima é 1
        le=5    # le = less or equal — nota máxima é 5
    )

    comentario: str | None = Field(
        default=None,
        max_length=500   # Comentário opcional — máximo 500 caracteres
    )

    class Config:
        json_schema_extra = {
            "example": {
                "corrida_id": "d8b58a9f-c9eb-4333-9607-650741e147de",
                "nota": 5,
                "comentario": "Motorista excelente, muito pontual!"
            }
        }


# ===================== SCHEMA DE RESPOSTA =====================
class AvaliacaoResponse(BaseModel):
    """O que retornamos ao cliente após criar ou consultar uma avaliação."""

    id             : str
    passageiro_id  : str
    motorista_id   : str
    corrida_id     : str
    nota           : int
    comentario     : str | None
    criado_em      : datetime

    class Config:
        from_attributes = True

