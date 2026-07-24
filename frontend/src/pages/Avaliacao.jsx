
// pages/Avaliacao.jsx - Tela de avaliação do motorista
// Passageiro avalia o motorista após o pagamento da corrida
// Design moderno com glassmorphism, estrelas animadas e dourado

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";


function Avaliacao() {
  // ===================== ESTADOS =====================

  const [nota, setNota] = useState(0);              // Nota de 1 a 5 — começa em 0 (não selecionada)
  const [notaHover, setNotaHover] = useState(0);    // Nota com hover — para animação das estrelas
  const [comentario, setComentario] = useState(""); // Comentário opcional
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const navigate = useNavigate();

  // useLocation permite receber dados passados pela navegação
  // Quando navegamos para /avaliacao passamos o corridaId
  const location = useLocation();
  const corridaId = location.state?.corridaId;   // ID da corrida a avaliar


  // ===================== FUNÇÃO DE AVALIAÇÃO =====================
  const handleAvaliar = async () => {
    if (nota === 0) {
      setErro("Seleciona uma nota antes de avaliar.");
      return;
    }

    setErro("");
    setCarregando(true);

    try {
      // Chama POST /avaliacoes com a nota e comentário
      await api.post("/avaliacoes", {
        corrida_id: corridaId,
        nota,
        comentario: comentario || null,   // Envia null se vazio
      });

      // Redireciona para o histórico após avaliação
      navigate("/historico");

    } catch (err) {
      setErro(err.response?.data?.detail || "Erro ao enviar avaliação");
    } finally {
      setCarregando(false);
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

      {/* ===== CÍRCULOS DECORATIVOS ===== */}
      {/* Avaliação → Dourado + Roxo */}

      {/* Círculo superior direito — DOURADO */}
      <div style={{
        position: "absolute", top: "-120px", right: "-120px",
        width: "450px", height: "450px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(245,158,11,0.3), transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Círculo inferior esquerdo — ROXO */}
      <div style={{
        position: "absolute", bottom: "-120px", left: "-120px",
        width: "450px", height: "450px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(108,99,255,0.3), transparent 70%)",
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
        {/* Botão voltar */}
        <button
          onClick={() => navigate("/historico")}
          style={{
            background: "none",
            border: "none",
            color: "#a0aec0",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600",
            padding: "0",
            marginBottom: "16px",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.color = "#ffffff";
          }}
          onMouseLeave={(e) => {
            e.target.style.color = "#a0aec0";
          }}
        >
          ← Voltar
        </button>

        <h2 style={{
          color: "#ffffff",
          fontSize: "22px",
          marginBottom: "8px",
          fontFamily: "Poppins, sans-serif",
        }}>
          ⭐ Avaliar Motorista
        </h2>
        <p style={{
          color: "#a0aec0",
          fontSize: "14px",
          marginBottom: "24px",
        }}>
          Como foi a tua experiência nesta corrida?
        </p>

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

        {/* ===== SELEÇÃO DE ESTRELAS ===== */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "12px",
          marginBottom: "12px",
        }}>
          {[1, 2, 3, 4, 5].map((estrela) => (
            <motion.span
              key={estrela}
              whileHover={{ scale: 1.2, rotate: 10 }}
              whileTap={{ scale: 0.8 }}
              onClick={() => setNota(estrela)}           // Define a nota ao clicar
              onMouseEnter={() => setNotaHover(estrela)} // Ilumina ao passar o rato
              onMouseLeave={() => setNotaHover(0)}       // Apaga ao sair o rato
              style={{
                fontSize: "52px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                userSelect: "none",
                color: estrela <= (notaHover || nota) ? "#f59e0b" : "rgba(255,255,255,0.15)",
                textShadow: estrela <= (notaHover || nota)
                  ? "0 0 20px rgba(245,158,11,0.5), 0 0 40px rgba(245,158,11,0.3)"
                  : "none",
              }}
            >
              ★
            </motion.span>
          ))}
        </div>

        {/* Texto descritivo da nota selecionada */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          key={nota}  // Reinicia animação quando a nota muda
          style={{
            textAlign: "center",
            color: "#a0aec0",
            fontSize: "16px",
            fontWeight: "600",
            marginBottom: "24px",
          }}
        >
          {nota === 0 && "👆 Seleciona uma nota"}
          {nota === 1 && "😞 Muito mau"}
          {nota === 2 && "😐 Mau"}
          {nota === 3 && "🙂 Razoável"}
          {nota === 4 && "😊 Bom"}
          {nota === 5 && "🤩 Excelente!"}
        </motion.p>

        {/* ===== COMENTÁRIO ===== */}
        <div style={{
          marginBottom: "20px",
        }}>
          <label style={{
            display: "block",
            marginBottom: "6px",
            color: "#a0aec0",
            fontSize: "13px",
            fontWeight: "600",
          }}>
            Comentário <span style={{color: "rgba(160,174,192,0.5)", fontWeight: "400"}}>(opcional)</span>
          </label>
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Conta-nos a tua experiência..."
            maxLength={500}                    // Limite de 500 caracteres
            rows={4}                           // Altura do textarea
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
            onFocus={(e) => e.target.style.border = "1px solid #f59e0b"}
            onBlur={(e) => e.target.style.border = "1px solid rgba(255,255,255,0.1)"}
          />
          {/* Contador de caracteres */}
          <p style={{
            textAlign: "right",
            fontSize: "12px",
            color: "rgba(160,174,192,0.5)",
            margin: "4px 0 0 0",
          }}>
            {comentario.length}/500
          </p>
        </div>

        {/* ===== BOTÕES ===== */}
        <div style={{display: "flex", flexDirection: "column", gap: "12px"}}>
          <motion.button
            whileHover={!carregando && nota !== 0 ? { scale: 1.02 } : {}}
            whileTap={!carregando && nota !== 0 ? { scale: 0.98 } : {}}
            onClick={handleAvaliar}
            disabled={carregando || nota === 0}
            style={{
              width: "100%",
              padding: "14px",
              background: carregando || nota === 0
                ? "rgba(245,158,11,0.3)"
                : "linear-gradient(135deg, #f59e0b, #fbbf24)",
              color: carregando || nota === 0
                ? "rgba(255,255,255,0.5)"
                : "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "15px",
              fontWeight: "600",
              cursor: carregando || nota === 0 ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
              boxShadow: !carregando && nota !== 0
                ? "0 0 20px rgba(245,158,11,0.3)"
                : "none",
            }}
          >
            {carregando ? (
              <span style={{display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"}}>
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
            ) : "⭐ Enviar avaliação"}
          </motion.button>

          <button
            onClick={() => navigate("/historico")}
            style={{
              width: "100%",
              padding: "12px",
              background: "rgba(255,255,255,0.05)",
              color: "#a0aec0",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255,255,255,0.1)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255,255,255,0.05)";
            }}
          >
            Pular avaliação
          </button>
        </div>

      </motion.div>

      {/* CSS para o spinner */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default Avaliacao;

