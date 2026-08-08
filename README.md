# 🚗 Eve Safety First

> Sistema completo de transporte por aplicativo — de projeto académico POO a portfólio full-stack com API REST, banco de dados SQL, mapa interativo e interface web moderna.

![Python](https://img.shields.io/badge/Python-3.13-blue?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-D71F00)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)
![Leaflet](https://img.shields.io/badge/Maps-Leaflet-199900?logo=leaflet&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss&logoColor=white)

---

## 📋 Sobre o projeto

O **Eve Safety First** é um sistema de transporte por aplicativo desenvolvido em 3 camadas independentes — CLI interativa, API REST e Frontend Web. Começou como projeto académico de Programação Orientada a Objetos e evoluiu para um portfólio completo com fluxo real de passageiro e motorista.

O sistema permite que passageiros solicitem corridas via mapa interativo, acompanhem em tempo real a aceitação do motorista, realizem pagamentos e avaliem a experiência. Os motoristas gerem corridas disponíveis, aceitam, recusam, finalizam e têm controlo de cancelamentos com limite diário.

---

## 🏗️ Arquitetura

```
Eve Safety First
├── 🖥️  CLI Interativa     — Python puro, menus no terminal, persistência JSON
├── ⚡ API REST            — FastAPI + SQLite + JWT + bcrypt
└── 🌐 Frontend Web        — React + Leaflet + Framer Motion + Tailwind CSS
```

---

## ✨ Funcionalidades

### 🧍 Passageiro
- Cadastro com validação de CPF pelo algoritmo oficial brasileiro
- Login com autenticação JWT (token válido 24h)
- Solicitação de corrida via **mapa interativo** com geocodificação real
- Distância calculada com **fórmula Haversine** (distância real entre coordenadas GPS)
- Escolha de veículo — Moto (R$1/km), Carro (R$2/km), VIP (R$4/km)
- Acompanhamento em tempo real — atualização automática a cada 3 segundos
- Notificação automática quando motorista aceita — "Motorista encontrado! 🎉"
- Histórico de corridas com ações por status
- Cancelamento de corridas pendentes
- Pagamento via PIX, Cartão ou Dinheiro
- Avaliação do motorista com estrelas (1–5) e comentário
- Suporte ao cliente com histórico de mensagens

### 🚗 Motorista
- Cadastro com validação de CNH
- Vê apenas corridas do **mesmo tipo do seu veículo**
- Aceitar ou recusar corridas pendentes (recusa sem penalização)
- Finalizar corrida quando passageiro chega ao destino
- Cancelar corrida aceita com motivo obrigatório
- Limite de **5 cancelamentos por dia** com reset automático à meia-noite
- Histórico de corridas com resumo por status
- Suporte ao cliente

### 🔒 Sistema
- Senhas protegidas com **hash bcrypt** (salt automático)
- Tokens **JWT** assinados com chave secreta
- Banco de dados SQL com **chaves estrangeiras** e relacionamentos
- Documentação automática **Swagger UI** e **ReDoc**
- CORS configurado para comunicação frontend ↔ backend

---

## 🔄 Ciclo de vida de uma corrida

```
Passageiro solicita via mapa   →  status: "pendente"
                                        ↓
                    Motorista vê corridas do seu tipo de veículo
                         ↓                          ↓
                    Aceitar                      Recusar
                         ↓                          ↓
                status: "confirmada"       continua "pendente"
                         ↓
                Motorista finaliza
                         ↓
                status: "finalizada"
                         ↓
                Passageiro paga
                         ↓
                Passageiro avalia ⭐
```

---

## 🛠️ Tecnologias

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Linguagem backend | Python | 3.13 |
| API Framework | FastAPI | 0.115 |
| Servidor ASGI | Uvicorn | 0.30 |
| ORM | SQLAlchemy | 2.0 |
| Banco de dados | SQLite | 3 |
| Autenticação | JWT (python-jose) | 3.3 |
| Hash de senha | bcrypt | 4.0 |
| Validação | Pydantic | v2 |
| Frontend | React | 18 |
| Build tool | Vite | 6 |
| Estilos | Tailwind CSS | v4 |
| Animações | Framer Motion | 11 |
| Mapas | Leaflet + React-Leaflet | 1.9 |
| HTTP Client | Axios | 1.7 |
| Geocodificação | Nominatim (OpenStreetMap) | — |

---

## 📁 Estrutura do projeto

```
projeto-eve/
├── backend/                         # API REST
│   ├── requirements.txt
│   └── api/
│       ├── main.py                  # ponto de entrada FastAPI
│       ├── database.py              # conexão SQLite + SQLAlchemy
│       ├── auth.py                  # bcrypt + JWT + dependências
│       ├── models/
│       │   ├── usuario.py           # tabela usuarios
│       │   ├── corrida.py           # tabela corridas
│       │   ├── pagamento.py         # tabela pagamentos
│       │   ├── avaliacao.py         # tabela avaliacoes
│       │   └── suporte.py           # tabela suporte
│       ├── schemas/
│       │   ├── usuario.py           # validação usuários
│       │   ├── corrida.py           # validação corridas
│       │   ├── pagamento.py         # validação pagamentos
│       │   ├── avaliacao.py         # validação avaliações
│       │   └── suporte.py           # validação suporte
│       └── routers/
│           ├── usuarios.py          # endpoints /usuarios
│           ├── corridas.py          # endpoints /corridas
│           ├── pagamentos.py        # endpoints /pagamentos
│           ├── avaliacoes.py        # endpoints /avaliacoes
│           └── suporte.py           # endpoints /suporte
├── frontend/                        # Interface Web React
│   └── src/
│       ├── api/axios.js             # configuração HTTP + interceptor JWT
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Cadastro.jsx
│       │   ├── Menu.jsx
│       │   ├── Mapa.jsx             # mapa interativo Leaflet
│       │   ├── SolicitarCorrida.jsx
│       │   ├── Historico.jsx
│       │   ├── Pagamento.jsx
│       │   ├── Avaliacao.jsx
│       │   ├── Suporte.jsx
│       │   └── motorista/
│       │       ├── CorridasMotorista.jsx
│       │       └── HistoricoMotorista.jsx
│       └── App.jsx                  # roteamento + rotas protegidas
├── modelos/                         # camada POO (CLI)
├── bancos_dados/                    # persistência JSON (CLI)
├── cli.py                           # interface de linha de comando
├── main.py                          # script de demonstração POO
├── .env                             # variáveis de ambiente (não vai ao GitHub)
└── .gitignore
```

---

## 🚀 Como executar

### Pré-requisitos

- Python 3.13+
- Node.js 20+
- pip

### 1. Clonar o repositório

```bash
git clone https://github.com/Senanisac/projeto-de-software-eve-safety-first.git
cd projeto-de-software-eve-safety-first
```

### 2. Configurar variáveis de ambiente

Cria um ficheiro `.env` na raiz do projeto :

```env
DATABASE_URL=sqlite:///./eve.db
SECRET_KEY=sua-chave-secreta-aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

### 3. Instalar dependências do backend

```bash
pip install -r backend/requirements.txt
```

### 4. Executar a API REST

```bash
python -m uvicorn backend.api.main:app --reload
```

Acesse:
- **Swagger UI** → http://127.0.0.1:8000/docs
- **ReDoc** → http://127.0.0.1:8000/redoc

### 5. Instalar dependências do frontend

```bash
cd frontend
npm install
```

### 6. Executar o frontend

```bash
npm run dev
```

Acesse: **http://localhost:5173**

### 7. Executar a CLI interativa

```bash
python cli.py
```

---

## 📡 Endpoints da API

### Usuários
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/usuarios/passageiro` | ❌ | Cadastrar passageiro |
| POST | `/usuarios/motorista` | ❌ | Cadastrar motorista |
| POST | `/usuarios/login` | ❌ | Login → token JWT |
| GET | `/usuarios/me` | ✅ | Perfil do utilizador |

### Corridas
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/corridas` | Passageiro | Solicitar corrida |
| GET | `/corridas` | Passageiro | Listar minhas corridas |
| GET | `/corridas/{id}` | Passageiro | Detalhe de uma corrida |
| PATCH | `/corridas/{id}/finalizar` | Motorista | Finalizar corrida |
| PATCH | `/corridas/{id}/aceitar` | Motorista | Aceitar corrida |
| PATCH | `/corridas/{id}/recusar` | Motorista | Recusar corrida |
| PATCH | `/corridas/{id}/cancelar` | Motorista | Cancelar corrida aceita |
| PATCH | `/corridas/{id}/passageiro/cancelar` | Passageiro | Cancelar corrida pendente |
| GET | `/corridas/pendentes` | Motorista | Ver corridas disponíveis |
| GET | `/corridas/motorista/minhas` | Motorista | Ver minhas corridas |

### Pagamentos
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/pagamentos` | Passageiro | Processar pagamento |
| GET | `/pagamentos` | Passageiro | Listar meus pagamentos |

### Avaliações
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/avaliacoes` | Passageiro | Avaliar motorista |
| GET | `/avaliacoes/minhas` | Passageiro | Minhas avaliações |
| GET | `/avaliacoes/motorista/{id}` | ❌ | Avaliações de um motorista |

### Suporte
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/suporte` | ✅ | Enviar mensagem |
| GET | `/suporte/minhas` | ✅ | Ver minhas mensagens |

---

## 🔐 Autenticação

A API utiliza **JWT (JSON Web Token)**. Após o login, inclua o token no header:

```
Authorization: Bearer <seu_token>
```

O token expira após **24 horas**.

---

## 📐 Conceitos POO aplicados

| Conceito | Onde é aplicado |
|----------|----------------|
| Herança | `Passageiro` e `Motorista` herdam de `Usuario` (ABC) |
| Polimorfismo | `calcular_tarifa()` em `Moto`, `Carro`, `VeiculoVIP` |
| Polimorfismo | `processar_pagamento()` em `Pix`, `Cartao`, `Dinheiro` |
| Encapsulamento | `_hash_senha()`, `verificar_senha()` em `Usuario` |
| Classe abstrata | `Usuario`, `Veiculo`, `Pagamento` com `ABC` |
| Associação | `Corrida` associa `Passageiro` e `Veiculo` |

---

## 👨‍💻 Autor

**Isaac DJENONLO**
Estudante de Engenharia da Computação — 5º Semestre — UFAL, Maceió
[GitHub @Senanisac](https://github.com/Senanisac)

---

## 📄 Licença

Projeto desenvolvido para fins académicos e de portfólio.

