from .utils import ler_dados, salvar_dados

ARQUIVO = "bancos_dados/json/usuarios.json"

def _serializar_usuario(usuario):
    """
    Cria dict explícito em vez de __dict__ bruto.
    Evita crash quando veiculo é um objeto Python não serializável pelo JSON.
    """
    dados = {
        "id_usuario":    usuario.id_usuario,
        "nome_completo": usuario.nome_completo,
        "cpf":           usuario.cpf,
        "email":         usuario.email,
        "senha":         usuario.senha,          # já é hash SHA-256
        "telefone":      usuario.telefone,
        "tipo_usuario":  usuario.tipo_usuario,
        "status_conta":  usuario.status_conta,
        }
    
    if usuario.tipo_usuario == "motorista":
        dados["cnh"]            = usuario.cnh
        dados["placa"]          = usuario.placa
        dados["modelo_veiculo"] = usuario.modelo_veiculo
        dados["tipo_veiculo"]   = usuario.veiculo.tipo if usuario.veiculo else None
        dados["cancelamentos"]  = usuario.cancelamentos
    else:
        dados["historico"] = [] 

    return dados  


def salvar_usuarios(usuario):
    dados = ler_dados(ARQUIVO)

    # Percorre a lista e vê se algum usuário já tem o mesmo CPF
    for u in dados:
        if u['cpf'] == usuario.cpf:
            print(f"Erro: Já existe um usuário cadastrado com o CPF {usuario.cpf}.")
            return False

    # Se o loop terminar sem encontrar nada, adicionamos o usuário
    dados.append(_serializar_usuario(usuario))
    salvar_dados(ARQUIVO, dados)
    print("Usuário cadastrado com sucesso!")
    return True

def atualizar_usuario(usuario):
    """Atualiza os dados de um usuário já existente (ex: após confirmar conta)."""
    dados = ler_dados(ARQUIVO)
    for i, u in enumerate(dados):
        if u["cpf"] == usuario.cpf:
            dados[i] = _serializar_usuario(usuario)
            salvar_dados(ARQUIVO, dados)
            return True
    return False 


def listar_usuarios():
    return ler_dados(ARQUIVO)


def buscar_usuario_por_cpf(cpf):
    dados = ler_dados(ARQUIVO)
    for usuario in dados:
        if usuario["cpf"] == cpf:
            return usuario
    return None
