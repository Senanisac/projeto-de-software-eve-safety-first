
// pages/Login.jsx - Tela de login
// Permite ao utilizador autenticar-se com email e senha

import { useState } from "react";          // Para guardar os valores dos campos do formulário
import { useNavigate, Link } from "react-router-dom"; // useNavigate para redirecionar, Link para navegar
import { motion } from "framer-motion"; 
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
  
        {/* Círculos decorativos */}
        <div style={{
          position: "absolute", top: "-100px", right: "-100px",
          width: "400px", height: "400px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(108,99,255,0.3), transparent)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "-100px", left: "-100px",
          width: "400px", height: "400px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,101,132,0.3), transparent)",
          pointerEvents: "none",
        }} />
  
        {/* Card principal */}
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
            padding: "48px 40px",
            width: "100%",
            maxWidth: "420px",
            position: "relative",
            zIndex: 10,
          }}
        >
          {/* Logo e título */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            style={{ textAlign: "center", marginBottom: "36px" }}
          >
            <div style={{ fontSize: "56px", marginBottom: "16px" }}>🚗</div>
            <h1 style={{
              fontSize: "28px", fontWeight: "700", color: "#ffffff",
              marginBottom: "8px", fontFamily: "Poppins, sans-serif"
            }}>
              Eve Safety First
            </h1>
            <p style={{ fontSize: "14px", color: "#a0aec0" }}>Entre na sua conta</p>
          </motion.div>
  
          {/* Erro */}
          {erro && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                background: "rgba(255,101,132,0.15)",
                border: "1px solid rgba(255,101,132,0.3)",
                color: "#ff6584", borderRadius: "12px",
                padding: "12px 16px", marginBottom: "24px",
                fontSize: "14px", textAlign: "center",
              }}
            >
              {erro}
            </motion.div>
          )}
  
          <form onSubmit={handleLogin}>
  
            {/* Campo email */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              style={{ marginBottom: "20px" }}
            >
              <label style={{
                display: "block", fontSize: "13px", fontWeight: "500",
                color: "#a0aec0", marginBottom: "8px",
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                style={{
                  width: "100%", padding: "14px 16px",
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px", color: "#ffffff",
                  fontSize: "14px", outline: "none",
                  transition: "border 0.3s ease",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => e.target.style.border = "1px solid #6c63ff"}
                onBlur={(e) => e.target.style.border = "1px solid rgba(255,255,255,0.1)"}
              />
            </motion.div>
  
            {/* Campo senha */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              style={{ marginBottom: "28px" }}
            >
              <label style={{
                display: "block", fontSize: "13px", fontWeight: "500",
                color: "#a0aec0", marginBottom: "8px",
              }}>
                Senha
              </label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••"
                required
                style={{
                  width: "100%", padding: "14px 16px",
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px", color: "#ffffff",
                  fontSize: "14px", outline: "none",
                  transition: "border 0.3s ease",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => e.target.style.border = "1px solid #6c63ff"}
                onBlur={(e) => e.target.style.border = "1px solid rgba(255,255,255,0.1)"}
              />
            </motion.div>
  
            {/* Botão entrar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <button
                type="submit"
                disabled={carregando}
                className="btn-glow"
                style={{
                  width: "100%", padding: "14px",
                  background: carregando
                    ? "rgba(108,99,255,0.5)"
                    : "linear-gradient(135deg, #6c63ff, #8b85ff)",
                  border: "none", borderRadius: "12px",
                  color: "#ffffff", fontSize: "15px",
                  fontWeight: "600", cursor: carregando ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  gap: "8px",
                }}
              >
                {carregando ? (
                  <>
                    <span style={{
                      width: "16px", height: "16px",
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTop: "2px solid white",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                      display: "inline-block",
                    }} />
                    Entrando...
                  </>
                ) : "Entrar"}
              </button>
            </motion.div>
  
          </form>
  
          {/* Link cadastro */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={{
              textAlign: "center", marginTop: "28px",
              fontSize: "14px", color: "#a0aec0",
            }}
          >
            Não tem conta?{" "}
            <Link to="/cadastro" style={{
              color: "#6c63ff", fontWeight: "600",
              textDecoration: "none",
            }}>
              Cadastre-se
            </Link>
          </motion.p>
  
        </motion.div>
  
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          input::placeholder { color: rgba(160,174,192,0.5); }
        `}</style>
      </div>
    );

}

export default Login; 

