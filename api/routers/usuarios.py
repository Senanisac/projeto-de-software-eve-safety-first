"""
routers/usuarios.py - Endpoints de cadastro e autenticação
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from api.database import obter_db
from api.models import UsuarioDB
from api.schemas import PassageiroCriar, MotoristaCriar, UsuarioResposta, DadosLogin, Token
from api.auth import gerar_hash_senha, verificar_senha, criar_token, obter_usuario_atual

roteador = APIRouter(prefix="/usuarios", tags=["Usuários"])


# =========================
# POST /usuarios/passageiro
# =========================
@roteador.post("/passageiro", response_model=UsuarioResposta, status_code=201)
def cadastrar_passageiro(dados: PassageiroCriar, db: Session = Depends(obter_db)):
    """Cadastra um novo passageiro no sistema."""

    # Verifica se CPF ou email já estão em uso
    if db.query(UsuarioDB).filter(UsuarioDB.cpf == dados.cpf).first():
        raise HTTPException(status_code=400, detail="CPF já cadastrado")
    if db.query(UsuarioDB).filter(UsuarioDB.email == dados.email).first():
        raise HTTPException(status_code=400, detail="Email já cadastrado")

    novo_usuario = UsuarioDB(
        nome       = dados.nome,
        cpf        = dados.cpf,
        email      = dados.email,
        senha_hash = gerar_hash_senha(dados.senha),
        telefone   = dados.telefone,
        tipo       = "passageiro",
    )
    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)
    return novo_usuario


# =========================
# POST /usuarios/motorista
# =========================
@roteador.post("/motorista", response_model=UsuarioResposta, status_code=201)
def cadastrar_motorista(dados: MotoristaCriar, db: Session = Depends(obter_db)):
    """Cadastra um novo motorista no sistema."""

    if db.query(UsuarioDB).filter(UsuarioDB.cpf == dados.cpf).first():
        raise HTTPException(status_code=400, detail="CPF já cadastrado")
    if db.query(UsuarioDB).filter(UsuarioDB.email == dados.email).first():
        raise HTTPException(status_code=400, detail="Email já cadastrado")

    novo_usuario = UsuarioDB(
        nome           = dados.nome,
        cpf            = dados.cpf,
        email          = dados.email,
        senha_hash     = gerar_hash_senha(dados.senha),
        telefone       = dados.telefone,
        tipo           = "motorista",
        cnh            = dados.cnh,
        placa          = dados.placa,
        modelo_veiculo = dados.modelo_veiculo,
        tipo_veiculo   = dados.tipo_veiculo,
    )
    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)
    return novo_usuario


# =========================
# POST /usuarios/login
# =========================
@roteador.post("/login", response_model=Token)
def fazer_login(dados: DadosLogin, db: Session = Depends(obter_db)):
    """Autentica o usuário e retorna um token JWT válido por 24 horas."""

    usuario = db.query(UsuarioDB).filter(UsuarioDB.email == dados.email).first()

    if not usuario or not verificar_senha(dados.senha, usuario.senha_hash):
        raise HTTPException(status_code=401, detail="Email ou senha incorretos")

    if not usuario.ativo:
        raise HTTPException(status_code=403, detail="Conta desativada")

    token = criar_token({"sub": usuario.id, "tipo": usuario.tipo})
    return {"access_token": token, "token_type": "bearer"}


# =========================
# GET /usuarios/me
# =========================
@roteador.get("/me", response_model=UsuarioResposta)
def meu_perfil(usuario: UsuarioDB = Depends(obter_usuario_atual)):
    """Retorna os dados do usuário autenticado."""
    return usuario
