from modelos.usuario import Passageiro, Motorista
from modelos.sessao import Login
from modelos.corrida import Corrida
from modelos.veiculo import Carro, Moto, VeiculoVIP
from modelos.pagamento import PagamentoPix, PagamentoCartao, PagamentoDinheiro
from modelos.historico import Historico
from modelos.avaliacao import Avaliacao
from modelos.controle_cancelamento import ControleCancelamento
from modelos.suporte import Suporte

from bancos_dados.usuarios_bd import salvar_usuarios, atualizar_usuario, listar_usuarios
from bancos_dados.corridas_bd import salvar_corridas, listar_corridas
from bancos_dados.pagamentos_bd import salvar_pagamentos, listar_pagamentos
from bancos_dados.suporte_bd import salvar_mensagens, listar_mensagens

from datetime import date


print("\n============================")
print("      TESTE COMPLETO")
print("============================\n")


# =========================
# 1. CRIAÇÃO DE USUÁRIOS
# =========================
passageiro = Passageiro(
    "Ana Souza",
    "52998224725",
    "ana@test.com",
    "senha_ana",
    "81999990001"
)

motorista = Motorista(
    "João Silva",
    "12345678909",
    "joao@email.com",
    "senha123",
    "11999999999",
    "59090100108",
    "ABC1234",
    "Toyota Corolla"
)

print("\n--- Cadastro ---")
passageiro.cadastrar()
motorista.cadastrar()

# SALVAR NO BANCO
salvar_usuarios(passageiro)
salvar_usuarios(motorista)


# =========================
# 2. VALIDAÇÃO + CONFIRMAÇÃO
# =========================
print("\n--- Validação ---")

if passageiro.validar_documentos():
    passageiro.confirmar_conta()
    atualizar_usuario(passageiro)

if motorista.validar_documentos():
    motorista.confirmar_conta()
    atualizar_usuario(motorista)
else:
    print("Motorista não pode ser confirmado")


# =========================
# 3. DADOS
# =========================
print("\n--- Dados ---")
passageiro.mostrar_dados()
motorista.mostrar_dados()


# =========================
# 4. LOGIN
# =========================
print("\n--- Login ---")
login = Login(passageiro)
login.autenticar("ana@test.com", "senha_ana")      # correto
login.autenticar("ana@test.com", "senha_errada")   # deve falhar


# =========================
# 5. CORRIDA
# =========================
print("\n--- Corrida ---")

corrida = Corrida(passageiro, "Casa", "Centro")

veiculo = Carro()
motorista.cadastrar_veiculo(veiculo)

corrida.escolher_veiculo(veiculo)
corrida.calcular_preco()
corrida.confirmar()

print(f"Status da corrida: {corrida.status}")

# SALVAR CORRIDA
salvar_corridas(corrida)


# =========================
# 6. PAGAMENTO
# =========================
print("\n--- Pagamento ---")

pagamento = PagamentoPix(corrida.valor)
pagamento.processar_pagamento()
pagamento.mostrar_status()

# SALVAR PAGAMENTO
salvar_pagamentos(pagamento)


# =========================
# 7. HISTÓRICO
# =========================
print("\n--- Histórico ---")

historico = Historico(passageiro)
historico.adicionar(corrida)
historico.visualizar()


# =========================
# 8. AVALIAÇÃO
# =========================
print("\n--- Avaliação ---")

avaliacao = Avaliacao(
    passageiro,
    motorista,
    5,
    "Excelente motorista!"
)

avaliacao.avaliar()


# =========================
# 9. CANCELAMENTO
# =========================
print("\n--- Cancelamento ---")

controle = ControleCancelamento(motorista, limite_por_dia=2)

controle.mostrar_motivos()

controle.cancelar_corrida("")
controle.cancelar_corrida("Fome")
controle.cancelar_corrida("Problema no carro")
controle.cancelar_corrida("Emergência")
controle.cancelar_corrida("Trânsito extremo")

controle.data_atual = date(2026, 1, 1)
controle.cancelar_corrida("Emergência")

print(f"Total cancelamentos do motorista: {motorista.cancelamentos}")


# =========================
# 10. SUPORTE
# =========================
print("\n--- Suporte ---")

suporte = Suporte(passageiro)

mensagem = "Tive um problema na corrida"

suporte.enviar(mensagem)
suporte.historico()

# SALVAR MENSAGEM
salvar_mensagens(passageiro, mensagem)


# =========================
# 11. POLIMORFISMO PAGAMENTO
# =========================
print("\n--- Polimorfismo Pagamento ---")

pagamentos = [
    PagamentoPix(50),
    PagamentoCartao(100),
    PagamentoDinheiro(30)
]

for p in pagamentos:
    p.processar_pagamento()
    p.mostrar_status()
    print()


# =========================
# 12. POLIMORFISMO VEÍCULO
# =========================
print("\n--- Polimorfismo Veículo ---")

veiculos = [
    Moto(),
    Carro(),
    VeiculoVIP()
]

for v in veiculos:
    corrida.escolher_veiculo(v)
    corrida.calcular_preco()


# =========================
# 13. CONSULTA BANCO
# =========================
print("\n--- Usuários Salvos ---")
for u in listar_usuarios():
    print(f"  [{u['tipo_usuario']}] {u['nome_completo']} | status_conta: {u['status_conta']} | senha: {u['senha'][:20]}...")
 
print("\n--- Corridas Salvas ---")
for c in listar_corridas():
    print(f"  {c['passageiro']} | {c['origem']} → {c['destino']} | R${c['valor']} | {c['status']}")
 
print("\n--- Pagamentos Salvos ---")
for p in listar_pagamentos():
    print(f"  {p['metodo']} | R${p['valor']} | {p['status']}")
 
print("\n--- Mensagens Suporte ---")
for m in listar_mensagens():
    print(f"  {m['usuario']}: {m['mensagem']} ({m['data_hora']})")
    

#Compress-Archive -Path . -DestinationPath eve-safety-first.zip