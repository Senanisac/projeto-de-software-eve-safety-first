"""
Classe controle cancelamento - Funcionalidade 9: Sistema de cancelamento
""" 

from datetime import date

# =========================
# 9. CONTROLE DE CANCELAMENTO
# =========================
class ControleCancelamento:
    MOTIVOS_VALIDOS = [
        "Problema no carro",
        "Trânsito extremo",
        "Emergência"
    ]

    def __init__(self, motorista, limite_por_dia):
        self.motorista = motorista 
        self.limite = limite_por_dia
        self.cancelamentos = 0
        self.data_atual = date.today() 

    def verificar_reset(self):
        if date.today()!= self.data_atual:
            self.cancelamentos = 0
            self.data_atual = date.today() 

    def mostrar_motivos(self):
        print("Motivos disponíveis:")
        for m in self.MOTIVOS_VALIDOS:
            print("-", m) 

    def cancelar_corrida(self, motivo):
        self.verificar_reset()
        
        if not motivo or motivo.strip() == "":
            print("Erro: é obrigatório informar o motivo do cancelamento")
            return False 

        if motivo not in self.MOTIVOS_VALIDOS:
            print("Erro: motivo inválido")
            self.mostrar_motivos()
            return False 

        if self.cancelamentos < self.limite:
            self.cancelamentos += 1
            self.motorista.cancelamentos += 1
            print(f"Corrida cancelada. Motivo: {motivo}"
                  f"(cancelamento {self.cancelamentos}/{self.limite} hoje)")
            return True 
        else:
            print("Limite de cancelamentos atingido. Não é possível cancelar mais hoje.")
            return False 
