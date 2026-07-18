
// pages/Avaliacao.jsx - Tela de avaliação do motorista
// Passageiro avalia o motorista após o pagamento da corrida

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
    <div style={estilos.container}>
      <div style={estilos.caixa}>

        <button onClick={() => navigate("/historico")} style={estilos.botaoVoltar}>
          ← Voltar
        </button>

        <h2 style={estilos.titulo}>⭐ Avaliar Motorista</h2>
        <p style={estilos.subtitulo}>
          Como foi a tua experiência nesta corrida?
        </p>

        {erro && <p style={estilos.erro}>{erro}</p>}

        {/* ===== SELEÇÃO DE ESTRELAS ===== */}
        <div style={estilos.estrelaContainer}>
          {[1, 2, 3, 4, 5].map((estrela) => (
            <span
              key={estrela}
              onClick={() => setNota(estrela)}           // Define a nota ao clicar
              onMouseEnter={() => setNotaHover(estrela)} // Ilumina ao passar o rato
              onMouseLeave={() => setNotaHover(0)}       // Apaga ao sair o rato
              style={{
                ...estilos.estrela,
                // Ilumina a estrela se for menor ou igual à nota ou ao hover
                color: estrela <= (notaHover || nota) ? "#f59e0b" : "#d1d5db",
              }}
            >
              ★
            </span>
          ))}
        </div>

        {/* Texto descritivo da nota selecionada */}
        <p style={estilos.notaTexto}>
          {nota === 0 && "Seleciona uma nota"}
          {nota === 1 && "😞 Muito mau"}
          {nota === 2 && "😐 Mau"}
          {nota === 3 && "🙂 Razoável"}
          {nota === 4 && "😊 Bom"}
          {nota === 5 && "🤩 Excelente!"}
        </p>

        {/* ===== COMENTÁRIO ===== */}
        <div style={estilos.campo}>
          <label style={estilos.label}>
            Comentário <span style={{color: "#9ca3af", fontWeight: "400"}}>(opcional)</span>
          </label>
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Conta-nos a tua experiência..."
            maxLength={500}                    // Limite de 500 caracteres
            rows={4}                           // Altura do textarea
            style={estilos.textarea}
          />
          {/* Contador de caracteres */}
          <p style={estilos.contador}>{comentario.length}/500</p>
        </div>

        {/* ===== BOTÕES ===== */}
        <div style={{display: "flex", flexDirection: "column", gap: "12px"}}>
          <button
            onClick={handleAvaliar}
            style={carregando || nota === 0 ? estilos.botaoDesativado : estilos.botao}
            disabled={carregando || nota === 0}
          >
            {carregando ? "Enviando..." : "⭐ Enviar avaliação"}
          </button>

          <button
            onClick={() => navigate("/historico")}
            style={estilos.botaoPular}
          >
            Pular avaliação
          </button>
        </div>

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
    maxWidth: "440px",
  },
  botaoVoltar: {
    background: "none",
    border: "none",
    color: "#2563eb",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    padding: "0",
    marginBottom: "16px",
  },
  titulo: {
    color: "#1a1a2e",
    fontSize: "22px",
    marginBottom: "8px",
  },
  subtitulo: {
    color: "#666",
    fontSize: "14px",
    marginBottom: "24px",
  },
  erro: {
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontSize: "14px",
    textAlign: "center",
  },
  estrelaContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    marginBottom: "12px",
  },
  estrela: {
    fontSize: "48px",         // Estrelas grandes
    cursor: "pointer",
    transition: "color 0.1s", // Transição suave de cor
    userSelect: "none",       // Evita selecionar o texto ao clicar
  },
  notaTexto: {
    textAlign: "center",
    color: "#374151",
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "24px",
  },
  campo: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    color: "#374151",
    fontSize: "14px",
    fontWeight: "600",
  },
  textarea: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    resize: "vertical",       // Permite redimensionar verticalmente
    boxSizing: "border-box",
    fontFamily: "inherit",    // Usa a mesma fonte do resto da página
  },
  contador: {
    textAlign: "right",
    fontSize: "12px",
    color: "#9ca3af",
    margin: "4px 0 0 0",
  },
  botao: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#f59e0b",   // Amarelo — cor de estrela
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
  },
  botaoDesativado: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#fde68a",   // Amarelo claro — desativado
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "not-allowed",
  },
  botaoPular: {
    width: "100%",
    padding: "12px",
    backgroundColor: "white",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
};


export default Avaliacao;

