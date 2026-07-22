
// pages/Suporte.jsx - Tela de suporte ao cliente
// Passageiro e motorista podem enviar e consultar mensagens de suporte

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
      ? { backgroundColor: "#fef9c3", color: "#854d0e" }   // Amarelo
      : { backgroundColor: "#dcfce7", color: "#16a34a" };  // Verde
  };


  // ===================== INTERFACE =====================
  return (
    <div style={estilos.container}>
      <div style={estilos.caixa}>

        {/* Cabeçalho */}
        <button onClick={() => navigate("/menu")} style={estilos.botaoVoltar}>
          ← Voltar
        </button>
        <h2 style={estilos.titulo}>🎧 Suporte ao Cliente</h2>

        {/* Abas */}
        <div style={estilos.abas}>
          <button
            onClick={() => setAba("enviar")}
            style={aba === "enviar" ? estilos.abaAtiva : estilos.abaInativa}
          >
            ✉️ Enviar mensagem
          </button>
          <button
            onClick={() => setAba("minhas")}
            style={aba === "minhas" ? estilos.abaAtiva : estilos.abaInativa}
          >
            📋 Minhas mensagens
          </button>
        </div>

        {/* ===== ABA ENVIAR ===== */}
        {aba === "enviar" && (
          <div>
            {erro && <p style={estilos.erro}>{erro}</p>}
            {sucesso && <p style={estilos.sucesso}>{sucesso}</p>}

            <form onSubmit={handleEnviar}>

              <div style={estilos.campo}>
                <label style={estilos.label}>Assunto</label>
                <input
                  type="text"
                  value={assunto}
                  onChange={(e) => setAssunto(e.target.value)}
                  placeholder="Ex: Problema com pagamento"
                  maxLength={100}
                  style={estilos.input}
                  required
                />
                <p style={estilos.contador}>{assunto.length}/100</p>
              </div>

              <div style={estilos.campo}>
                <label style={estilos.label}>Mensagem</label>
                <textarea
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  placeholder="Descreve o teu problema em detalhe..."
                  maxLength={1000}
                  rows={5}
                  style={estilos.textarea}
                  required
                />
                <p style={estilos.contador}>{mensagem.length}/1000</p>
              </div>

              <button
                type="submit"
                style={carregando ? estilos.botaoDesativado : estilos.botao}
                disabled={carregando}
              >
                {carregando ? "Enviando..." : "✉️ Enviar mensagem"}
              </button>

            </form>
          </div>
        )}

        {/* ===== ABA MINHAS MENSAGENS ===== */}
        {aba === "minhas" && (
          <div>
            {erro && <p style={estilos.erro}>{erro}</p>}

            {mensagens.length === 0 ? (
              <div style={estilos.vazio}>
                <p style={{fontSize: "40px", margin: "0"}}>📭</p>
                <p style={estilos.vazioTexto}>Nenhuma mensagem enviada ainda.</p>
              </div>
            ) : (
              <div style={estilos.lista}>
                {mensagens.map((msg) => (
                  <div key={msg.id} style={estilos.card}>

                    {/* Cabeçalho do card */}
                    <div style={estilos.cardTopo}>
                      <p style={estilos.assunto}>{msg.assunto}</p>
                      <span style={{...estilos.badge, ...corStatus(msg.status)}}>
                        {msg.status}
                      </span>
                    </div>

                    {/* Conteúdo da mensagem */}
                    <p style={estilos.mensagemTexto}>{msg.mensagem}</p>

                    {/* Data */}
                    <p style={estilos.data}>
                      {new Date(msg.criado_em).toLocaleString("pt-BR")}
                    </p>

                  </div>
                ))}
              </div>
            )}
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
    alignItems: "flex-start",
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
    maxWidth: "520px",
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
    fontSize: "20px",
    marginBottom: "20px",
  },
  abas: {
    display: "flex",
    gap: "8px",
    marginBottom: "24px",
  },
  abaAtiva: {
    flex: 1,
    padding: "10px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
  },
  abaInativa: {
    flex: 1,
    padding: "10px",
    backgroundColor: "white",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
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
  sucesso: {
    backgroundColor: "#dcfce7",
    color: "#16a34a",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontSize: "14px",
  },
  campo: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
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
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    resize: "vertical",
    boxSizing: "border-box",
    fontFamily: "inherit",
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
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
  },
  botaoDesativado: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#93c5fd",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "not-allowed",
  },
  vazio: {
    textAlign: "center",
    padding: "40px 20px",
  },
  vazioTexto: {
    color: "#666",
    marginTop: "8px",
  },
  lista: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  card: {
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "16px",
  },
  cardTopo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "8px",
  },
  assunto: {
    fontWeight: "700",
    color: "#1a1a2e",
    fontSize: "14px",
    margin: "0",
    flex: 1,
    marginRight: "12px",
  },
  badge: {
    padding: "2px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },
  mensagemTexto: {
    color: "#374151",
    fontSize: "14px",
    marginBottom: "8px",
    lineHeight: "1.5",
  },
  data: {
    fontSize: "12px",
    color: "#9ca3af",
    margin: "0",
  },
};


export default Suporte;

