"""
Classe Historico - Funcionalidade 7: Histórico de corridas
"""


class Historico:
    def __init__(self, usuario_id: str):
        self.usuario_id = usuario_id
        self.corridas = []
    
    def adicionar_corrida(self, corrida):
        self.corridas.append(corrida)
    
    def listar_todas(self):
        return self.corridas
    
    def listar_por_status(self, status: str):
        return [c for c in self.corridas if c.status == status]
    
    def buscar_por_id(self, corrida_id: str):
        for corrida in self.corridas:
            if corrida.id == corrida_id:
                return corrida
        return None
