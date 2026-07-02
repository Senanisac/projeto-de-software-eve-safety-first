"""
auth.py - Autenticação: bcrypt para senhas e JWT para sessões
"""
 
import bcrypt
from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
 
from api.database import obter_db
from api.models import UsuarioDB
from api.schemas import DadosToken
 

# =========================
# CONFIGURAÇÕES DO JWT
# =========================
CHAVE_SECRETA  = "eve-safety-first-chave-2026"
ALGORITMO      = "HS256"
HORAS_VALIDADE = 24
 
# HTTPBearer mostra um campo simples "Token" no Swagger
esquema_bearer = HTTPBearer()
 
 
# =========================
# BCRYPT — hash e verificação de senha
# =========================
def gerar_hash_senha(senha: str) -> str:
    """Gera hash bcrypt da senha. Inclui salt automático."""
    return bcrypt.hashpw(senha.encode(), bcrypt.gensalt()).decode()
 

 
def verificar_senha(senha: str, senha_hash: str) -> bool:
    """Compara a senha fornecida com o hash armazenado no banco."""
    return bcrypt.checkpw(senha.encode(), senha_hash.encode())
 
 
# =========================
# JWT — criação e leitura do token
# =========================
def criar_token(dados: dict) -> str:
    """Cria um token JWT assinado com tempo de expiração."""
    payload   = dados.copy()
    expiracao = datetime.utcnow() + timedelta(hours=HORAS_VALIDADE)
    payload.update({"exp": expiracao})
    return jwt.encode(payload, CHAVE_SECRETA, algorithm=ALGORITMO)
 
 
def verificar_token(token: str) -> DadosToken:
    """Decodifica e valida o JWT. Lança 401 se inválido ou expirado."""
    try:
        payload    = jwt.decode(token, CHAVE_SECRETA, algorithms=[ALGORITMO])
        id_usuario = payload.get("sub")
        tipo       = payload.get("tipo")
        if not id_usuario or not tipo:
            raise HTTPException(status_code=401, detail="Token inválido")
        
        return DadosToken(id=id_usuario, tipo=tipo)
    except JWTError:
        raise HTTPException(status_code=401, detail="Token expirado ou inválido")
 
 
# =========================
# DEPENDÊNCIAS — usuário autenticado
# =========================
def obter_usuario_atual(
    credenciais: HTTPAuthorizationCredentials = Depends(esquema_bearer),
    db: Session = Depends(obter_db)
) -> UsuarioDB:
    """
    Lê o token do header Authorization: Bearer <token>,
    valida e retorna o objeto UsuarioDB do banco.
    """
    dados   = verificar_token(credenciais.credentials)
    usuario = db.query(UsuarioDB).filter(UsuarioDB.id == dados.id).first()
    if not usuario:
        raise HTTPException(status_code=401, detail="Usuário não encontrado")
    if not usuario.ativo:
        raise HTTPException(status_code=403, detail="Conta desativada")
    
    return usuario
 
 
def exigir_passageiro(usuario: UsuarioDB = Depends(obter_usuario_atual)) -> UsuarioDB:
    """Garante que o usuário autenticado é um passageiro."""
    if usuario.tipo != "passageiro":
        raise HTTPException(status_code=403, detail="Acesso permitido apenas para passageiros")
    
    return usuario
 
 
def exigir_motorista(usuario: UsuarioDB = Depends(obter_usuario_atual)) -> UsuarioDB:
    """Garante que o usuário autenticado é um motorista."""
    if usuario.tipo != "motorista":
        raise HTTPException(status_code=403, detail="Acesso permitido apenas para motoristas")
    
    return usuario
 