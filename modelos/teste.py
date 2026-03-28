from usuario import Usuario

# Création d'un nouvel utilisateur
usuario1 = Usuario("Senan Isac", "123.456.789-00", "senan@email.com", "senha123", "(11) 99999-9999", "passageiro")

# Affichage des informations
print(f"ID généré: {usuario1.id_usuario}")
print(f"Nome: {usuario1.nome_completo}")
print(f"Status da conta: {usuario1.status_conta}")

# Confirmation du compte
usuario1.confirmar_conta()
print(f"Status após confirmação: {usuario1.status_conta}")