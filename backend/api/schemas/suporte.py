
"""
schemas/suporte.py - Schemas Pydantic para validação de mensagens de suporte
"""

from pydantic import BaseModel, Field
from datetime import datetime


# ===================== SCHEMA PARA ENVIAR MENSAGEM =====================
class SuporteCreate(BaseModel):
    """
    Dados que o utilizador envia para abrir um ticket de suporte.
    """

    assunto: str = Field(
        ...,
        min_length=5,
        max_length=100
    )

    mensagem: str = Field(
        ...,
        min_length=10,
        max_length=1000
    )

    class Config:
        json_schema_extra = {
            "example": {
                "assunto": "Problema com pagamento",
                "mensagem": "Fiz o pagamento mas não recebi confirmação."
            }
        }


# ===================== SCHEMA DE RESPOSTA =====================
class SuporteResponse(BaseModel):
    """O que retornamos ao cliente após criar ou consultar uma mensagem."""

    id           : str
    usuario_id   : str
    assunto      : str
    mensagem     : str
    status       : str
    criado_em    : datetime

    class Config:
        from_attributes = True

