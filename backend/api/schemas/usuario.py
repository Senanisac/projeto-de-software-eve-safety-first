
"""
schemas/usuario.py - Schemas Pydantic para validação de dados de usuários
Este arquivo define a estrutura dos dados que entram e saem da API.
Diferença do models/: models define o banco, schemas define a comunicação HTTP.
"""
 
 
from pydantic import BaseModel, EmailStr, Field   # BaseModel = base, EmailStr = valida email, Field = regras
from typing import Literal                        # Para limitar os valores permitidos num campo
from datetime import datetime                     # Para o campo criado_em na resposta
 
 
# ===================== SCHEMA PARA CADASTRO DE PASSAGEIRO =====================
class PassageiroCreate(BaseModel):
    """
    Define os dados que o frontend deve enviar para cadastrar um passageiro.
    O Pydantic valida automaticamente cada campo antes do endpoint executar.
    """
 
    nome: str = Field(
        ...,                    # "..." significa obrigatório em Pydantic
        min_length=3,           # Nome deve ter pelo menos 3 caracteres
        max_length=100          # Nome deve ter no máximo 100 caracteres
    )
 
    cpf: str = Field(
        ...,                    # Obrigatório
        min_length=11,          # CPF deve ter exatamente 11 dígitos
        max_length=11           # CPF deve ter exatamente 11 dígitos
    )
 
    email: EmailStr             # Pydantic valida automaticamente o formato do email (precisa de @)
 
    senha: str = Field(
        ...,                    # Obrigatório
        min_length=6            # Senha deve ter pelo menos 6 caracteres por segurança
    )
 
    telefone: str = Field(
        ...,                    # Obrigatório
        min_length=8            # Telefone deve ter pelo menos 8 dígitos
    )
 
    class Config:
        json_schema_extra = {           # Exemplo que aparece na documentação automática (/docs)
            "example": {
                "nome": "Ana Souza",
                "cpf": "52998224725",
                "email": "ana@email.com",
                "senha": "senha123",
                "telefone": "81999990001"
            }
        }
 
 
# ===================== SCHEMA PARA CADASTRO DE MOTORISTA =====================
class MotoristaCreate(BaseModel):
    """
    Define os dados que o frontend deve enviar para cadastrar um motorista.
    Tem todos os campos do passageiro mais os campos específicos do motorista.
    """
 
    nome             : str = Field(..., min_length=3, max_length=100)   # Nome completo
 
    cpf              : str = Field(..., min_length=11, max_length=11)    # CPF com exatamente 11 dígitos
 
    email            : EmailStr                                         # Email válido com @
 
    senha            : str = Field(..., min_length=6)                   # Senha com pelo menos 6 caracteres
 
    telefone         : str = Field(..., min_length=8)                # Telefone com pelo menos 8 dígitos
 
    cnh              : str = Field(..., min_length=11, max_length=11)     # CNH com exatamente 11 dígitos
 
    placa            : str                                              # Placa do veículo (ex: ABC-1234)
 
    modelo_veiculo   : str                                     # Modelo do veículo (ex: Toyota Corolla)
 
    tipo_veiculo     : Literal["Moto", "Carro", "VIP"]          # Só aceita exatamente estes 3 valores
 
    class Config:
        json_schema_extra = {
            "example": {
                "nome": "João Silva",
                "cpf": "12345678909",
                "email": "joao@email.com",
                "senha": "senha123",
                "telefone": "11999999999",
                "cnh": "59090100108",
                "placa": "ABC1234",
                "modelo_veiculo": "Toyota Corolla",
                "tipo_veiculo": "Carro"
            }
        }
 
 
# ===================== SCHEMA DE RESPOSTA (SAÍDA) =====================
class UsuarioResponse(BaseModel):
    """
    Define o que a API retorna ao frontend após cadastro ou consulta de perfil.
    IMPORTANTE: senha_hash NÃO está aqui — nunca enviamos a senha de volta.
    """
 
    id         : str               # ID único do usuário (UUID)
    nome       : str             # Nome completo
    cpf        : str              # CPF (sem hash — não é dado sensível)
    email      : str            # Email
    telefone   : str         # Telefone
    tipo       : str             # "passageiro" ou "motorista"
    ativo      : bool           # Se a conta está ativa
    criado_em  : datetime   # Data e hora do cadastro
 
    class Config:
        from_attributes = True   # Permite converter diretamente do objeto SQLAlchemy para este schema
 
 
# ===================== SCHEMAS PARA LOGIN =====================
class LoginRequest(BaseModel):
    """
    Dados que o frontend envia quando o usuário faz login.
    Só precisamos de email e senha para autenticar.
    """
 
    email: EmailStr   # Email válido com @
    senha: str        # Senha em texto plano — será comparada com o hash no banco
 
    class Config:
        json_schema_extra = {
            "example": {
                "email": "ana@email.com",
                "senha": "senha123"
            }
        }
 
 
class Token(BaseModel):
    """
    Resposta que a API retorna após login bem-sucedido.
    O frontend deve guardar o access_token e enviá-lo em todas as próximas requisições.
    """
 
    access_token   : str        # O token JWT que o frontend vai usar para se autenticar
    token_type     : str = "bearer"   # Tipo padrão do OAuth2 — sempre "bearer"
 
 
class TokenData(BaseModel):
    """
    Dados que extraímos de dentro do token JWT ao decodificá-lo.
    Usado internamente pelo sistema de autenticação — nunca enviado ao frontend.
    """
 
    id    : str     # ID do usuário que está autenticado
    tipo  : str   # Tipo do usuário ("passageiro" ou "motorista")

