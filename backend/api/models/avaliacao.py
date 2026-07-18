
"""
models/avaliacao.py - Modelo de Banco de Dados para Avaliações
Define como as avaliações dos motoristas são guardadas no banco.
"""

import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Float, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..database import Base


class AvaliacaoDB(Base):
    __tablename__ = "avaliacoes"

    # ID único da avaliação
    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )

    # ID do passageiro que avaliou
    passageiro_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("usuarios.id"),
        nullable=False
    )

    # ID do motorista avaliado
    motorista_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("usuarios.id"),
        nullable=False
    )

    # ID da corrida avaliada — cada corrida só pode ser avaliada uma vez
    corrida_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("corridas.id"),
        nullable=False,
        unique=True   # Uma corrida só pode ter uma avaliação
    )

    # Nota de 1 a 5
    nota: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    # Comentário opcional
    comentario: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
        default=None
    )

    # Data e hora da avaliação
    criado_em: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )

    # Relacionamentos
    passageiro: Mapped["UsuarioDB"] = relationship(
        "UsuarioDB",
        foreign_keys=[passageiro_id]
    )

    motorista: Mapped["UsuarioDB"] = relationship(
        "UsuarioDB",
        foreign_keys=[motorista_id]
    )

    corrida: Mapped["CorridaDB"] = relationship(
        "CorridaDB",
        foreign_keys=[corrida_id]
    )

    def __repr__(self):
        return f"<Avaliacao nota={self.nota} corrida={self.corrida_id}>"
    