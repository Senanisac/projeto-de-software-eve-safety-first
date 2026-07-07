
"""
schemas/__init__.py - Ponto de entrada dos schemas
Importa todos os schemas para facilitar o acesso nos outros módulos.
"""

from .usuario import PassageiroCreate, MotoristaCreate, UsuarioResponse, LoginRequest, Token, TokenData
from .corrida import CorridaCreate, CorridaResponse, CorridaCancelar  
from .pagamento import PagamentoCreate, PagamentoResponse

