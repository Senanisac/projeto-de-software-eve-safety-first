
// pages/Menu.jsx - Menu principal após login
// Mostra os dados do utilizador e os botões de navegação

import { useState, useEffect } from "react";  // useState para guardar dados, useEffect para buscar dados ao carregar
import { useNavigate } from "react-router-dom"; // Para navegar entre telas e fazer logout
import { motion } from "framer-motion";        // Para animações profissionais
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
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)",
        padding: "20px",
      }}>
        <p style={{ color: "#a0aec0", fontSize: "16px" }}>
          {erro || "Carregando..."} {/* Mostra erro se houver, senão mostra "Carregando..." */}
        </p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)",
      position: "relative",
      overflow: "hidden",
      padding: "20px",
    }}>

      {/* ===== CÍRCULOS DECORATIVOS ===== */}
      {/* Menu → Roxo + Rosa */}

      {/* Círculo superior direito — ROXO */}
      <div style={{
        position: "absolute", top: "-120px", right: "-120px",
        width: "450px", height: "450px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(108,99,255,0.35), transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Círculo inferior esquerdo — ROSA */}
      <div style={{
        position: "absolute", bottom: "-120px", left: "-120px",
        width: "450px", height: "450px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,101,132,0.3), transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Card principal com efeito glassmorphism */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "24px",
          padding: "36px 32px",
          width: "100%",
          maxWidth: "440px",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* ===== ENCABEZADO: Título + Logout ===== */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}>
          <div>
            <h1 style={{
              fontSize: "20px", fontWeight: "700", color: "#ffffff",
              margin: 0, fontFamily: "Poppins, sans-serif",
            }}>
              🚗 Eve Safety First
            </h1>
            <p style={{
              color: "#a0aec0", fontSize: "15px", marginTop: "2px",
            }}>
              Olá, {usuario.nome.split(" ")[0]}! 👋
              {/* .split(" ")[0] pega apenas o primeiro nome */}
            </p>
          </div>

          {/* Botão de logout */}
          <button
            onClick={handleLogout}
            style={{
              padding: "6px 14px",
              background: "rgba(255,101,132,0.15)",
              color: "#ff6584",
              border: "1px solid rgba(255,101,132,0.3)",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "12px",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255,101,132,0.25)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255,101,132,0.15)";
            }}
          >
            Sair
          </button>
        </div>

        {/* ===== CARD COM DADOS DO PERFIL ===== */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            padding: "14px 18px",
            borderRadius: "12px",
            marginBottom: "24px",
          }}
        >
          <p style={{
            color: "#a0aec0", fontSize: "14px", margin: "4px 0",
            display: "flex", alignItems: "center", gap: "8px",
          }}>
            <span>📧</span> {usuario.email}
          </p>
          <p style={{
            color: "#a0aec0", fontSize: "14px", margin: "4px 0",
            display: "flex", alignItems: "center", gap: "8px",
          }}>
            <span>📱</span> {usuario.telefone}
          </p>
          <p style={{
            color: "#a0aec0", fontSize: "14px", margin: "4px 0",
            display: "flex", alignItems: "center", gap: "8px",
          }}>
            {usuario.tipo === "passageiro" ? "🧍 Passageiro" : "🚗 Motorista"}
          </p>
        </motion.div>

        {/* ===== BOTÕES DE NAVEGAÇÃO ===== */}
        {usuario.tipo === "passageiro" && (
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}>

            {/* BOTÃO 1 — Solicitar Corrida (roxo gradiente) */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/corrida")}
              style={{
                padding: "14px 18px",
                background: "linear-gradient(135deg, #6c63ff, #8b85ff)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: "600",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>🚕 Solicitar Corrida</span>
              <span style={{ opacity: 0.6 }}>→</span>
            </motion.button>

            {/* BOTÃO 2 — Histórico (glass) */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/historico")}
              style={{
                padding: "14px 18px",
                background: "rgba(255,255,255,0.07)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: "600",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>📋 Histórico de Corridas</span>
              <span style={{ opacity: 0.6 }}>→</span>
            </motion.button>

            {/* BOTÃO 3 — Pagamentos (verde) */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/pagamento")}
              style={{
                padding: "14px 18px",
                background: "rgba(0,212,170,0.15)",
                color: "#00d4aa",
                border: "1px solid rgba(0,212,170,0.3)",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: "600",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>💳 Meus Pagamentos</span>
              <span style={{ opacity: 0.6 }}>→</span>
            </motion.button>

            {/* BOTÃO 4 — Suporte (glass) */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/suporte")}
              style={{
                padding: "14px 18px",
                background: "rgba(99,102,241,0.15)",
                color: "#818cf8",
                border: "1px solid rgba(99,102,241,0.3)",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: "600",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>🎧 Suporte</span>
              <span style={{ opacity: 0.6 }}>→</span>
            </motion.button>

          </div>
        )}

        {/* ===== BOTÕES PARA MOTORISTAS ===== */}
        {usuario.tipo === "motorista" && (
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}>

            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/motorista/corridas")}
              style={{
                padding: "14px 18px",
                background: "linear-gradient(135deg, #6c63ff, #8b85ff)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: "600",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>🚕 Corridas Disponíveis</span>
              <span style={{ opacity: 0.6 }}>→</span>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/motorista/historico")}
              style={{
                padding: "14px 18px",
                background: "rgba(255,255,255,0.07)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: "600",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>📋 Meu Histórico</span>
              <span style={{ opacity: 0.6 }}>→</span>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/suporte")}
              style={{
                padding: "14px 18px",
                background: "rgba(99,102,241,0.15)",
                color: "#818cf8",
                border: "1px solid rgba(99,102,241,0.3)",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: "600",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>🎧 Suporte</span>
              <span style={{ opacity: 0.6 }}>→</span>
            </motion.button>

          </div>
        )}

      </motion.div>
    </div>
  );
}

export default Menu;
