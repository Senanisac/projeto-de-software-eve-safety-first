"""
Classe Login - Funcionalidade 2: Login na sistema
""" 

from .usuario import Usuario

# =========================
# 2. LOGIN
# =========================
class Login:
    def __init__(self, usuario: Usuario):
        self.usuario = usuario

    def autenticar(self, email, senha):
        if self.usuario.email == email and self.usuario.verificar_senha(senha):
            if self.usuario.status_conta:
                print("Login realizado com sucesso!")
                return True
            else:
                print("Conta não confirmada")
        else:
            print("Dados incorretos")
        return False
