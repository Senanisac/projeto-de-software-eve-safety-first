
"""
models/corrida.py - Modelo de Banco de Dados para Corridas
Este arquivo define como as corridas serão salvas no banco de dados.
"""
 
 
import uuid                                                      # Para gerar IDs únicos
from datetime import datetime                                    # Para registrar data e hora da corrida
from sqlalchemy import String, Float, ForeignKey, DateTime       # Tipos de colunas SQL
from sqlalchemy.orm import Mapped, mapped_column, relationship   # ORM moderno do SQLAlchemy
 
from ..database import Base   # Base que todas as tabelas herdam
 
 
# ===================== MODELO DE CORRIDA NO BANCO =====================
class CorridaDB(Base):
    """
    Representa a tabela 'corridas' no banco de dados.
    Cada linha desta tabela é uma corrida solicitada por um passageiro.
    """
 
    __tablename__ = "corridas"   # Nome exato da tabela no banco
 
 
    # ===================== COLUNAS PRINCIPAIS =====================
 
    # ID único da corrida — gerado automaticamente como UUID
    id: Mapped[str] = mapped_column(
        String(36),                              # String de 36 caracteres (tamanho padrão de UUID)
        primary_key=True,                        # Chave primária — identifica unicamente cada corrida
        default=lambda: str(uuid.uuid4())        # Gera um UUID novo automaticamente em cada inserção
    )
 
    # ID do passageiro que solicitou a corrida — referencia a tabela usuarios
    passageiro_id: Mapped[str] = mapped_column(
        String(36),                              # Mesmo tamanho do ID do usuário
        ForeignKey("usuarios.id"),               # Chave estrangeira — passageiro deve existir na tabela usuarios
        nullable=False                           # Obrigatório — toda corrida precisa de um passageiro
    )

    # ID do motorista que aceitou a corrida — NULL enquanto nenhum motorista aceitou
    motorista_id: Mapped[str | None] = mapped_column(
        String(36),                              # Mesmo tamanho do ID do motorista
        ForeignKey("usuarios.id"),               # Referencia a tabela usuarios
        nullable=True,                           # NULL até um motorista aceitar
        default=None                             # Começa sem motorista atribuído
    )

    # Local de origem da corrida
    origem: Mapped[str] = mapped_column(
        String(200),                             # Até 200 caracteres para o endereço
        nullable=False                           # Obrigatório — toda corrida precisa de uma origem
    )
 
    # Local de destino da corrida
    destino: Mapped[str] = mapped_column(
        String(200),                             # Até 200 caracteres para o endereço
        nullable=False                           # Obrigatório — toda corrida precisa de um destino
    )
 
    # Distância calculada em quilômetros
    distancia: Mapped[float] = mapped_column(
        Float,                                   # Número decimal (ex: 12.5 km)
        default=0.0                              # Começa em zero — calculado pelo servidor
    )
 
    # Tipo do veículo escolhido pelo passageiro
    tipo_veiculo: Mapped[str] = mapped_column(
        String(10),                              # String curta — "Moto", "Carro" ou "VIP"
        nullable=False                           # Obrigatório — precisa escolher um veículo
    )
 
    # Valor total da corrida em reais
    valor: Mapped[float] = mapped_column(
        Float,                                   # Número decimal (ex: 59.38)
        default=0.0                              # Começa em zero — calculado pelo servidor
    )
 
    # Status atual da corrida — ciclo de vida completo
    status: Mapped[str] = mapped_column(
        String(20),                              # String curta — um dos 4 status possíveis
        default="pendente"                       # Toda corrida começa como pendente
        # Valores possíveis: "pendente" → "confirmada" → "finalizada" ou "cancelada"
    )
 
    # Data e hora em que a corrida foi criada
    criado_em: Mapped[datetime] = mapped_column(
        DateTime,                                # Tipo data+hora do SQL
        default=datetime.utcnow                  # Preenchido automaticamente com o momento atual
    )
 
 
    # ===================== RELACIONAMENTOS =====================
 
    # Acesso direto ao objeto UsuarioDB do passageiro desta corrida
    passageiro: Mapped["UsuarioDB"] = relationship(
        "UsuarioDB",                             # Nome da classe relacionada
        foreign_keys=[passageiro_id],            # Usa passageiro_id para este relacionamento
        back_populates="corridas"                # Em UsuarioDB, o atributo oposto se chama "corridas"
    )

    motorista: Mapped["UsuarioDB | None"] = relationship(
        "UsuarioDB",
        foreign_keys=[motorista_id],         # Usa motorista_id para este relacionamento
        back_populates="corridas_aceitas"    # Nome diferente em UsuarioDB
    )
 
    # Acesso direto ao objeto PagamentoDB desta corrida (pode ser None se ainda não foi pago)
    pagamento: Mapped["PagamentoDB"] = relationship(
        "PagamentoDB",                           # Nome da classe relacionada
        back_populates="corrida",                # Em PagamentoDB, o atributo oposto se chama "corrida"
        uselist=False                            # Uma corrida tem apenas UM pagamento (não uma lista)
    )
 
 
    # ===================== REPRESENTAÇÃO PARA DEBUG =====================
    def __repr__(self):
        # Mostra informações úteis quando printamos o objeto no terminal
        return f"<Corrida {self.origem} → {self.destino} | R${self.valor} ({self.status})>"
 
