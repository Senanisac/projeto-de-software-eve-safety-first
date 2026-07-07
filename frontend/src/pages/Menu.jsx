
// pages/Menu.jsx - Menu principal após login
// Mostra os dados do utilizador e os botões de navegação

import { useState, useEffect } from "react";  // useState para guardar dados, useEffect para buscar dados ao carregar
import { useNavigate } from "react-router-dom"; // Para navegar entre telas e fazer logout
import api from "../api/axios";                 // Nossa instância configurada do axios


function Menu() {
  // ===================== ESTADOS =====================

  const [usuario, setUsuario] = useState(null);  // Guarda os dados do utilizador logado
  const [erro, setErro] = useState("");          // Mensagem de erro se a busca falhar

  const navigate = useNavigate(); // Para redirecionar após logout


  // ===================== BUSCAR DADOS DO UTILIZADOR =====================
  // useEffect executa esta função quando o componente aparece na tela
  // O array vazio [] significa "executa apenas uma vez — quando o componente monta"
  useEffect(() => {
    const buscarPerfil = async () => {
      try {
        // Busca os dados do utilizador logado
        // O token JWT é enviado automaticamente pelo interceptor do axios
        const resposta = await api.get("/usuarios/me");
        setUsuario(resposta.data); // Guarda os dados no estado
      } catch (err) {
        // Se o token expirou ou é inválido, redireciona para login
        setErro("Sessão expirada. Faça login novamente.");
        localStorage.removeItem("token"); // Remove o token inválido
        setTimeout(() => navigate("/"), 2000); // Redireciona após 2 segundos
      }
    };

    buscarPerfil(); // Chama a função assim que o componente aparece
  }, []); // [] = executa apenas uma vez


  // ===================== FUNÇÃO DE LOGOUT =====================
  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove o token do localStorage
    navigate("/");                    // Redireciona para o login
  };


  // ===================== INTERFACE =====================

  // Mostra mensagem de carregamento enquanto os dados não chegaram
  if (!usuario) {
    return (
      <div style={estilos.container}>
        <p style={estilos.carregando}>
          {erro || "Carregando..."} {/* Mostra erro se houver, senão mostra "Carregando..." */}
        </p>
      </div>
    );
  }

  return (
    <div style={estilos.container}>
      <div style={estilos.caixa}>

        {/* Cabeçalho com saudação e botão de logout */}
        <div style={estilos.cabecalho}>
          <div>
            <h1 style={estilos.titulo}>🚗 Eve Safety First</h1>
            {/* Mostra o nome do utilizador — dados vêm do estado usuario */}
            <p style={estilos.saudacao}>Olá, {usuario.nome.split(" ")[0]}! 👋</p>
            {/* .split(" ")[0] pega apenas o primeiro nome */}
          </div>

          {/* Botão de logout */}
          <button onClick={handleLogout} style={estilos.botaoLogout}>
            Sair
          </button>
        </div>

        {/* Card com informações do perfil */}
        <div style={estilos.perfil}>
          <p style={estilos.perfilTexto}>📧 {usuario.email}</p>
          <p style={estilos.perfilTexto}>📱 {usuario.telefone}</p>
          <p style={estilos.perfilTexto}>
            {/* Emoji diferente baseado no tipo do utilizador */}
            {usuario.tipo === "passageiro" ? "🧍 Passageiro" : "🚗 Motorista"}
          </p>
        </div>

        {/* Botões de navegação — só aparecem para passageiros */}
        {usuario.tipo === "passageiro" && (
          <div style={estilos.botoes}>

            {/* Cada botão navega para uma tela diferente */}
            <button
              onClick={() => navigate("/corrida")}  // Vai para SolicitarCorrida
              style={estilos.botao}
            >
              🚕 Solicitar Corrida
            </button>

            <button
              onClick={() => navigate("/historico")} // Vai para Historico
              style={estilos.botao}
            >
              📋 Histórico de Corridas
            </button>

            <button
              onClick={() => navigate("/pagamento")} // Vai para Pagamento
              style={{...estilos.botao, backgroundColor: "#16a34a"}} // Verde para pagamento
            >
              💳 Meus Pagamentos
            </button>

          </div>
        )}

        {/* Mensagem para motoristas — funcionalidades em breve */}
        {usuario.tipo === "motorista" && (
          <div style={estilos.motorista}>
            <p style={estilos.motoristaTexto}>
              🔧 Área do motorista em desenvolvimento.
            </p>
            <p style={estilos.motoristaTexto}>
              Em breve: gestão de corridas e cancelamentos.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}


// ===================== ESTILOS =====================
const estilos = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f0f2f5",
    padding: "20px",
  },
  caixa: {
    backgroundColor: "white",
    padding: "32px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "480px",
  },
  cabecalho: {
    display: "flex",
    justifyContent: "space-between", // Título à esquerda, botão logout à direita
    alignItems: "flex-start",
    marginBottom: "20px",
  },
  titulo: {
    color: "#1a1a2e",
    fontSize: "20px",
    margin: 0,
  },
  saudacao: {
    color: "#374151",
    fontSize: "16px",
    marginTop: "4px",
  },
  botaoLogout: {
    padding: "8px 16px",
    backgroundColor: "#fee2e2",    // Fundo vermelho claro
    color: "#dc2626",              // Texto vermelho
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
  },
  perfil: {
    backgroundColor: "#f8fafc",   // Fundo cinza muito claro
    padding: "16px",
    borderRadius: "8px",
    marginBottom: "24px",
  },
  perfilTexto: {
    color: "#374151",
    fontSize: "14px",
    margin: "4px 0",
  },
  botoes: {
    display: "flex",
    flexDirection: "column",       // Botões em coluna — um por linha
    gap: "12px",                   // Espaço entre botões
  },
  botao: {
    padding: "14px",
    backgroundColor: "#2563eb",   // Azul
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    textAlign: "left",            // Texto alinhado à esquerda
  },
  motorista: {
    backgroundColor: "#fef9c3",   // Fundo amarelo claro
    padding: "20px",
    borderRadius: "8px",
    textAlign: "center",
  },
  motoristaTexto: {
    color: "#854d0e",             // Texto amarelo escuro
    fontSize: "14px",
    margin: "4px 0",
  },
  carregando: {
    color: "#374151",
    fontSize: "16px",
  },
};


export default Menu;

