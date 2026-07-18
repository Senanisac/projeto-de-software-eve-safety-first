
"""
models/__init__.py - Ponto de entrada dos modelos
Importa todos os modelos para garantir que o SQLAlchemy os conheça
antes de criar as tabelas com Base.metadata.create_all().
A ordem de importação importa — pagamento antes de corrida antes de usuario.
"""
 
from .pagamento import PagamentoDB   # Importado primeiro — não depende dos outros
from .corrida import CorridaDB       # Importado segundo — depende de PagamentoDB
from .usuario import UsuarioDB       # Importado por último — depende dos dois acima
from .avaliacao import AvaliacaoDB 


