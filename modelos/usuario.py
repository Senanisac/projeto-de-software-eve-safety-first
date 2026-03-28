
"""
Classe Usuario - Funcionalidade 1: Cadastro de usuário
"""

import uuid

class Usuario:
    def __init__(self, nome_completo, cpf, email, senha, telefone, tipo_usuario):
        self.id_usuario = self._gerar_id_unico()
        self.nome_completo = nome_completo
        self.cpf = cpf 
        self.email = email
        self.senha = senha
        self.telefone = telefone
        self.tipo_usuario = tipo_usuario  # "passageiro" ou "motorista"
        self.status_conta = False
    
    def _gerar_id_unico(self):
        return str(uuid.uuid4())
    
    def cadastrar(self):
        print(f"{self.tipo_usuario.title()} {self.nome_completo} criado com ID: {self.id_usuario}")
        return self
    
    def validar_documentos(self):
        # Validação simplificada
        if self.tipo_usuario == "motorista":
            print("Validando CNH e documentos do motorista...")
            # Lógica de validação específica para motorista
        else:
            print("Validando CPF e documentos do passageiro...")
        return True
    
    def confirmar_conta(self):
        self.status_conta = True
        print(f"Conta de {self.tipo_usuario} confirmada com sucesso!")