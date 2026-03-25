
"""
Classe Usuario - Funcionalidade 1: Cadastro de usuário
"""

from datetime import datetime
import uuid


class Usuario:
    def __init__(self, nome: str, email: str, telefone: str, senha: str, tipo: str = "passageiro"):
        self.id = str(uuid.uuid4())
        self.nome = nome
        self.email = email
        self.telefone = telefone
        self.senha = senha
        self.tipo = tipo
        self.status = "ativo"
        self.data_cadastro = datetime.now()
    
    def exibir_informacoes(self) -> dict:
        return {
            "id": self.id,
            "nome": self.nome,
            "email": self.email,
            "telefone": self.telefone,
            "tipo": self.tipo,
            "status": self.status,
            "data_cadastro": self.data_cadastro.strftime("%d/%m/%Y %H:%M")
        }

    def __str__(self) -> str:
        return f"Usuario({self.nome}, {self.email}, {self.tipo})"