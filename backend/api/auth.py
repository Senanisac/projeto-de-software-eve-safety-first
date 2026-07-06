
"""
auth.py - Sistema completo de autenticação
Responsável por: senhas seguras com bcrypt, tokens JWT e proteção de rotas.
"""
 
 
import os                                    # Para ler variáveis de ambiente
import bcrypt                                # Para fazer hash seguro de senhas
from datetime import datetime, timedelta     # Para calcular expiração do token
from jose import JWTError, jwt               # Para criar e decodificar tokens JWT
from fastapi import Depends, HTTPException   # Para criar dependências e erros HTTP
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials   # Para ler o token do header
from sqlalchemy.orm import Session           # Para trabalhar com sessões do banco
from dotenv import load_dotenv               # Para carregar o arquivo .env
 
 
# Importamos as coisas que vamos precisar de outros módulos
from .database import get_db                 # Função para obter sessão do banco
from .models.usuario import UsuarioDB        # Modelo do usuário no banco
from .schemas.usuario import TokenData       # Schema com os dados dentro do token
 
 
load_dotenv()   # Carrega as variáveis do arquivo .env antes de usar os os.getenv()
 
 
# ===================== CONFIGURAÇÕES DE SEGURANÇA =====================
SECRET_KEY = os.getenv("SECRET_KEY")   # Chave secreta para assinar os tokens — vem do .env
 
ALGORITHM = os.getenv(
    "ALGORITHM",
    "HS256"                            # Algoritmo padrão se não definido no .env
)
 
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv(
    "ACCESS_TOKEN_EXPIRE_MINUTES",
    1440                               # 1440 minutos = 24 horas se não definido no .env
))
 
# HTTPBearer lê o token do header "Authorization: Bearer <token>"
# Mostra um campo simples no Swagger para colar o token diretamente
esquema_bearer = HTTPBearer()
 
 
# ===================== FUNÇÕES PARA SENHAS =====================
def hash_senha(senha: str) -> str:
    """
    Transforma a senha em texto plano num hash seguro usando bcrypt.
    bcrypt adiciona salt automático — mesmo duas senhas iguais geram hashes diferentes.
    bcrypt é lento por design — dificulta ataques de força bruta.
    """
    return bcrypt.hashpw(
        senha.encode("utf-8"),    # Converte a string para bytes (bcrypt precisa de bytes)
        bcrypt.gensalt()          # Gera um salt aleatório único para esta senha
    ).decode("utf-8")             # Converte o resultado de bytes para string (para salvar no banco)
 
 
def verificar_senha(senha_digitada: str, senha_hashed: str) -> bool:
    """
    Compara a senha que o usuário digitou com o hash salvo no banco.
    Retorna True se a senha estiver correta, False caso contrário.
    O salt está embutido no hash — bcrypt sabe como extraí-lo para comparar.
    """
    return bcrypt.checkpw(
        senha_digitada.encode("utf-8"),   # Converte a senha digitada para bytes
        senha_hashed.encode("utf-8")      # Converte o hash salvo para bytes
    )
 
 
# ===================== FUNÇÕES JWT (TOKENS) =====================
def criar_token_acesso(dados: dict) -> str:
    """
    Cria um token JWT assinado com a chave secreta.
    O token carrega os dados do usuário e tem prazo de validade.
    Após o prazo, o token não é mais aceito — o usuário precisa fazer login novamente.
    """
    dados_para_codificar = dados.copy()   # Copia o dicionário para não modificar o original
 
    # Calcula o momento exato em que o token vai expirar
    expiracao = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
 
    dados_para_codificar.update({"exp": expiracao})   # Adiciona a expiração ao payload do token
 
    # Cria e retorna o token JWT assinado — só o servidor com SECRET_KEY pode verificar
    return jwt.encode(dados_para_codificar, SECRET_KEY, algorithm=ALGORITHM)
 
 
def verificar_token(token: str) -> TokenData:
    """
    Decodifica e valida o token JWT recebido.
    Retorna os dados do usuário se o token for válido.
    Lança HTTPException 401 se o token for inválido ou expirado.
    """
    # Prepara o erro padrão para token inválido
    erro_credenciais = HTTPException(
        status_code=401,                          # 401 = Não autenticado
        detail="Token inválido ou expirado",      # Mensagem de erro
        headers={"WWW-Authenticate": "Bearer"}    # Header padrão para erros de autenticação
    )
 
    try:
        # Decodifica o token — verifica a assinatura e a expiração automaticamente
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
 
        id_usuario: str = payload.get("sub")       # Extrai o ID do usuário (campo "sub" = subject)
        tipo_usuario: str = payload.get("tipo")    # Extrai o tipo do usuário
 
        # Se algum dos campos obrigatórios estiver ausente, o token é inválido
        if id_usuario is None or tipo_usuario is None:
            raise erro_credenciais
 
        # Retorna os dados extraídos do token
        return TokenData(id=id_usuario, tipo=tipo_usuario)
 
    except JWTError:
        # JWTError é lançado quando o token é inválido, malformado ou expirado
        raise erro_credenciais
 
 
# ===================== DEPENDÊNCIAS PARA ROTAS PROTEGIDAS =====================
def obter_usuario_atual(
    credenciais: HTTPAuthorizationCredentials = Depends(esquema_bearer),   # Lê o token do header
    db: Session = Depends(get_db)                                          # Abre sessão do banco
) -> UsuarioDB:
    """
    Dependência FastAPI usada em rotas que exigem autenticação.
    Lê o token do header Authorization, valida, e retorna o objeto completo do usuário.
    Se o token for inválido, a rota não é executada — o erro é retornado automaticamente.
    """
    dados = verificar_token(credenciais.credentials)   # Extrai e valida o token do header
 
    # Busca o usuário completo no banco usando o ID extraído do token
    usuario = db.query(UsuarioDB).filter(UsuarioDB.id == dados.id).first()
 
    if usuario is None:
        # O token é válido mas o usuário foi deletado do banco
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
 
    if not usuario.ativo:
        # O usuário existe mas a conta foi desativada
        raise HTTPException(status_code=403, detail="Conta desativada")
 
    return usuario   # Retorna o objeto UsuarioDB completo para a rota usar
 
 
def exigir_passageiro(usuario_atual: UsuarioDB = Depends(obter_usuario_atual)) -> UsuarioDB:
    """
    Dependência que garante acesso apenas para passageiros.
    Usa obter_usuario_atual primeiro — se não estiver logado, já retorna erro antes.
    """
    if usuario_atual.tipo != "passageiro":
        # Usuário está logado mas não é passageiro
        raise HTTPException(status_code=403, detail="Acesso permitido apenas para passageiros")
    return usuario_atual   # Retorna o usuário se for passageiro
 
 
def exigir_motorista(usuario_atual: UsuarioDB = Depends(obter_usuario_atual)) -> UsuarioDB:
    """
    Dependência que garante acesso apenas para motoristas.
    Usa obter_usuario_atual primeiro — se não estiver logado, já retorna erro antes.
    """
    if usuario_atual.tipo != "motorista":
        # Usuário está logado mas não é motorista
        raise HTTPException(status_code=403, detail="Acesso permitido apenas para motoristas")
    return usuario_atual   # Retorna o usuário se for motorista
