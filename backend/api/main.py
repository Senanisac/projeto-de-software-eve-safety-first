
"""
main.py - Ponto de entrada da API Eve Safety First
Este é o arquivo principal que inicia o servidor FastAPI.
Execute com: python -m uvicorn backend.api.main:app --reload
"""
 
 
from fastapi import FastAPI                        # Framework principal para criar a API
from fastapi.middleware.cors import CORSMiddleware  # Permite o frontend acessar a API
 
# Importamos a Base e o engine para criar as tabelas automaticamente
from .database import engine, Base
 
# IMPORTANTE: importar todos os modelos ANTES do create_all()
# O SQLAlchemy precisa conhecer todas as tabelas para criar as relações corretamente
from .models import PagamentoDB, CorridaDB, UsuarioDB, AvaliacaoDB   # noqa: F401 — importado por efeito colateral
 
# Importamos os grupos de rotas (routers)
from .routers import usuarios, corridas, pagamentos, avaliacoes
 
 
# ===================== CRIAÇÃO DAS TABELAS NO BANCO =====================
# Cria automaticamente todas as tabelas no banco quando a API inicia
# Se as tabelas já existirem, não faz nada — os dados existentes são preservados
Base.metadata.create_all(bind=engine)
 
 
# ===================== CRIAÇÃO DA APLICAÇÃO FASTAPI =====================
app = FastAPI(
    title="Eve Safety First — API",                           # Título na documentação /docs
    description="API REST do sistema de transporte Eve Safety First",
    version="1.0.0",
    docs_url="/docs"                                         # URL da documentação Swagger
)
 
 
# ===================== CONFIGURAÇÃO CORS =====================
# CORS permite que o frontend React (porta 5173) chame esta API (porta 8000)
# Sem isto, o navegador bloquearia todas as requisições do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # Em produção: substituir por ["http://localhost:5173", "https://seusite.com"]
    allow_credentials=True,       # Permite envio de cookies e headers de autenticação
    allow_methods=["*"],          # Permite GET, POST, PUT, PATCH, DELETE, etc.
    allow_headers=["*"],          # Permite todos os headers — incluindo Authorization
)
 
 
# ===================== INCLUSÃO DAS ROTAS =====================
# Cada router agrupa endpoints relacionados — melhor organização do código
app.include_router(
    usuarios.router,              # Router com cadastro e login
    prefix="/usuarios",           # Todas as rotas começam com /usuarios
    tags=["Usuários"]             # Agrupamento na documentação /docs
)
 
app.include_router(
    corridas.router,              # Router com criação e gestão de corridas
    prefix="/corridas",           # Todas as rotas começam com /corridas
    tags=["Corridas"]
)
 
app.include_router(
    pagamentos.router,            # Router com processamento de pagamentos
    prefix="/pagamentos",         # Todas as rotas começam com /pagamentos
    tags=["Pagamentos"]
)

app.include_router(
    avaliacoes.router,
    prefix="/avaliacoes",
    tags=["Avaliações"]
)
 
# ===================== ROTA INICIAL =====================
@app.get("/", tags=["Início"])
def pagina_inicial():
    """Rota simples para verificar se a API está funcionando."""
    return {
        "mensagem": "🚗 Eve Safety First API está rodando!",
        "versao": "1.0.0",
        "documentacao": "/docs"        # Link para a documentação Swagger
    }


#uvicorn api.main:app --reload
#python -m uvicorn backend.api.main:app --reload
#http://127.0.0.1:8000/docs
#npm run dev
#http://localhost:5173
