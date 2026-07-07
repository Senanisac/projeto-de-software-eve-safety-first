
"""
schemas/corrida.py - Schemas Pydantic para validação de dados de corridas
Define a estrutura dos dados que entram e saem dos endpoints de corridas.
"""
 
 
from pydantic import BaseModel, Field   # BaseModel = base, Field = regras de validação
from typing import Literal              # Para limitar os valores permitidos
from datetime import datetime           # Para o campo criado_em na resposta
 
 
# ===================== SCHEMA PARA SOLICITAR CORRIDA =====================
class CorridaCreate(BaseModel):
    """
    Dados que o frontend envia para solicitar uma nova corrida.
    Distância e valor são calculados pelo servidor — o frontend não envia esses dados.
    """
 
    origem: str = Field(
        ...,            # Obrigatório
        min_length=3    # Endereço deve ter pelo menos 3 caracteres
    )
 
    destino: str = Field(
        ...,            # Obrigatório
        min_length=3    # Endereço deve ter pelo menos 3 caracteres
    )
 
    tipo_veiculo: Literal["Moto", "Carro", "VIP"]   # Só aceita exatamente estes 3 valores
 
    class Config:
        json_schema_extra = {
            "example": {
                "origem": "UFAL — Maceió",
                "destino": "Av. Primeiro de Maio",
                "tipo_veiculo": "Carro"
            }
        }
 
 
# ===================== SCHEMA DE RESPOSTA DE CORRIDA =====================
class CorridaResponse(BaseModel):
    """
    Dados que a API retorna ao frontend após criar ou consultar uma corrida.
    Contém todos os campos — incluindo os calculados pelo servidor (distância, valor).
    """
 
    id             : str               # ID único da corrida (UUID)
    passageiro_id  : str    # ID do passageiro que solicitou
    origem         : str           # Local de origem
    destino        : str          # Local de destino
    distancia      : float      # Distância em km (calculada pelo servidor)
    tipo_veiculo   : str     # Tipo do veículo escolhido
    valor          : float          # Valor total em reais (calculado pelo servidor)
    status         : str           # Status atual: "pendente", "confirmada", "finalizada" ou "cancelada"
    criado_em      : datetime   # Data e hora em que a corrida foi criada
 
    class Config:
        from_attributes = True   # Permite converter diretamente do objeto SQLAlchemy
 

# ===================== SCHEMA PARA CANCELAMENTO =====================
class CorridaCancelar(BaseModel):
    """
    Dados que o motorista envia para cancelar uma corrida.
    O motivo é obrigatório — não é permitido cancelar sem justificativa.
    """

    motivo: str = Field(
        ...,            # Obrigatório
        min_length=5,   # Motivo deve ter pelo menos 5 caracteres
    )

    class Config:
        json_schema_extra = {
            "example": {
                "motivo": "Problema no carro"
            }
        }

