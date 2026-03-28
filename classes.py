# 1. Cadastro de usuário
class Usuario:
    def __init__(self, id, nome, email, cpf, senha, tipo):
        self.id = id
        self.nome = nome
        self.email = email
        self.cpf = cpf
        self.senha = senha
        self.tipo = tipo  # passageiro ou motorista

    def cadastrar(self):
        print(f"Usuário {self.nome} cadastrado com sucesso")

    def atualizar_perfil(self, nome, email):
        self.nome = nome
        self.email = email


# 2. Login no sistema
class Autenticacao:
    def __init__(self, lista_usuarios):
        self.lista_usuarios = lista_usuarios

    def login(self, email, senha):
        for user in self.lista_usuarios:
            if user.email == email and user.senha == senha:
                print("Login realizado com sucesso")
                return user
        print("Credenciais inválidas")
        return None


# 3. Solicitar corrida
class Corrida:
    def __init__(self, usuario, origem, destino):
        self.usuario = usuario
        self.origem = origem
        self.destino = destino
        self.status = "pendente"
        self.preco = 0

    def solicitar_corrida(self):
        self.status = "solicitada"
        print("Corrida solicitada")

    def calcular_preco(self, distancia):
        self.preco = distancia * 2
        return self.preco


# 4. Visualização do motorista no mapa
class Rastreamento:
    def __init__(self, motorista, localizacao):
        self.motorista = motorista
        self.localizacao = localizacao

    def atualizar_localizacao(self, nova_localizacao):
        self.localizacao = nova_localizacao

    def mostrar_posicao(self):
        print(f"Motorista está em {self.localizacao}")


# 5. Escolher tipo de veículo
class Veiculo:
    def __init__(self, tipo, preco_km):
        self.tipo = tipo
        self.preco_km = preco_km

    def calcular_tarifa(self, distancia):
        return distancia * self.preco_km


# 6. Sistema de pagamento
class Pagamento:
    def __init__(self, valor, metodo):
        self.valor = valor
        self.metodo = metodo
        self.status = "pendente"

    def processar_pagamento(self):
        self.status = "aprovado"
        print("Pagamento realizado com sucesso")


# 7. Histórico de corridas
class Historico:
    def __init__(self):
        self.corridas = []

    def adicionar_corrida(self, corrida):
        self.corridas.append(corrida)

    def mostrar_historico(self):
        for c in self.corridas:
            print(f"{c.origem} -> {c.destino} | Status: {c.status}")


# 8. Sistema de avaliação
class Avaliacao:
    def __init__(self, usuario, motorista, nota, comentario):
        self.usuario = usuario
        self.motorista = motorista
        self.nota = nota
        self.comentario = comentario

    def avaliar(self):
        print(f"Avaliação: {self.nota} estrelas - {self.comentario}")


# 9. Controle de cancelamento de motoristas
class ControleCancelamento:
    def __init__(self, limite_por_dia):
        self.limite = limite_por_dia
        self.cancelamentos = 0

    def cancelar_corrida(self, motivo):
        if self.cancelamentos < self.limite:
            self.cancelamentos += 1
            print(f"Corrida cancelada. Motivo: {motivo}")
        else:
            print("Limite de cancelamentos atingido")


# 10. Suporte ao cliente
class Suporte:
    def __init__(self):
        self.tickets = []

    def abrir_ticket(self, usuario, mensagem):
        ticket = {"usuario": usuario.nome, "mensagem": mensagem}
        self.tickets.append(ticket)
        print("Ticket aberto com sucesso")

    def listar_tickets(self):
        for t in self.tickets:
            print(t)