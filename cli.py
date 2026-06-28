"""
CLI - Interface de linha de comando do Eve Safety First
"""

import os
import getpass
from modelos.usuario import Passageiro, Motorista
from modelos.sessao import Login
from modelos.corrida  import Corrida
from modelos.veiculo import Carro, Moto, VeiculoVIP
from modelos.pagamento import PagamentoPix, PagamentoCartao, PagamentoDinheiro
from modelos.historico import Historico
from modelos.avaliacao import Avaliacao
from modelos.controle_cancelamento import ControleCancelamento
from modelos.suporte import Suporte
from modelos.localizacao import Rastreamento

from bancos_dados.usuarios_bd import salvar_usuarios, atualizar_usuario, listar_usuarios, buscar_usuario_por_cpf
from bancos_dados.corridas_bd import salvar_corridas, listar_corridas
from bancos_dados.pagamentos_bd import salvar_pagamentos, listar_pagamentos
from bancos_dados.suporte_bd import salvar_mensagens, listar_mensagens

# =========================
# UTILITÁRIOS
# =========================

def limpar():
    os.system("cls" if os.name == "nt" else "clear")


def cabecalho(titulo):
    print("\n" + "=" * 40)
    print(f"   {titulo}")
    print("=" * 40)


def pausar():
    input("\nPressione Enter para continuar...")


def ler_opcao(opcoes_validas):
    while True: 
        opcao = input("\nEscolha: ").strip()
        if opcao in opcoes_validas:
            return opcao
        print(f"  Opção inválida. Escolha entre: {', '.join(opcoes_validas)}")


def ler_campo(label, obrigatorio=True):
    while True:
        valor = input(f"  {label}: ").strip()
        if valor or not obrigatorio:
            return valor
        print(f"  Campo obrigatório.")


def ler_senha(label="senha"):
    while True:
        try:
            valor = getpass.getpass(f"  {label}: ").strip()
        except Exception:
            valor = input(f"  {label}: ").strip()
        if valor:
            return valor
        print("  Senha obrigatória.")


# =========================
# ESTADO GLOBAL DA SESSÃO
# =========================

sessao = {
    "usuario":   None,   # objeto Passageiro ou Motorista logado
    "historico": None,   # objeto Historico do passageiro
    "controle":  None,   # objeto ControleCancelamento do motorista
}


# =========================
# TELAS
# =========================

def tela_cadastrar_passageiro():
    cabecalho("CADASTRAR PASSAGEIRO")
    nome      = ler_campo("Nome completo")
    cpf       = ler_campo("CPF (apenas números)")
    email     = ler_campo("Email")
    senha     = ler_senha("Senha")
    telefone  = ler_campo("Telefone")

    p = Passageiro(nome, cpf, email, senha, telefone)

    if not p.validar_documentos():
        print("\n  Documentos inválidos. Cadastro cancelado.")
        pausar()
        return 
    
    p.confirmar_conta()
    resultado = salvar_usuarios(p)
    if resultado:
        atualizar_usuario(p)
        print(f"\n  ✓ Passageiro {nome} cadastrado com sucesso!")
    pausar()


def tela_cadastrar_motorista():
    cabecalho("CADASTRAR MOTORISTA")
    nome    = ler_campo("Nome completo")
    cpf     = ler_campo("CPF (apenas números)")
    email   = ler_campo("Email")
    senha   = ler_senha("Senha")
    tel     = ler_campo("Telefone")
    cnh     = ler_campo("CNH (apenas números)")
    placa   = ler_campo("Placa do veículo")
    modelo  = ler_campo("Modelo do veículo")

    print("\n  Tipo de veículo:")
    print("  1. Moto")
    print("  2. Carro")
    print("  3. VIP")
    
    tipo_op = ler_opcao(["1", "2", "3"])
    veiculo_map = {"1": Moto(), "2": Carro(), "3": VeiculoVIP()}
    veiculo = veiculo_map[tipo_op]

    m = Motorista(nome, cpf, email, senha, tel, cnh, placa, modelo)
    m.cadastrar_veiculo(veiculo)

    if not m.validar_documentos():
        print("\n  Documentos inválidos. Cadastro cancelado.")
        pausar()
        return
    
    m.confirmar_conta()
    resultado = salvar_usuarios(m)
    if resultado:
        atualizar_usuario(m)
        print(f"\n  ✓ Motorista {nome} cadastrado com sucesso!")
    pausar()


def tela_login():
    cabecalho("LOGIN")
    email = ler_campo("Email")
    senha = ler_senha("Senha")

    # Procura o usuário pelo email nos dados salvos
    todos = listar_usuarios()
    encontrado = None
    for u in todos:
        if u["email"] == email:
            encontrado = u 
            break

    if not encontrado:
        print("\n  Email não encontrado.")
        pausar()
        return
    
    # Reconstrói o objeto para usar verificar_senha()  
    if encontrado["tipo_usuario"] == "passageiro":
        obj = Passageiro.__new__(Passageiro)
        obj.id_usuario     = encontrado["id_usuario"]
        obj.nome_completo  = encontrado["nome_completo"]
        obj.cpf            = encontrado["cpf"]
        obj.email          = encontrado["email"]
        obj.senha          = encontrado["senha"]   # já é hash
        obj.telefone       = encontrado["telefone"]
        obj.tipo_usuario   = "passageiro"
        obj.status_conta   = encontrado["status_conta"]
        obj.historico      = []
    else:
        obj = Motorista.__new__(Motorista)
        obj.id_usuario     = encontrado["id_usuario"]
        obj.nome_completo  = encontrado["nome_completo"]
        obj.cpf            = encontrado["cpf"]
        obj.email          = encontrado["email"]
        obj.senha          = encontrado["senha"]
        obj.telefone       = encontrado["telefone"]
        obj.tipo_usuario   = "motorista"
        obj.status_conta   = encontrado["status_conta"]
        obj.cnh            = encontrado.get("cnh", "")
        obj.placa          = encontrado.get("placa", "")
        obj.modelo_veiculo = encontrado.get("modelo_veiculo", "")
        obj.cancelamentos  = encontrado.get("cancelamentos", 0)

        tipo_v = encontrado.get("tipo_veiculo")
        if tipo_v == "Moto":
            obj.veiculo = Moto()
        elif tipo_v == "VIP":
            obj.veiculo = VeiculoVIP()
        else:
            obj.veiculo = Carro()
        
    login = Login(obj)
    # Login.autenticar compara hash, não texto claro
    if login.autenticar(email, senha):
        sessao["usuario"] = obj
        if obj.tipo_usuario == "passageiro":
            sessao["historico"] = Historico(obj)
        else:
            sessao["controle"] = ControleCancelamento(obj, limite_por_dia=2)

        print(f"\n  ✓ Bem-vindo(a), {obj.nome_completo}!")
    else:
        print("\n  Email ou senha incorretos.")
    
    pausar()


def tela_solicitar_corrida():
    cabecalho("SOLICITAR CORRIDA")
    u = sessao["usuario"]

    if not u or u.tipo_usuario != "passageiro":
        print("\n  Apenas passageiros podem solicitar corridas.")
        pausar()
        return
    
    origem = ler_campo("Origem")
    destino = ler_campo("Destino")

    print("\n  Tipo de veículo:")
    print("  1. Moto  (tarifa: R$1,00/km)")
    print("  2. Carro (tarifa: R$2,00/km)")
    print("  3. VIP   (tarifa: R$4,00/km)")

    op = ler_opcao(["1", "2", "3"])
    veiculo_map = {"1": Moto(), "2": Carro(), "3": VeiculoVIP()}
    veiculo = veiculo_map[op]

    corrida = Corrida(u, origem, destino)
    corrida.escolher_veiculo(veiculo)
    corrida.calcular_preco()

    print(f"\n  Origem:   {origem}")
    print(f"  Destino:  {destino}")
    print(f"  Veículo:  {veiculo.tipo}")
    print(f"  Distância:{corrida.distancia} km")
    print(f"  Valor:    R${corrida.valor:.2f}")

    print("\n  Confirmar corrida?")
    print("  1. Sim")
    print("  2. Cancelar")
    
    conf = ler_opcao(["1", "2"])

    if conf == "2":
        print("\n  Corrida cancelada.")
        pausar()
        return
    
    corrida.confirmar()
    salvar_corridas(corrida)

    if sessao["historico"]:
        sessao["historico"].adicionar(corrida)

    # Rastreamento
    rastreamento = Rastreamento(corrida)
    rastreamento.calcular_tempo()

    # Pagamento
    print("\n  Forma de pagamento:")
    print("  1. PIX")
    print("  2. Cartão")
    print("  3. Dinheiro")
    pag_op = ler_opcao(["1", "2", "3"])
    pag_map = {
        "1": PagamentoPix(corrida.valor),
        "2": PagamentoCartao(corrida.valor),
        "3": PagamentoDinheiro(corrida.valor),
    } 

    pagamento = pag_map[pag_op]
    pagamento.processar_pagamento()
    salvar_pagamentos(pagamento)

    print(f"\n  ✓ Corrida finalizada! Total pago: R${corrida.valor:.2f}")
    pausar() 


def tela_historico():
    cabecalho("HISTÓRICO DE CORRIDAS")
    u = sessao["usuario"]

    if not u:
        print("\n  Faça login primeiro.")
        pausar()
        return
    
    corridas = listar_corridas()
    nome = u.nome_completo
    minhas = [c for c in corridas if c["passageiro"] == nome]

    if not minhas:
        print(f"\n  Nenhuma corrida encontrada para {nome}.")
    else:
        print(f"\n  Corridas de {nome}:\n")
        for i, c in enumerate(minhas, 1):
            print(f"  {i}. {c['origem']} → {c['destino']}")
            print(f"     Veículo: {c['tipo_veiculo']} | Distância: {c['distancia']} km")
            print(f"     Valor: R${c['valor']:.2f} | Status: {c['status']}\n")
    
    pausar()


def tela_avaliar():
    cabecalho("AVALIAR MOTORISTA")
    u = sessao["usuario"]

    if not u or u.tipo_usuario != "passageiro":
        print("\n  Apenas passageiros podem avaliar motoristas.")
        pausar()
        return
    
    # Lista os motoristas disponíveis
    todos = listar_usuarios()
    motoristas = [x for x in todos if x["tipo_usuario"] == "motorista"]

    if not motoristas:
        print("\n  Nenhum motorista cadastrado.")
        pausar()
        return
    
    print("\n  Motoristas disponíveis:")
    for i, m in enumerate(motoristas, 1):
        print(f"  {i}. {m['nome_completo']}")
    
    opcoes = [str(i) for i in range(1, len(motoristas) + 1)]
    op = ler_opcao(opcoes)
    m_dados = motoristas[int(op) - 1]

    # Reconstrói objeto motorista mínimo
    motorista_obj = Motorista.__new__(Motorista)
    motorista_obj.nome_completo = m_dados["nome_completo"]
 
    while True:
        try:
            nota = int(ler_campo("Nota (1 a 5)"))
            if 1 <= nota <= 5:
                break
            print("  A nota deve ser entre 1 e 5.")
        except ValueError:
            print("  Digite um número.")

    comentario = ler_campo("Comentário (opcional)", obrigatorio=False) or "Sem comentário"

    av = Avaliacao(u, motorista_obj, nota, comentario)
    av.avaliar()
    print("\n  ✓ Avaliação registrada!")
    pausar()


def tela_cancelamento():
    cabecalho("CANCELAR CORRIDA")
    u = sessao["usuario"]

    if not u or u.tipo_usuario != "motorista":
        print("\n  Apenas motoristas podem cancelar corridas.")
        pausar()
        return
    
    controle = sessao["controle"]
    controle.mostrar_motivos()

    print()
    motivo = ler_campo("Motivo de cancelamento")
    controle.cancelar_corrida(motivo)
    atualizar_usuario(u)
    pausar()


def tela_suporte():
    cabecalho("SUPORTE AO CLIENTE")
    u = sessao["usuario"]
 
    if not u:
        print("\n  Faça login primeiro.")
        pausar()
        return
    
    print("  1. Enviar mensagem")
    print("  2. Ver minhas mensagens")
    op = ler_opcao(["1", "2"])

    if op == "1":
        mensagem = ler_campo("Sua mensagem")
        suporte = Suporte(u)
        suporte.enviar(mensagem)
        salvar_mensagens(u, mensagem)
        print("\n  ✓ Mensagem enviada com sucesso!")
    else:
        todas = listar_mensagens()
        minhas = [m for m in todas if m["usuario"] == u.nome_completo]
        if not minhas:
            print(f"\n  Nenhuma mensagem de {u.nome_completo}.")
        else:
            print(f"\n  Mensagens de {u.nome_completo}:\n")
            for m in minhas:
                print(f"  [{m['data_hora']}] {m['mensagem']}")
    
    pausar()


def tela_logout():
    nome = sessao["usuario"].nome_completo if sessao["usuario"] else ""
    sessao["usuario"]   = None
    sessao["historico"] = None
    sessao["controle"]  = None
    print(f"\n  Até logo, {nome}!")
    pausar()

# =========================
# MENUS
# =========================

def menu_passageiro():
    while sessao["usuario"]:
        limpar()
        u = sessao["usuario"]
        cabecalho(f"MENU — {u.nome_completo}")
        print("\n  1. Solicitar corrida")
        print("  2. Ver histórico")
        print("  3. Avaliar motorista")
        print("  4. Suporte")
        print("  5. Logout")
 
        op = ler_opcao(["1", "2", "3", "4", "5"])
 
        if op == "1":
            tela_solicitar_corrida()
        elif op == "2":
            tela_historico()
        elif op == "3":
            tela_avaliar()
        elif op == "4":
            tela_suporte()
        elif op == "5":
            tela_logout()
 
 
def menu_motorista():
    while sessao["usuario"]:
        limpar()
        u = sessao["usuario"]
        cabecalho(f"MENU — {u.nome_completo} (Motorista)")
        print("\n  1. Cancelar corrida")
        print("  2. Ver corridas")
        print("  3. Suporte")
        print("  4. Logout")
 
        op = ler_opcao(["1", "2", "3", "4"])
 
        if op == "1":
            tela_cancelamento()
        elif op == "2":
            tela_historico()
        elif op == "3":
            tela_suporte()
        elif op == "4":
            tela_logout()
 

def menu_principal():
    while True:
        limpar()
        cabecalho("EVE SAFETY FIRST 🚗")
        print("\n  1. Cadastrar passageiro")
        print("  2. Cadastrar motorista")
        print("  3. Fazer login")
        print("  0. Sair")

        op = ler_opcao(["1", "2", "3", "0"])

        if op == "1":
            tela_cadastrar_passageiro()
        elif op == "2":
            tela_cadastrar_motorista()
        elif op == "3":
            tela_login()
            if sessao["usuario"]:
                u = sessao["usuario"]
                if u.tipo_usuario == "passageiro":
                    menu_passageiro()
                else:
                    menu_motorista()
        elif op == "0":
            limpar()
            print("\n  Eve Safety First encerrado. Até logo!\n")
            break 


# =========================
# PONTO DE ENTRADA
# =========================
 
if __name__ == "__main__":
    menu_principal()
