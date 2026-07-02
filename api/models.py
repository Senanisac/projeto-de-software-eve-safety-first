
"""
models.py - Tabelas SQL (SQLAlchemy ORM)
Cada classe representa uma tabela no banco de dados SQLite.
"""

import uuid
from datetime import datetime
from sqlalchemy import String, Float, Boolean, Integer, DateTime, ForeignKey, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from api.database import Base


# =========================
# TABELA: usuarios
# =========================
class UsuarioDB(Base):
    __tablename__ = "usuarios"

    id              : Mapped[str]                  = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    nome            : Mapped[str]                  = mapped_column(String(100), nullable=False)
    cpf             : Mapped[str]                  = mapped_column(String(11), unique=True, nullable=False)
    email           : Mapped[str]                  = mapped_column(String(100), unique=True, nullable=False)
    senha_hash      : Mapped[str]                  = mapped_column(String(255), nullable=False)
    telefone        : Mapped[str]                  = mapped_column(String(20), nullable=False)
    tipo            : Mapped[str]                  = mapped_column(Enum("passageiro", "motorista", name="tipo_usuario"), nullable=False)
    ativo           : Mapped[bool]                 = mapped_column(Boolean, default=True)
    criado_em       : Mapped[datetime]             = mapped_column(DateTime, default=datetime.utcnow)

    # Campos exclusivos do motorista (nulos para passageiros
    cnh             : Mapped[str | None]           = mapped_column(String(20), nullable=True)
    placa           : Mapped[str | None]           = mapped_column(String(10), nullable=True)
    modelo_veiculo  : Mapped[str | None]           = mapped_column(String(50), nullable=True)
    tipo_veiculo    : Mapped[str | None]           = mapped_column(Enum("Moto", "Carro", "VIP", name="tipo_veiculo"), nullable=True)
    cancelamentos   : Mapped[int]                  = mapped_column(Integer, default=0)

    # Relacionamentos com outras tabelas
    corridas        : Mapped[list["CorridaDB"]]    = relationship("CorridaDB", back_populates="passageiro")
    pagamentos      : Mapped[list["PagamentoDB"]]  = relationship("PagamentoDB", back_populates="usuario")


# =========================
# TABELA: corridas
# =========================
class CorridaDB(Base):
    __tablename__ = "corridas"
 
    id            : Mapped[str]         = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    passageiro_id : Mapped[str]         = mapped_column(ForeignKey("usuarios.id"), nullable=False)
    origem        : Mapped[str]         = mapped_column(String(200), nullable=False)
    destino       : Mapped[str]         = mapped_column(String(200), nullable=False)
    distancia     : Mapped[float]       = mapped_column(Float, default=0)
    tipo_veiculo  : Mapped[str]         = mapped_column(Enum("Moto", "Carro", "VIP", name="tipo_veiculo_corrida"), nullable=False)
    valor         : Mapped[float]       = mapped_column(Float, default=0)
    status        : Mapped[str]         = mapped_column( Enum("pendente", "confirmada", "finalizada", "cancelada", name="status_corrida"), default="pendente")
    criado_em     : Mapped[datetime]    = mapped_column(DateTime, default=datetime.utcnow)
 
    # Relacionamentos
    passageiro    : Mapped["UsuarioDB"]    = relationship("UsuarioDB", back_populates="corridas")
    pagamento     : Mapped["PagamentoDB"]  = relationship("PagamentoDB", back_populates="corrida", uselist=False)


# =========================
# TABELA: pagamentos
# =========================
class PagamentoDB(Base):
    __tablename__ = "pagamentos"
 
    id         : Mapped[str]          = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    corrida_id : Mapped[str]          = mapped_column(ForeignKey("corridas.id"), nullable=False)
    usuario_id : Mapped[str]          = mapped_column(ForeignKey("usuarios.id"), nullable=False)
    valor      : Mapped[float]        = mapped_column(Float, nullable=False)
    metodo     : Mapped[str]          = mapped_column(Enum("pix", "cartao", "dinheiro", name="metodo_pagamento"), nullable=False)
    status     : Mapped[str]          = mapped_column(Enum("pendente", "aprovado", "recusado", name="status_pagamento"), default="pendente")
    criado_em  : Mapped[datetime]     = mapped_column(DateTime, default=datetime.utcnow)
 
    # Relacionamentos
    corrida    : Mapped["CorridaDB"]  = relationship("CorridaDB", back_populates="pagamento")
    usuario    : Mapped["UsuarioDB"]  = relationship("UsuarioDB", back_populates="pagamentos")
 
