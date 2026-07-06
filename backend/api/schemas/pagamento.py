
"""
schemas/pagamento.py - Schemas Pydantic para validação de dados de pagamentos
Define a estrutura dos dados que entram e saem dos endpoints de pagamentos.
"""
 
 
from pydantic import BaseModel, Field   # BaseModel = base, Field = regras de validação
from typing import Literal              # Para limitar os valores permitidos
from datetime import datetime           # Para o campo criado_em na resposta
 
 
# ===================== SCHEMA PARA CRIAR PAGAMENTO =====================
class PagamentoCreate(BaseModel):
    """
    Dados que o frontend envia para processar um pagamento.
    O valor é buscado automaticamente da corrida — o frontend não pode definir o valor.
    """
 
    corrida_id: str = Field(
        ...,            # Obrigatório
        min_length=36,  # UUID tem exatamente 36 caracteres
        max_length=36   # UUID tem exatamente 36 caracteres
    )
 
    metodo: Literal["pix", "cartao", "dinheiro"]   # Só aceita exatamente estes 3 métodos
 
    class Config:
        json_schema_extra = {
            "example": {
                "corrida_id": "d8b58a9f-c9eb-4333-9607-650741e147de",
                "metodo": "pix"
            }
        }
 
 
# ===================== SCHEMA DE RESPOSTA DE PAGAMENTO =====================
class PagamentoResponse(BaseModel):
    """
    Dados que a API retorna ao frontend após processar ou consultar um pagamento.
    """
 
    id            : str               # ID único do pagamento (UUID)
    corrida_id    : str       # ID da corrida que foi paga
    usuario_id    : str       # ID do usuário que pagou
    valor         : float          # Valor pago em reais (buscado da corrida)
    metodo        : str           # Método usado: "pix", "cartao" ou "dinheiro"
    status        : str           # Status: "pendente", "aprovado" ou "recusado"
    criado_em     : datetime   # Data e hora em que o pagamento foi processado
 
    class Config:
        from_attributes = True   # Permite converter diretamente do objeto SQLAlchemy
 
