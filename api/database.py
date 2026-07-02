
"""
database.py - Conexão com SQLite usando SQLAlchemy
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

# Arquivo SQLite criado automaticamente na raiz do projeto
SQLALCHEMY_DATABASE_URL = "sqlite:///./eve.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}  # necessário para SQLite + FastAPI
)

SessaoLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

def obter_db():
    """
    Gerador de sessão do banco — usado como dependência nos endpoints.
    Abre uma sessão, fornece para o endpoint, e fecha automaticamente ao final.
    """
    db = SessaoLocal()
    try:
        yield db
    finally:
        db.close()

