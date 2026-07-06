
"""
models/pagamento.py - Modelo de Banco de Dados para Pagamentos
Este arquivo define como os pagamentos serão salvos no banco de dados.
Criado antes de corrida.py porque corrida.py importa este arquivo.
"""
 
 
import uuid                                          # Para gerar IDs únicos
from datetime import datetime                        # Para registrar data e hora do pagamento
from sqlalchemy import String, Float, ForeignKey, DateTime   # Tipos de colunas SQL
from sqlalchemy.orm import Mapped, mapped_column, relationship  # ORM moderno do SQLAlchemy
 
from ..database import Base   # Base que todas as tabelas herdam
 
 
# ===================== MODELO DE PAGAMENTO NO BANCO =====================
class PagamentoDB(Base):
    """
    Representa a tabela 'pagamentos' no banco de dados.
    Cada linha desta tabela é um pagamento de uma corrida.
    """
 
    __tablename__ = "pagamentos"   # Nome exato da tabela no banco
 
 
    # ===================== COLUNAS PRINCIPAIS =====================
 
    # ID único do pagamento — gerado automaticamente como UUID
    id: Mapped[str] = mapped_column(
        String(36),                              # String de 36 caracteres (tamanho padrão de UUID)
        primary_key=True,                        # Chave primária — identifica unicamente cada pagamento
        default=lambda: str(uuid.uuid4())        # Gera um UUID novo automaticamente em cada inserção
    )
 
    # ID da corrida que está sendo paga — referencia a tabela corridas
    corrida_id: Mapped[str] = mapped_column(
        String(36),                              # Mesmo tamanho do ID da corrida
        ForeignKey("corridas.id"),               # Chave estrangeira — corrida deve existir na tabela corridas
        nullable=False                           # Obrigatório — todo pagamento precisa de uma corrida
    )
 
    # ID do usuário que está pagando — referencia a tabela usuarios
    usuario_id: Mapped[str] = mapped_column(
        String(36),                              # Mesmo tamanho do ID do usuário
        ForeignKey("usuarios.id"),               # Chave estrangeira — usuário deve existir na tabela usuarios
        nullable=False                           # Obrigatório — todo pagamento precisa de um usuário
    )
 
    # Valor pago — copiado da corrida no momento do pagamento
    valor: Mapped[float] = mapped_column(
        Float,                                   # Número decimal (ex: 59.38)
        nullable=False                           # Obrigatório — não existe pagamento sem valor
    )
 
    # Método de pagamento escolhido pelo passageiro
    metodo: Mapped[str] = mapped_column(
        String(20),                              # String curta — "pix", "cartao" ou "dinheiro"
        nullable=False                           # Obrigatório — precisa informar como vai pagar
    )
 
    # Status atual do pagamento
    status: Mapped[str] = mapped_column(
        String(20),                              # String curta — "pendente", "aprovado" ou "recusado"
        default="pendente"                       # Todo pagamento começa como pendente
    )
 
    # Data e hora em que o pagamento foi criado
    criado_em: Mapped[datetime] = mapped_column(
        DateTime,                                # Tipo data+hora do SQL
        default=datetime.utcnow                  # Preenchido automaticamente com o momento atual
    )
 
 
    # ===================== RELACIONAMENTOS =====================
 
    # Acesso direto ao objeto CorridaDB — definido depois para evitar importação circular
    corrida: Mapped["CorridaDB"] = relationship(
        "CorridaDB",                             # Nome da classe relacionada (string para evitar erro de importação)
        back_populates="pagamento"               # Em CorridaDB, o atributo oposto se chama "pagamento"
    )
 
    # Acesso direto ao objeto UsuarioDB
    usuario: Mapped["UsuarioDB"] = relationship(
        "UsuarioDB",                             # Nome da classe relacionada
        back_populates="pagamentos"              # Em UsuarioDB, o atributo oposto se chama "pagamentos"
    )
 
 
    # ===================== REPRESENTAÇÃO PARA DEBUG =====================
    def __repr__(self):
        # Mostra informações úteis quando printamos o objeto no terminal
        return f"<Pagamento R${self.valor} via {self.metodo} ({self.status})>"

