
// api/axios.js - Configuração central da conexão com a API FastAPI
// Todas as telas importam este ficheiro para fazer requisições HTTP

import axios from "axios"; // Importa a biblioteca axios para fazer requisições HTTP

// Cria uma instância personalizada do axios com configurações pré-definidas
const api = axios.create({
  baseURL: "http://127.0.0.1:8000", // Endereço base da API — todas as requisições começam aqui
  // Exemplo: api.post("/usuarios/login") vai chamar http://127.0.0.1:8000/usuarios/login
});

// Interceptor — função que executa ANTES de cada requisição ser enviada
// Funciona como um porteiro que adiciona o token JWT automaticamente em cada chamada
api.interceptors.request.use((config) => {
  // Lê o token JWT guardado no localStorage após o login
  // localStorage é um banco de dados do navegador que persiste entre sessões
  const token = localStorage.getItem("token");

  // Se existe um token — utilizador está logado — adiciona no header Authorization
  if (token) {
    // Formato padrão JWT: "Bearer eyJhbGc..."
    // A API FastAPI lê este header para identificar quem está fazendo a requisição
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config; // Obrigatório — devolve o config modificado para o axios enviar
});

export default api; // Exporta para que todas as telas possam importar

