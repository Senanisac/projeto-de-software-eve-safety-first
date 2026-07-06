
"""
database.py - Configuração da conexão com o banco de dados
Este arquivo é responsável por conectar a API ao banco de dados SQLite.
"""
 
 
import os                                    # Para ler variáveis de ambiente
from sqlalchemy import create_engine         # Cria o motor de conexão com o banco
from sqlalchemy.orm import sessionmaker      # Cria fábricas de sessão
from sqlalchemy.orm import DeclarativeBase   # Classe base para os modelos (tabelas)
from dotenv import load_dotenv               # Lê o arquivo .env automaticamente
 
 
# ===================== CARREGAR CONFIGURAÇÕES =====================
load_dotenv()   # Lê o arquivo .env e carrega as variáveis de ambiente
 
 
# Pega a URL do banco definida no .env — se não existir, usa SQLite como padrão
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./eve.db"   # Banco local chamado eve.db criado na raiz do projeto
)
 
 
# ===================== CRIAR O MOTOR DO BANCO =====================
# O engine é o "motor" que conecta Python ao banco de dados
# Ele sabe como enviar queries SQL e receber respostas
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}   # Necessário para SQLite — permite múltiplos threads
)
 
 
# ===================== CRIAR FÁBRICA DE SESSÕES =====================
# SessionLocal é uma fábrica — cada vez que chamamos SessionLocal() ela cria uma nova sessão
# Uma sessão é uma "conversa" temporária com o banco para fazer operações
SessionLocal = sessionmaker(
    autocommit=False,   # Não salva automaticamente — precisamos chamar db.commit() manualmente
    autoflush=False,    # Não sincroniza automaticamente com o banco — mais controle para nós
    bind=engine         # Liga esta fábrica ao engine que criamos acima
)
 
 
# ===================== BASE PARA OS MODELOS =====================
# Todas as classes de tabela (models) vão herdar desta Base
# Isso permite que o SQLAlchemy saiba que são tabelas do banco
class Base(DeclarativeBase):
    pass   # Não precisa de conteúdo — só existe para ser a classe pai de todos os modelos
 
 
# ===================== FUNÇÃO PARA OBTER SESSÃO =====================
def get_db():
    """
    Função geradora usada como dependência nos endpoints do FastAPI.
    Ela abre uma sessão do banco, entrega para o endpoint usar,
    e fecha automaticamente quando o endpoint termina — mesmo se der erro.
    """
    db = SessionLocal()   # Abre uma nova sessão do banco
    try:
        yield db          # Entrega a sessão para o endpoint (pausa aqui enquanto o endpoint roda)
    finally:
        db.close()        # Fecha a sessão sempre — mesmo se acontecer uma exceção
