
"""
Classe Usuario - Funcionalidade 1: Cadastro de usuário
"""

import uuid
import hashlib 
from abc import ABC, abstractmethod 
from modelos.validacoes import validar_cpf, validar_email, validar_cnh

# =========================
# 1. USUARIO
# =========================
class Usuario(ABC):
    def __init__(self, nome_completo, cpf, email, senha, telefone, tipo_usuario):
        self.id_usuario = self._gerar_id_unico()
        self.nome_completo = nome_completo
        self.cpf = cpf 
        self.email = email
        self.senha = self._hash_senha(senha) 
        self.telefone = telefone
        self.tipo_usuario = tipo_usuario
        self.status_conta = False
    
    def _gerar_id_unico(self):
        return str(uuid.uuid4())
    
    def _hash_senha(self, senha):
        """Gera hash SHA-256 da senha. Nunca armazenamos a senha original."""
        return hashlib.sha256(senha.encode()).hexdigest()
    
    def verificar_senha(self, senha):
        """Verifica se a senha fornecida corresponde ao hash armazenado."""
        return self.senha == hashlib.sha256(senha.encode()).hexdigest()

    def cadastrar(self):
        print(f"{self.tipo_usuario.title()} {self.nome_completo} criado com ID: {self.id_usuario}")
        return self
    
    def validar_documentos(self):
        if not self.nome_completo:
            print("Nome inválido")
            return False

        if not validar_cpf(self.cpf):
            print("CPF inválido")
            return False

        if not validar_email(self.email):
            print("Email inválido")
            return False

        print("Validação básica concluída")
        return True
    
    def confirmar_conta(self):
        self.status_conta = True
        print(f"Conta de {self.tipo_usuario} confirmada com sucesso!")

    @abstractmethod
    def mostrar_dados(self):
        pass

# =========================
# HERANÇA E POLIMORFISMO USUARIO
# =========================
class Passageiro(Usuario):
    def __init__(self, nome_completo, cpf, email, senha, telefone):
        super().__init__(nome_completo, cpf, email, senha, telefone, "passageiro")
        self.historico = []

    def solicitar_corrida(self, origem, destino):
        print(f"{self.nome_completo} solicitou corrida de {origem} para {destino}")

    def validar_documentos(self):
        if not super().validar_documentos():
            return False
        
        print("Documentos do passageiro validados")
        return True

    def mostrar_dados(self):
        print("=== Dados do Passageiro ===")
        print(f"Nome: {self.nome_completo}")
        print(f"CPF: {self.cpf}")
        print(f"Email: {self.email}")
        print(f"Telefone: {self.telefone}")


class Motorista(Usuario):
    def __init__(self, nome_completo, cpf, email, senha, telefone, cnh,
                 placa, modelo_veiculo):
        super().__init__(nome_completo, cpf, email, senha, telefone, "motorista")
        self.cnh = cnh
        self.placa = placa
        self.modelo_veiculo = modelo_veiculo
        self.veiculo = None
        self.cancelamentos = 0

    def cadastrar_veiculo(self, veiculo):
        self.veiculo = veiculo
        print(f"Veículo {veiculo.tipo} cadastrado para {self.nome_completo}")

    def validar_documentos(self):
        if not super().validar_documentos():
            return False

        if not validar_cnh(self.cnh):
            print("CNH inválida")
            return False

        print("Documentos do motorista validados")
        return True

    def mostrar_dados(self):
        print("=== Dados do Motorista ===")
        print(f"Nome: {self.nome_completo}")
        print(f"CNH: {self.cnh}")
        print(f"Placa: {self.placa}")
        print(f"Modelo: {self.modelo_veiculo}")
        if self.veiculo:
            print(f"Tipo de veículo: {self.veiculo.tipo}")

