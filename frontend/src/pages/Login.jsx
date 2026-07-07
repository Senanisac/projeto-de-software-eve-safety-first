
// pages/Login.jsx - Tela de login
// Permite ao utilizador autenticar-se com email e senha

import { useState } from "react";          // Para guardar os valores dos campos do formulário
import { useNavigate, Link } from "react-router-dom"; // useNavigate para redirecionar, Link para navegar
import api from "../api/axios";            // Nossa instância configurada do axios


function Login() {
  // ===================== ESTADOS =====================
  // useState guarda dados que mudam — quando mudam, React atualiza a tela automaticamente

  const [email, setEmail] = useState("");       // Guarda o valor do campo email
  const [senha, setSenha] = useState("");       // Guarda o valor do campo senha
  const [erro, setErro] = useState("");         // Guarda mensagem de erro para mostrar ao utilizador
  const [carregando, setCarregando] = useState(false); // Controla se o botão está desativado durante a requisição

  // useNavigate retorna uma função para redirecionar para outra tela
  const navigate = useNavigate();


  // ===================== FUNÇÃO DE LOGIN =====================
  const handleLogin = async (e) => {
    e.preventDefault(); // Impede o comportamento padrão do formulário (recarregar a página)

    setErro("");         // Limpa erros anteriores antes de tentar de novo
    setCarregando(true); // Desativa o botão para evitar cliques múltiplos

    try {
      // Faz a requisição POST para /usuarios/login com email e senha
      // api já tem o baseURL configurado — não precisamos escrever o endereço completo
      const resposta = await api.post("/usuarios/login", { email, senha });

      // Login bem-sucedido — guarda o token JWT no localStorage
      // Este token será enviado automaticamente em todas as próximas requisições pelo interceptor
      localStorage.setItem("token", resposta.data.access_token);

      // Redireciona para o menu principal
      navigate("/menu");

    } catch (err) {
      // Login falhou — mostra a mensagem de erro retornada pela API
      // err.response.data.detail é o campo "detail" que FastAPI retorna nos erros
      setErro(err.response?.data?.detail || "Erro ao fazer login");
    } finally {
      setCarregando(false); // Reativa o botão independentemente de sucesso ou erro
    }
  };


  // ===================== INTERFACE =====================
  return (
    // Container centralizado na tela
    <div style={estilos.container}>

      {/* Caixa do formulário */}
      <div style={estilos.caixa}>

        {/* Título */}
        <h1 style={estilos.titulo}>🚗 Eve Safety First</h1>
        <p style={estilos.subtitulo}>Entre na sua conta</p>

        {/* Mensagem de erro — só aparece se houver erro */}
        {erro && <p style={estilos.erro}>{erro}</p>}

        {/* Formulário de login — onSubmit chama handleLogin */}
        <form onSubmit={handleLogin}>

          {/* Campo email */}
          <div style={estilos.campo}>
            <label style={estilos.label}>Email</label>
            <input
              type="email"               // Tipo email — navegador valida o formato automaticamente
              value={email}              // Valor controlado pelo estado
              onChange={(e) => setEmail(e.target.value)} // Atualiza o estado quando o utilizador digita
              placeholder="seu@email.com"
              style={estilos.input}
              required                   // Campo obrigatório
            />
          </div>

          {/* Campo senha */}
          <div style={estilos.campo}>
            <label style={estilos.label}>Senha</label>
            <input
              type="password"            // Tipo password — esconde os caracteres digitados
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••"
              style={estilos.input}
              required
            />
          </div>

          {/* Botão de login — desativado durante o carregamento */}
          <button
            type="submit"
            style={carregando ? estilos.botaoDesativado : estilos.botao}
            disabled={carregando}        // Desativa o botão enquanto a requisição está a acontecer
          >
            {carregando ? "Entrando..." : "Entrar"} {/* Muda o texto durante o carregamento */}
          </button>

        </form>

        {/* Link para a tela de cadastro */}
        <p style={estilos.linkTexto}>
          Não tem conta?{" "}
          <Link to="/cadastro" style={estilos.link}>Cadastre-se</Link>
        </p>

      </div>
    </div>
  );
}


// ===================== ESTILOS =====================
// Estilos em JavaScript — cada propriedade CSS usa camelCase (backgroundColor, não background-color)
const estilos = {
  container: {
    display: "flex",              // Flexbox para centralizar
    justifyContent: "center",     // Centraliza horizontalmente
    alignItems: "center",         // Centraliza verticalmente
    minHeight: "100vh",           // Ocupa toda a altura da tela
    backgroundColor: "#f0f2f5",   // Fundo cinza claro
  },
  caixa: {
    backgroundColor: "white",     // Caixa branca
    padding: "40px",              // Espaçamento interno
    borderRadius: "12px",         // Bordas arredondadas
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)", // Sombra suave
    width: "100%",
    maxWidth: "400px",            // Largura máxima da caixa
  },
  titulo: {
    textAlign: "center",
    color: "#1a1a2e",
    marginBottom: "8px",
    fontSize: "24px",
  },
  subtitulo: {
    textAlign: "center",
    color: "#666",
    marginBottom: "24px",
    fontSize: "14px",
  },
  erro: {
    backgroundColor: "#fee2e2",   // Fundo vermelho claro
    color: "#dc2626",             // Texto vermelho
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontSize: "14px",
    textAlign: "center",
  },
  campo: {
    marginBottom: "16px",         // Espaço entre campos
  },
  label: {
    display: "block",             // Label ocupa linha própria
    marginBottom: "6px",
    color: "#374151",
    fontSize: "14px",
    fontWeight: "600",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",      // Inclui padding na largura total
  },
  botao: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#2563eb",   // Azul
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",            // Cursor de mão ao passar por cima
    marginTop: "8px",
  },
  botaoDesativado: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#93c5fd",   // Azul claro — indica desativado
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "not-allowed",        // Cursor de bloqueado
    marginTop: "8px",
  },
  linkTexto: {
    textAlign: "center",
    marginTop: "16px",
    fontSize: "14px",
    color: "#666",
  },
  link: {
    color: "#2563eb",             // Azul — igual ao botão
    textDecoration: "none",       // Remove sublinhado
    fontWeight: "600",
  },
};


export default Login; // Exporta para que App.jsx possa importar

