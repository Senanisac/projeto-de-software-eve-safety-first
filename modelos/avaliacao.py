"""
Classe Avaliacao - Funcionalidade 8: Sistema de avaliação
"""

from datetime import datetime
import uuid


class Avaliacao:
    def __init__(self, corrida_id: str, avaliador_id: str, avaliado_id: str, nota: int, comentario: str = ""):
        self.id = str(uuid.uuid4())
        self.corrida_id = corrida_id
        self.avaliador_id = avaliador_id
        self.avaliado_id = avaliado_id
        self.nota = nota  # 1 a 5 
        self.comentario = comentario
        self.data_hora = datetime.now()
    
    def __str__(self) -> str:
        return f"Avaliação: {self.nota}/5 - {self.comentario}"
