
// pages/Suporte.jsx - Tela de suporte ao cliente
// Passageiro e motorista podem enviar e consultar mensagens de suporte
// Design moderno com glassmorphism, abas interativas et animations

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";


function Suporte() {
  // ===================== ESTADOS =====================

  const [aba, setAba] = useState("enviar");          // "enviar" ou "minhas"
  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [mensagens, setMensagens] = useState([]);    // Lista de mensagens enviadas
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);

  const navigate = useNavigate();


  // ===================== BUSCAR MENSAGENS =====================
  const buscarMensagens = async () => {
    try {
      const resposta = await api.get("/suporte/minhas");
      setMensagens(resposta.data);
    } catch (err) {
      setErro("Erro ao carregar mensagens.");
    }
  };

  // Busca mensagens quando muda para a aba "minhas"
  useEffect(() => {
    if (aba === "minhas") {
      buscarMensagens();
    }
  }, [aba]);


  // ===================== ENVIAR MENSAGEM =====================
  const handleEnviar = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");
    setCarregando(true);

    try {
      await api.post("/suporte", { assunto, mensagem });
      setSucesso("✅ Mensagem enviada com sucesso! Responderemos em breve.");
      setAssunto("");      // Limpa os campos após envio
      setMensagem("");
    } catch (err) {
      setErro(err.response?.data?.detail || "Erro ao enviar mensagem");
    } finally {
      setCarregando(false);
    }
  };


  // ===================== COR DO STATUS =====================
  const corStatus = (status) => {
    return status === "pendente"
      ? { backgroundColor: "rgba(234,179,8,0.15)", color: "#eab308" }   // Amarelo
      : { backgroundColor: "rgba(0,212,170,0.15)", color: "#00d4aa" };  // Verde
  };


  // ===================== FORMATAR DATA =====================
  const formatarData = (dataISO) => {
    const data = new Date(dataISO);
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

      {/* ===== CÍRCULOS DECORATIVOS ===== */}
      {/* Suporte → Azul + Roxo */}

      <div style={{
        position: "absolute", top: "-120px", right: "-120px",
        width: "450px", height: "450px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(37,99,235,0.35), transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{
        position: "absolute", bottom: "-120px", left: "-120px",
        width: "450px", height: "450px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(108,99,255,0.3), transparent 70%)",
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
          padding: "36px 32px",
          width: "100%",
          maxWidth: "520px",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Cabeçalho */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}>
          <h2 style={{
            color: "#ffffff",
            fontSize: "20px",
            margin: "0",
            fontFamily: "Poppins, sans-serif",
          }}>
            🎧 Suporte ao Cliente
          </h2>

          <button
            onClick={() => navigate("/menu")}
            style={{
              padding: "8px 14px",
              background: "rgba(255,255,255,0.07)",
              color: "#a0aec0",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "600",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255,255,255,0.15)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255,255,255,0.07)";
            }}
          >
            ← Voltar
          </button>
        </div>

        {/* ===== ABAS ===== */}
        <div style={{
          display: "flex",
          gap: "8px",
          marginBottom: "24px",
        }}>
          {/* Aba "Enviar mensagem" — VIOLET */}
          <button
            onClick={() => setAba("enviar")}
            style={aba === "enviar" ? {
              flex: 1,
              padding: "10px",
              background: "linear-gradient(135deg, #6c63ff, #8b85ff)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "13px",
              transition: "all 0.3s ease",
            } : {
              flex: 1,
              padding: "10px",
              background: "rgba(255,255,255,0.05)",
              color: "#a0aec0",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "13px",
              transition: "all 0.3s ease",
            }}
          >
            ✉️ Enviar mensagem
          </button>

          {/* Aba "Minhas mensagens" — VIOLET quand active */}
          <button
            onClick={() => setAba("minhas")}
            style={aba === "minhas" ? {
              flex: 1,
              padding: "10px",
              background: "linear-gradient(135deg, #6c63ff, #8b85ff)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "13px",
              transition: "all 0.3s ease",
            } : {
              flex: 1,
              padding: "10px",
              background: "rgba(255,255,255,0.05)",
              color: "#a0aec0",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "13px",
              transition: "all 0.3s ease",
            }}
          >
            📋 Minhas mensagens
          </button>
        </div>

        {/* ===== ABA ENVIAR ===== */}
        {aba === "enviar" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {erro && (
              <div style={{
                background: "rgba(255,101,132,0.15)",
                border: "1px solid rgba(255,101,132,0.3)",
                color: "#ff6584",
                borderRadius: "12px",
                padding: "12px 16px",
                marginBottom: "16px",
                fontSize: "14px",
                textAlign: "center",
              }}>
                {erro}
              </div>
            )}
            {sucesso && (
              <div style={{
                background: "rgba(0,212,170,0.15)",
                border: "1px solid rgba(0,212,170,0.3)",
                color: "#00d4aa",
                borderRadius: "12px",
                padding: "12px 16px",
                marginBottom: "16px",
                fontSize: "14px",
                textAlign: "center",
              }}>
                {sucesso}
              </div>
            )}

            <form onSubmit={handleEnviar}>

              <div style={{ marginBottom: "16px" }}>
                <label style={{
                  display: "block",
                  marginBottom: "6px",
                  color: "#a0aec0",
                  fontSize: "13px",
                  fontWeight: "600",
                }}>
                  Assunto
                </label>
                <input
                  type="text"
                  value={assunto}
                  onChange={(e) => setAssunto(e.target.value)}
                  placeholder="Ex: Problema com pagamento"
                  maxLength={100}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    color: "#ffffff",
                    fontSize: "14px",
                    outline: "none",
                    transition: "border 0.3s ease",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => e.target.style.border = "1px solid #6c63ff"}
                  onBlur={(e) => e.target.style.border = "1px solid rgba(255,255,255,0.1)"}
                  required
                />
                <p style={{
                  textAlign: "right",
                  fontSize: "12px",
                  color: "rgba(160,174,192,0.5)",
                  margin: "4px 0 0 0",
                }}>
                  {assunto.length}/100
                </p>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{
                  display: "block",
                  marginBottom: "6px",
                  color: "#a0aec0",
                  fontSize: "13px",
                  fontWeight: "600",
                }}>
                  Mensagem
                </label>
                <textarea
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  placeholder="Descreve o teu problema em detalhe..."
                  maxLength={1000}
                  rows={5}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    color: "#ffffff",
                    fontSize: "14px",
                    outline: "none",
                    resize: "vertical",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                    transition: "border 0.3s ease",
                  }}
                  onFocus={(e) => e.target.style.border = "1px solid #6c63ff"}
                  onBlur={(e) => e.target.style.border = "1px solid rgba(255,255,255,0.1)"}
                  required
                />
                <p style={{
                  textAlign: "right",
                  fontSize: "12px",
                  color: "rgba(160,174,192,0.5)",
                  margin: "4px 0 0 0",
                }}>
                  {mensagem.length}/1000
                </p>
              </div>

              {/* Bouton Enviar — VIOLET */}
              <button
                type="submit"
                disabled={carregando}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: carregando
                    ? "rgba(108,99,255,0.3)"
                    : "linear-gradient(135deg, #6c63ff, #8b85ff)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: carregando ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  if (!carregando) {
                    e.target.style.transform = "scale(1.02)";
                    e.target.style.boxShadow = "0 0 20px rgba(108,99,255,0.3)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "scale(1)";
                  e.target.style.boxShadow = "none";
                }}
              >
                {carregando ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                    <span style={{
                      width: "16px", height: "16px",
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTop: "2px solid white",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                      display: "inline-block",
                    }} />
                    Enviando...
                  </span>
                ) : "✉️ Enviar mensagem"}
              </button>

            </form>
          </motion.div>
        )}

        {/* ===== ABA MINHAS MENSAGENS ===== */}
        {aba === "minhas" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {erro && (
              <div style={{
                background: "rgba(255,101,132,0.15)",
                border: "1px solid rgba(255,101,132,0.3)",
                color: "#ff6584",
                borderRadius: "12px",
                padding: "12px 16px",
                marginBottom: "16px",
                fontSize: "14px",
                textAlign: "center",
              }}>
                {erro}
              </div>
            )}

            {mensagens.length === 0 ? (
              <div style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "#a0aec0",
              }}>
                <p style={{ fontSize: "48px", margin: "0" }}>📭</p>
                <p style={{ fontSize: "16px" }}>Nenhuma mensagem enviada ainda.</p>
                <p style={{ fontSize: "14px", marginTop: "4px" }}>
                  Envie uma mensagem para o suporte.
                </p>
              </div>
            ) : (
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}>
                {mensagens.map((msg, index) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.01 }}
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "14px",
                      padding: "16px 18px",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "8px",
                    }}>
                      <p style={{
                        fontWeight: "700",
                        color: "#ffffff",
                        fontSize: "14px",
                        margin: "0",
                        flex: 1,
                        marginRight: "12px",
                      }}>
                        {msg.assunto}
                      </p>
                      <span style={{
                        padding: "2px 10px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: "600",
                        whiteSpace: "nowrap",
                        ...corStatus(msg.status),
                      }}>
                        {msg.status === "pendente" ? "⏳ Pendente" : "✅ Respondido"}
                      </span>
                    </div>

                    <p style={{
                      color: "#a0aec0",
                      fontSize: "14px",
                      marginBottom: "8px",
                      lineHeight: "1.5",
                    }}>
                      {msg.mensagem}
                    </p>

                    <p style={{
                      fontSize: "11px",
                      color: "rgba(160,174,192,0.5)",
                      margin: "0",
                    }}>
                      {formatarData(msg.criado_em)}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* CSS pour le spinner */}
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          ::placeholder { color: rgba(160,174,192,0.4); }
        `}</style>

      </motion.div>
    </div>
  );
}

export default Suporte;

