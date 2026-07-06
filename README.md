# 🚗 Eve Safety First

> Sistema de transporte com controle de cancelamentos — projeto acadêmico evoluído para portfólio completo.

![Python](https://img.shields.io/badge/Python-3.13-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.138-green?logo=fastapi)
![SQLite](https://img.shields.io/badge/SQLite-3-lightgrey?logo=sqlite)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-red)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)

---

## 📋 Sobre o projeto

O **Eve Safety First** é um sistema de transporte por aplicativo desenvolvido inicialmente como projeto acadêmico de Programação Orientada a Objetos e evoluído para um portfólio completo com API REST, banco de dados SQL e interface CLI interativa.

O sistema permite que passageiros solicitem corridas, escolham o tipo de veículo, realizem pagamentos e avaliem motoristas — enquanto motoristas gerenciam cancelamentos com controle de limite diário.

---

## 🏗️ Arquitetura

O projeto é composto por três camadas independentes:

```
Eve Safety First
├── CLI Interativa      — interface de terminal com menus e entrada via teclado
├── API REST            — FastAPI + SQLite + autenticação JWT + bcrypt
└── Modelos POO         — classes Python com herança, polimorfismo e encapsulamento
```

---

## ✨ Funcionalidades

### Passageiro
- Cadastro com validação de CPF (algoritmo oficial) e email
- Login com autenticação JWT
- Solicitação de corrida com escolha de veículo (Moto, Carro, VIP)
- Cálculo automático de distância e tarifa
- Pagamento via PIX, Cartão ou Dinheiro
- Histórico de corridas
- Avaliação de motoristas (nota 1–5)
- Suporte ao cliente

### Motorista
- Cadastro com validação de CNH
- Cancelamento de corridas com motivo obrigatório
- Controle de limite de cancelamentos por dia (reset automático à meia-noite)

### Sistema
- Senhas protegidas com hash bcrypt
- Tokens JWT com expiração de 24 horas
- Banco de dados SQLite com relacionamentos entre tabelas
- Documentação automática Swagger UI e ReDoc

---

## 🛠️ Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Linguagem | Python 3.13 |
| API | FastAPI 0.138 |
| Servidor | Uvicorn |
| ORM | SQLAlchemy 2.0 |
| Banco de dados | SQLite |
| Autenticação | JWT (python-jose) |
| Hash de senha | bcrypt |
| Validação | Pydantic v2 |

---

## 📁 Estrutura do projeto

```
projeto-eve/
├── api/                        # API REST
│   ├── main.py                 # ponto de entrada FastAPI
│   ├── database.py             # conexão SQLite + SQLAlchemy
│   ├── models.py               # tabelas SQL (ORM)
│   ├── schemas.py              # validação Pydantic
│   ├── auth.py                 # bcrypt + JWT
│   └── routers/
│       ├── usuarios.py         # endpoints de cadastro e login
│       ├── corridas.py         # endpoints de corridas
│       └── pagamentos.py       # endpoints de pagamentos
├── modelos/                    # camada POO
│   ├── usuario.py              # classes Usuario, Passageiro, Motorista
│   ├── corrida.py              # classe Corrida
│   ├── veiculo.py              # classes Veiculo, Moto, Carro, VeiculoVIP
│   ├── pagamento.py            # classes Pagamento, Pix, Cartao, Dinheiro
│   ├── controle_cancelamento.py
│   ├── avaliacao.py
│   ├── historico.py
│   ├── localizacao.py
│   ├── sessao.py
│   └── suporte.py
├── bancos_dados/               # persistência JSON (camada CLI)
│   ├── usuarios_bd.py
│   ├── corridas_bd.py
│   ├── pagamentos_bd.py
│   └── suporte_bd.py
├── cli.py                      # interface de linha de comando
├── main.py                     # script de demonstração POO
└── .gitignore
```

---

## 🚀 Como executar

### Pré-requisitos

- Python 3.13+
- pip

### Instalação

```bash
# Clone o repositório
git clone https://github.com/Senanisac/projeto-de-software-eve-safety-first.git
cd projeto-de-software-eve-safety-first

# Instale as dependências
pip install fastapi uvicorn sqlalchemy bcrypt python-jose[cryptography] python-multipart "pydantic[email]"
```

### Executar a API REST

```bash
python -m uvicorn api.main:app --reload
```

Acesse:
- **Swagger UI** → http://127.0.0.1:8000/docs
- **ReDoc** → http://127.0.0.1:8000/redoc

### Executar a CLI interativa

```bash
python cli.py
```

---

## 📡 Endpoints da API

### Usuários
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/usuarios/passageiro` | Cadastrar passageiro |
| POST | `/usuarios/motorista` | Cadastrar motorista |
| POST | `/usuarios/login` | Login — retorna token JWT |
| GET | `/usuarios/me` | Perfil do usuário autenticado |

### Corridas
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/corridas` | Solicitar corrida |
| GET | `/corridas` | Listar minhas corridas |
| GET | `/corridas/{id}` | Detalhe de uma corrida |
| PATCH | `/corridas/{id}/finalizar` | Finalizar corrida |

### Pagamentos
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/pagamentos` | Processar pagamento |
| GET | `/pagamentos` | Listar meus pagamentos |

---

## 🔐 Autenticação

A API utiliza **JWT (JSON Web Token)**. Após o login, inclua o token no header de cada requisição:

```
Authorization: Bearer <seu_token>
```

O token expira após **24 horas**.

---

## 🧪 Exemplo de uso da API

```bash
# 1. Cadastrar passageiro
curl -X POST http://127.0.0.1:8000/usuarios/passageiro \
  -H "Content-Type: application/json" \
  -d '{"nome": "Ana Souza", "cpf": "52998224725", "email": "ana@email.com", "senha": "senha123", "telefone": "81999990001"}'

# 2. Login
curl -X POST http://127.0.0.1:8000/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{"email": "ana@email.com", "senha": "senha123"}'

# 3. Solicitar corrida (com token)
curl -X POST http://127.0.0.1:8000/corridas \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"origem": "UFAL", "destino": "Centro", "tipo_veiculo": "Carro"}'
```

---

## 📐 Conceitos POO aplicados

| Conceito | Onde é aplicado |
|----------|----------------|
| Herança | `Passageiro` e `Motorista` herdam de `Usuario` |
| Polimorfismo | `calcular_tarifa()` em `Moto`, `Carro`, `VeiculoVIP` |
| Polimorfismo | `processar_pagamento()` em `Pix`, `Cartao`, `Dinheiro` |
| Encapsulamento | `_hash_senha()`, `verificar_senha()` em `Usuario` |
| Classe abstrata | `Usuario`, `Veiculo`, `Pagamento` com `ABC` |

---

## 👨‍💻 Autor

**Isaac DJENONLO**
Estudante de Engenharia da Computação — UFAL
[GitHub](https://github.com/Senanisac)

---

## 📄 Licença

Este projeto foi desenvolvido para fins acadêmicos e de portfólio.
