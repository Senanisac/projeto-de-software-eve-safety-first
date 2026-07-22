
"""
models/suporte.py - Modelo de Banco de Dados para Mensagens de Suporte
Define como as mensagens de suporte são guardadas no banco.
"""

import uuid
from datetime import datetime
from sqlalchemy import String, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..database import Base


class SuporteDB(Base):
    __tablename__ = "suporte"

    # ID único da mensagem
    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )

    # ID do utilizador que enviou a mensagem
    usuario_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("usuarios.id"),
        nullable=False
    )

    # Assunto da mensagem
    assunto: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    # Conteúdo da mensagem
    mensagem: Mapped[str] = mapped_column(
        String(1000),
        nullable=False
    )

    # Status da mensagem — pendente ou respondida
    status: Mapped[str] = mapped_column(
        String(20),
        default="pendente"   # Toda mensagem começa como pendente
    )

    # Data e hora do envio
    criado_em: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )

    # Relacionamento com o utilizador
    usuario: Mapped["UsuarioDB"] = relationship(
        "UsuarioDB",
        foreign_keys=[usuario_id]
    )

    def __repr__(self):
        return f"<Suporte {self.assunto} ({self.status})>"
    
    