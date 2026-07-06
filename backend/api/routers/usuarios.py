
"""
routers/usuarios.py - Rotas relacionadas a usuários (cadastro e login)
Cada função aqui é um endpoint da API — uma URL que o frontend pode chamar.
"""
 
 
from fastapi import APIRouter, Depends, HTTPException, status   # Ferramentas do FastAPI
from sqlalchemy.orm import Session                              # Para trabalhar com sessões do banco
 
from ..database import get_db                  # Função para obter sessão do banco
from ..models.usuario import UsuarioDB         # Modelo do usuário no banco
from ..schemas.usuario import (
    PassageiroCreate,    # Dados para criar passageiro
    MotoristaCreate,     # Dados para criar motorista
    UsuarioResponse,     # Dados que retornamos (sem senha)
    LoginRequest,        # Dados do login
    Token                # Token JWT que retornamos após login
)
from ..auth import hash_senha, verificar_senha, criar_token_acesso, obter_usuario_atual
 
 
# Cria o grupo de rotas para usuários
# prefix e tags são definidos no main.py quando incluímos este router
router = APIRouter()
 
 
# ===================== CADASTRO DE PASSAGEIRO =====================
@router.post(
    "/passageiro",           # URL completa: POST /usuarios/passageiro
    response_model=UsuarioResponse,   # Define o formato da resposta — sem senha_hash
    status_code=201          # 201 = Created — recurso criado com sucesso
)
def cadastrar_passageiro(
    dados: PassageiroCreate,          # Dados validados pelo Pydantic automaticamente
    db: Session = Depends(get_db)     # Sessão do banco injetada automaticamente pelo FastAPI
):
    """Cadastra um novo passageiro no sistema."""
 
    # Verifica se o CPF já está cadastrado — CPF deve ser único
    if db.query(UsuarioDB).filter(UsuarioDB.cpf == dados.cpf).first():
        raise HTTPException(
            status_code=400,           # 400 = Bad Request — dados inválidos
            detail="CPF já cadastrado"
        )
 
    # Verifica se o email já está cadastrado — email deve ser único
    if db.query(UsuarioDB).filter(UsuarioDB.email == dados.email).first():
        raise HTTPException(
            status_code=400,
            detail="Email já cadastrado"
        )
 
    # Cria o objeto do novo usuário com os dados validados
    novo_usuario = UsuarioDB(
        nome=dados.nome,                      # Nome do formulário
        cpf=dados.cpf,                        # CPF do formulário
        email=dados.email,                    # Email do formulário
        senha_hash=hash_senha(dados.senha),   # Senha NUNCA salva em texto plano — sempre hash
        telefone=dados.telefone,              # Telefone do formulário
        tipo="passageiro",                    # Tipo definido pelo servidor — não pelo usuário
    )
 
    db.add(novo_usuario)      # Prepara o objeto para inserção no banco
    db.commit()               # Executa o INSERT no banco — torna permanente
    db.refresh(novo_usuario)  # Recarrega do banco para obter campos gerados (id, criado_em)
 
    return novo_usuario   # FastAPI filtra com UsuarioResponse — remove senha_hash
 
 
# ===================== CADASTRO DE MOTORISTA =====================
@router.post(
    "/motorista",
    response_model=UsuarioResponse,
    status_code=201
)
def cadastrar_motorista(
    dados: MotoristaCreate,
    db: Session = Depends(get_db)
):
    """Cadastra um novo motorista no sistema."""
 
    # Mesmas verificações de duplicata do passageiro
    if db.query(UsuarioDB).filter(UsuarioDB.cpf == dados.cpf).first():
        raise HTTPException(status_code=400, detail="CPF já cadastrado")
 
    if db.query(UsuarioDB).filter(UsuarioDB.email == dados.email).first():
        raise HTTPException(status_code=400, detail="Email já cadastrado")
 
    # Motorista tem mais campos que passageiro
    novo_usuario = UsuarioDB(
        nome=dados.nome,
        cpf=dados.cpf,
        email=dados.email,
        senha_hash=hash_senha(dados.senha),   # Senha sempre hashada
        telefone=dados.telefone,
        tipo="motorista",                     # Tipo definido pelo servidor
        cnh=dados.cnh,                        # Campos exclusivos do motorista
        placa=dados.placa,
        modelo_veiculo=dados.modelo_veiculo,
        tipo_veiculo=dados.tipo_veiculo,
    )
 
    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)
 
    return novo_usuario
 
 
# ===================== LOGIN =====================
@router.post(
    "/login",
    response_model=Token   # Retorna o token JWT — não os dados do usuário
)
def fazer_login(
    dados: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    Autentica o usuário e retorna um token JWT válido por 24 horas.
    O frontend deve guardar este token e enviá-lo em todas as próximas requisições.
    """
 
    # Busca o usuário pelo email no banco
    usuario = db.query(UsuarioDB).filter(UsuarioDB.email == dados.email).first()
 
    # Verificação combinada — não dizemos se é o email ou a senha que está errado (segurança)
    if not usuario or not verificar_senha(dados.senha, usuario.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,   # 401 = Não autenticado
            detail="Email ou senha incorretos"           # Mensagem genérica — não revela qual campo está errado
        )
 
    if not usuario.ativo:
        # Conta existe e senha correta, mas a conta foi desativada
        raise HTTPException(status_code=403, detail="Conta desativada")
 
    # Cria o token JWT com os dados do usuário
    token = criar_token_acesso({
        "sub": usuario.id,     # "sub" = subject — ID do usuário autenticado (padrão JWT)
        "tipo": usuario.tipo   # Tipo para saber se é passageiro ou motorista sem buscar no banco
    })
 
    return {"access_token": token, "token_type": "bearer"}   # Retorna o token para o frontend
 
 
# ===================== PERFIL DO USUÁRIO LOGADO =====================
@router.get(
    "/me",
    response_model=UsuarioResponse   # Retorna os dados do usuário — sem senha_hash
)
def meu_perfil(
    usuario_atual: UsuarioDB = Depends(obter_usuario_atual)   # Dependência: verifica o token e retorna o usuário
):
    """
    Retorna os dados do usuário que está logado.
    Não precisa de parâmetros — o usuário é identificado pelo token JWT no header.
    """
    return usuario_atual   # FastAPI filtra com UsuarioResponse automaticamente
