
"""
models/usuario.py - Modelo de Banco de Dados para Usuários
Este arquivo define como os usuários serão salvos no banco de dados.
"""
 
 
import uuid                                                      # Para gerar IDs únicos automaticamente
from datetime import datetime                                    # Para registrar quando o usuário foi criado
from sqlalchemy import String, Boolean, Integer, DateTime        # Tipos de colunas SQL
from sqlalchemy.orm import Mapped, mapped_column, relationship   # ORM moderno do SQLAlchemy
 
from ..database import Base   # Base que todas as tabelas herdam
 

# ===================== MODELO DE USUÁRIO NO BANCO =====================
class UsuarioDB(Base):
    """
    Representa a tabela 'usuarios' no banco de dados.
    Passageiros e motoristas são salvos na mesma tabela — diferenciados pelo campo 'tipo'.
    Campos exclusivos do motorista ficam NULL para passageiros.
    """
 
    __tablename__ = "usuarios"   # Nome exato da tabela no banco
 
 
    # ===================== COLUNAS COMUNS (passageiro e motorista) =====================
 
    # ID único do usuário — gerado automaticamente como UUID
    id: Mapped[str] = mapped_column(
        String(36),                              # String de 36 caracteres (tamanho padrão de UUID)
        primary_key=True,                        # Chave primária — identifica unicamente cada usuário
        default=lambda: str(uuid.uuid4()),       # Gera um UUID novo automaticamente em cada inserção
        index=True                               # Cria índice para buscas por ID mais rápidas
    )
 
    # Nome completo do usuário
    nome: Mapped[str] = mapped_column(
        String(100),                             # Até 100 caracteres
        nullable=False                           # Obrigatório — não pode ser vazio
    )
 
    # CPF do usuário — único no sistema
    cpf: Mapped[str] = mapped_column(
        String(11),                              # Exatamente 11 dígitos numéricos
        unique=True,                             # Dois usuários não podem ter o mesmo CPF
        nullable=False,                          # Obrigatório
        index=True                               # Índice para buscas por CPF mais rápidas
    )
 
    # Email do usuário — único no sistema
    email: Mapped[str] = mapped_column(
        String(100),                             # Até 100 caracteres
        unique=True,                             # Dois usuários não podem ter o mesmo email
        nullable=False,                          # Obrigatório
        index=True                               # Índice para buscas por email mais rápidas (usado no login)
    )
 
    # Senha armazenada SEMPRE como hash bcrypt — nunca em texto plano
    senha_hash: Mapped[str] = mapped_column(
        String(255),                             # Hash bcrypt tem sempre 60 caracteres, mas usamos 255 por segurança
        nullable=False                           # Obrigatório — todo usuário precisa de senha
    )
 
    # Telefone do usuário
    telefone: Mapped[str] = mapped_column(
        String(20),                              # Até 20 caracteres (inclui formatação)
        nullable=False                           # Obrigatório
    )
 
    # Tipo do usuário — define o que ele pode fazer no sistema
    tipo: Mapped[str] = mapped_column(
        String(20),                              # "passageiro" ou "motorista"
        nullable=False                           # Obrigatório — todo usuário tem um tipo
    )
 
    # Se a conta está ativa ou não — permite desativar sem deletar
    ativo: Mapped[bool] = mapped_column(
        Boolean,                                 # Verdadeiro ou Falso
        default=True                             # Todo usuário começa com a conta ativa
    )
 
    # Data e hora em que o usuário foi cadastrado
    criado_em: Mapped[datetime] = mapped_column(
        DateTime,                                # Tipo data+hora do SQL
        default=datetime.utcnow                  # Preenchido automaticamente com o momento atual
    )
 
 
    # ===================== COLUNAS EXCLUSIVAS DO MOTORISTA =====================
    # Estes campos ficam NULL para passageiros — são opcionais na tabela
 
    # Número da CNH do motorista
    cnh: Mapped[str | None] = mapped_column(
        String(20),                              # Até 20 caracteres
        nullable=True                            # Opcional — NULL para passageiros
    )
 
    # Placa do veículo do motorista
    placa: Mapped[str | None] = mapped_column(
        String(10),                              # Até 10 caracteres (ex: ABC-1234)
        nullable=True                            # Opcional — NULL para passageiros
    )
 
    # Modelo do veículo do motorista
    modelo_veiculo: Mapped[str | None] = mapped_column(
        String(50),                              # Até 50 caracteres (ex: Toyota Corolla)
        nullable=True                            # Opcional — NULL para passageiros
    )
 
    # Tipo do veículo do motorista
    tipo_veiculo: Mapped[str | None] = mapped_column(
        String(10),                              # "Moto", "Carro" ou "VIP"
        nullable=True                            # Opcional — NULL para passageiros
    )
 
    # Contador de cancelamentos do motorista no dia
    cancelamentos: Mapped[int] = mapped_column(
        Integer,                                 # Número inteiro
        default=0                                # Começa em zero — sem cancelamentos
    )

    # Data do último cancelamento — usada para resetar o contador diariamente
    data_ultimo_cancelamento: Mapped[str | None] = mapped_column(
        String(10),                              # Formato "YYYY-MM-DD" — ex: "2026-07-07"
        nullable=True,                           # Null se nunca cancelou
        default=None                             # Começa sem data
    )
 
    # ===================== RELACIONAMENTOS =====================
 
    # Lista de corridas do passageiro — acesso direto sem query manual
    corridas: Mapped[list["CorridaDB"]] = relationship(
        "CorridaDB",                             # Nome da classe relacionada
        back_populates="passageiro",             # Em CorridaDB, o atributo oposto se chama "passageiro"
        cascade="all, delete-orphan"             # Se o usuário for deletado, as corridas também são
    )
 
    # Lista de pagamentos do usuário — acesso direto sem query manual
    pagamentos: Mapped[list["PagamentoDB"]] = relationship(
        "PagamentoDB",                           # Nome da classe relacionada
        back_populates="usuario"                 # Em PagamentoDB, o atributo oposto se chama "usuario"
    )
 
 
    # ===================== REPRESENTAÇÃO PARA DEBUG =====================
    def __repr__(self):
        # Mostra informações úteis quando printamos o objeto no terminal
        return f"<Usuario {self.nome} ({self.tipo})>"

