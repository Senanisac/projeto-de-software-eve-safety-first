
"""
schemas.py - Validação de dados com Pydantic
Cada classe define o que aceitamos como entrada e o que retornamos como saída.
"""

from pydantic import BaseModel, EmailStr, field_validator
from typing import Literal
from datetime import datetime


# =========================
# USUÁRIO
# =========================
class PassageiroCriar(BaseModel):
    """Dados necessários para cadastrar um passageiro"""
    nome      : str
    cpf       : str
    email     : EmailStr
    senha     : str
    telefone  : str

    @field_validator("cpf")
    @classmethod
    def cpf_somente_numeros(cls, v):
        v = v.replace(".", "").replace("-", "")
        if not v.isdigit() or len(v) != 11:
            raise ValueError("CPF deve conter exatamente 11 dígitos numéricos")
        
        return v
    
    @field_validator("senha")
    @classmethod
    def senha_tamanho_minimo(cls, v):
        if len(v) < 6:
            raise ValueError("A senha deve ter no mínimo 6 caracteres")
        
        return v


class MotoristaCriar(BaseModel):
    """Dados necessários para cadastrar um motorista"""
    nome            : str
    cpf             : str
    email           : EmailStr
    senha           : str
    telefone        : str
    cnh             : str
    placa           : str
    modelo_veiculo  : str
    tipo_veiculo    : Literal["Moto", "Carro", "VIP"]

    @field_validator("cpf")
    @classmethod
    def cpf_somente_numeros(cls, v):
        v = v.replace(".", "").replace("-", "")
        if not v.isdigit() or len(v) != 11:
            raise ValueError("CPF deve conter exatamente 11 dígitos numéricos")
        return v
 
    @field_validator("senha")
    @classmethod
    def senha_tamanho_minimo(cls, v):
        if len(v) < 6:
            raise ValueError("A senha deve ter no mínimo 6 caracteres")
        return v
    

class UsuarioResposta(BaseModel):
    """O que retornamos ao cliente — nunca inclui a senha_hash"""
    id         : str
    nome       : str
    cpf        : str
    email      : str
    telefone   : str
    tipo       : str
    ativo      : bool
    criado_em  : datetime

    model_config = {"from_attributes": True}


 #=========================
# LOGIN / TOKEN
# =========================
class DadosLogin(BaseModel):
    email : EmailStr
    senha : str
 
 
class Token(BaseModel):
    access_token : str
    token_type   : str = "bearer"
 
 
class DadosToken(BaseModel):
    """Dados extraídos do JWT — mantidos na sessão autenticada"""
    id   : str
    tipo : str
 
 
# =========================
# CORRIDA
# =========================
class CorridaCriar(BaseModel):
    origem        : str
    destino       : str
    tipo_veiculo  : Literal["Moto", "Carro", "VIP"]
 
 
class CorridaResposta(BaseModel):
    id             : str
    passageiro_id  : str
    origem         : str
    destino        : str
    distancia      : float
    tipo_veiculo   : str
    valor          : float
    status         : str
    criado_em      : datetime
 
    model_config = {"from_attributes": True}
 
 
# =========================
# PAGAMENTO
# =========================
class PagamentoCriar(BaseModel):
    corrida_id : str
    metodo     : Literal["pix", "cartao", "dinheiro"]
 
 
class PagamentoResposta(BaseModel):
    id          : str
    corrida_id  : str
    valor       : float
    metodo      : str
    status      : str
    criado_em   : datetime
 
    model_config = {"from_attributes": True}

