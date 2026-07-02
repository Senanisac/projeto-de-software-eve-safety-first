
"""
auth.py - Autenticação: bcrypt para senhas e JWT para sessões
"""

import bcrypt 
from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from api.database import obter_db
from api.models import UsuarioDB
from api.schemas import DadosToken


# =========================
# CONFIGURAÇÕES DO JWT
# =========================
CHAVE_SECRETA = "eve-safety-first-chave-2026"  # em produção: usar variável de ambiente
ALGORITMO = "HS256"
HORAS_VALIDADE = 24  # token válido por 24 horas

esquema_oauth2 = OAuth2PasswordBearer(tokenUrl="usuario/login")


# =========================
# BCRYPT — hash e verificação de senha
# =========================
def gerar_hash_senha(senha: str) -> str:
    """
    Gera um hash bcrypt da senha.
    Mais seguro que SHA-256: inclui salt automático e é lento por design
    (dificulta ataques de força bruta).
    """
    return bcrypt.hashpw(senha.encode(), bcrypt.gensalt()).decode()


def verificar_senha(senha : str, senha_hash: str) -> bool:
     """Compara a senha fornecida com o hash armazenado no banco."""
     return bcrypt.checkpw(senha.encode(), senha_hash.encode())


#=========================
# JWT — criação e leitura do token
# =========================
def criar_token(dados: dict) -> str:
    """
    Cria um token JWT com os dados do usuário e tempo de expiração.
    O token é assinado com CHAVE_SECRETA — só o servidor pode criar e verificar.
    """
    payload = dados.copy()
    expiracao = datetime.utcnow() + timedelta(hours=HORAS_VALIDADE)
    payload.update({"exp": expiracao})
    return jwt.encode(payload, CHAVE_SECRETA, algorithm=ALGORITMO)


def verificar_token(token: str) -> DadosToken:
    """
    Decodifica e valida o JWT.
    Lança erro 401 se o token for inválido ou expirado.
    """
    try:
        payload = jwt.decode(token, CHAVE_SECRETA, algorithms=[ALGORITMO])
        id_usuario = payload.get("sub")
        tipo = payload.get("tipo")
        if not id_usuario or not tipo:
            raise HTTPException(status_code=401, detail="Token inválido")
        return DadosToken(id=id_usuario, tipo=tipo)
    except JWTError:
        raise HTTPException(status_code=401, detail="Token expirado ou inválido")
    

# =========================
# DEPENDÊNCIAS — usuário autenticado
# =========================
def obter_usuario_atual(
        token: str = Depends(esquema_oauth2),
        db: Session = Depends(obter_db)
        ) -> UsuarioDB:
            """
            Dependência FastAPI: lê o token do cabeçalho Authorization,
            valida e retorna o objeto UsuarioDB do banco.
            Usada em qualquer endpoint que exige autenticação.
            """
            dados = verificar_token(token)
            usuario = db.query(UsuarioDB).filter(UsuarioDB.id == dados.id).first()
            if not usuario:
                 raise HTTPException(status_code=401, detail="Usuário não encontrado")
            if not usuario.ativo:
                 raise HTTPException(status_code=403, detail="Conta desativada")
           
            return usuario 


def exigir_passageiro(usuario: UsuarioDB = Depends(obter_usuario_atual)) -> UsuarioDB:
    """Dependência: garante que o usuário autenticado é um passageiro."""
    if usuario.tipo != "passageiro":
         raise HTTPException(status_code=403, detail="Acesso permitido apenas para passageiros")
    return usuario


def exigir_motorista(usuario: UsuarioDB = Depends(obter_usuario_atual)) -> UsuarioDB:
    """Dependência: garante que o usuário autenticado é um motorista."""
    if usuario.tipo != "motorista":
        raise HTTPException(status_code=403, detail="Acesso permitido apenas para motoristas")
    return usuario

