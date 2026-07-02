
"""
api/main.py - Ponto de entrada da API Eve Safety First
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.database import engine, Base

from api.models import UsuarioDB, CorridaDB, PagamentoDB
from api.routers import usuarios, corridas, pagamentos


# Cria todas as tabelas no banco SQLite automaticamente ao iniciar
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Eve Safety First — API",
    description="API REST do sistema de transporte Eve Safety First",
    version="1.0.0"
)


# Middleware CORS — permite que o frontend (React) faça chamadas à API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"], 
)


# Registra os roteadores de cada módulo
app.include_router(usuarios.roteador)
app.include_router(corridas.roteador)
app.include_router(pagamentos.roteador)


@app.get("/", tags=["Início"])
def pagina_inicial():
    """Verifica se a API está no ar."""
    return {
        "mensagem": "Eve Safety First API 🚗",
        "versao":   "1.0.0",
        "docs":     "/docs"
    }


#uvicorn api.main:app --reload
#python -m uvicorn api.main:app --reload
# http://127.0.0.1:8000/docs
