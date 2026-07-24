
// pages/Historico.jsx - Tela de histórico de corridas
// Lista todas as corridas do passageiro logado com seus status
// Design moderno com glassmorphism e cards coloridos por status

import { useState, useEffect } from "react";   // useState para guardar dados, useEffect para buscar ao carregar
import { useNavigate } from "react-router-dom"; // Para voltar ao menu
import { motion } from "framer-motion";        // Para animações profissionais
import api from "../api/axios";                 // Nossa instância configurada do axios


function Historico() {
  // ===================== ESTADOS =====================

  const [pagamentos, setPagamentos] = useState([]);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [corridas, setCorridas] = useState([]);    // Lista de corridas — começa vazia
  const [carregando, setCarregando] = useState(true); // Começa como true — está a carregar
  const [erro, setErro] = useState("");

  const navigate = useNavigate();


  // ===================== CORES POR STATUS =====================

  const coresStatus = {
    pendente: { borda: "#eab308", bg: "rgba(234,179,8,0.1)", texto: "#eab308", label: "⏳ Pendente" },
    confirmada: { borda: "#6c63ff", bg: "rgba(108,99,255,0.1)", texto: "#6c63ff", label: "✅ Confirmada" },
    finalizada: { borda: "#00d4aa", bg: "rgba(0,212,170,0.1)", texto: "#00d4aa", label: "🏁 Finalizada" },
    cancelada: { borda: "#ff6584", bg: "rgba(255,101,132,0.1)", texto: "#ff6584", label: "❌ Cancelada" },
  };


  // ===================== BUSCAR CORRIDAS AO CARREGAR =====================
  useEffect(() => {
    const buscarDados = async () => {
      try {
        // Busca corridas, pagamentos e avalicoes em paralelo
        const [respostaCorridas, respostaPagamentos, respostaAvaliacoes] = await Promise.all([
          api.get("/corridas"),
          api.get("/pagamentos"),
          api.get("/avaliacoes/minhas"),      // Busca avaliações já feitas
        ]);
        setCorridas(respostaCorridas.data);   // Guarda a lista no estado
        setPagamentos(respostaPagamentos.data);
        setAvaliacoes(respostaAvaliacoes.data);
      } catch (err) {
        setErro("Erro ao carregar histórico. Tente novamente.");
      } finally {
        setCarregando(false); // Para de mostrar "Carregando..." independentemente do resultado
      }
    };

    buscarDados(); // Executa ao montar o componente
  }, []); // [] = executa apenas uma vez


  // ===================== CANCELAR CORRIDA PENDENTE =====================
  const handleCancelar = async (corridaId) => {
    const confirmar = window.confirm(
      "Tem certeza que deseja cancelar esta corrida?"
    );
    if (!confirmar) return;

    try {
      // Chama PATCH /corridas/{id}/passageiro/cancelar
      await api.patch(`/corridas/${corridaId}/passageiro/cancelar`);
      // Recarrega a lista após cancelamento
      const resposta = await api.get("/corridas");
      setCorridas(resposta.data);
    } catch (err) {
      alert(err.response?.data?.detail || "Erro ao cancelar corrida");
    }
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

  // Mostra mensagem de carregamento enquanto os dados não chegaram
  if (carregando) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)",
      }}>
        <p style={{ color: "#a0aec0" }}>Carregando histórico...</p>
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
      {/* Histórico → Roxo + Azul */}

      {/* Círculo superior direito — ROXO */}
      <div style={{
        position: "absolute", top: "-120px", right: "-120px",
        width: "450px", height: "450px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(108,99,255,0.35), transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Círculo inferior esquerdo — AZUL */}
      <div style={{
        position: "absolute", bottom: "-120px", left: "-120px",
        width: "450px", height: "450px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(37,99,235,0.3), transparent 70%)",
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
          maxWidth: "540px",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* ===== ENCABEZADO ===== */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
        }}>
          <div>
            <h1 style={{
              fontSize: "22px", fontWeight: "700", color: "#ffffff",
              margin: 0, fontFamily: "Poppins, sans-serif",
            }}>
              📋 Histórico de Corridas
            </h1>
            <p style={{
              color: "#a0aec0", fontSize: "13px", marginTop: "2px",
            }}>
              {corridas.length} corrida{corridas.length !== 1 ? "s" : ""} encontrada{corridas.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Botão voltar */}
          <button
            onClick={() => navigate("/menu")}
            style={{
              padding: "8px 16px",
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

        {/* Mensagem de erro */}
        {erro && (
          <div style={{
            background: "rgba(255,101,132,0.15)",
            border: "1px solid rgba(255,101,132,0.3)",
            color: "#ff6584",
            borderRadius: "12px",
            padding: "12px 16px",
            marginBottom: "20px",
            fontSize: "14px",
            textAlign: "center",
          }}>
            {erro}
          </div>
        )}

        {/* Lista vazia — quando não há corridas */}
        {!carregando && !erro && corridas.length === 0 && (
          <div style={{
            textAlign: "center",
            padding: "40px 20px",
            color: "#a0aec0",
          }}>
            <p style={{ fontSize: "48px", marginBottom: "12px" }}>🚕</p>
            <p style={{ fontSize: "16px" }}>Nenhuma corrida encontrada.</p>
            <p style={{ fontSize: "14px", marginTop: "4px" }}>
              Solicite uma nova corrida no menu principal.
            </p>
          </div>
        )}

        {/* Lista de corridas — quando há dados */}
        {!carregando && corridas.length > 0 && (
          <div style={{
            display: "flex",
            flexDirection: "column",      // Cards em coluna
            gap: "12px",                  // Espaço entre cards
          }}>

            {/* Itera sobre cada corrida e cria um card */}
            {corridas.map((corrida, index) => {
              const status = corrida.status || "pendente";
              const cores = coresStatus[status] || coresStatus.pendente;

              return (
                <motion.div
                  key={corrida.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: `2px solid ${cores.borda}`,
                    borderRadius: "14px",
                    padding: "16px 18px",
                    transition: "all 0.3s ease",
                  }}
                >
                  {/* ===== LIGNE 1 : Origem → Destino ===== */}
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}>
                    <span style={{
                      color: "#ffffff",
                      fontSize: "15px",
                      fontWeight: "600",
                    }}>
                      {corrida.origem} <span style={{ color: "#a0aec0" }}>→</span> {corrida.destino}
                    </span>
                    {/* Badge colorido com o status */}
                    <span style={{
                      background: cores.bg,
                      color: cores.texto,
                      padding: "2px 10px",
                      borderRadius: "20px",
                      fontSize: "11px",
                      fontWeight: "600",
                    }}>
                      {cores.label}
                    </span>
                  </div>

                  {/* ===== LIGNE 2 : Détails ===== */}
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "8px",
                  }}>
                    <div style={{
                      display: "flex",
                      gap: "16px",
                      fontSize: "12px",
                      color: "#a0aec0",
                    }}>
                      <span>🚗 {corrida.tipo_veiculo || "Não definido"}</span>
                      <span>📏 {corrida.distancia || 0} km</span>
                      <span>💰 R$ {corrida.valor?.toFixed(2) || "0.00"}</span>
                    </div>
                    <span style={{
                      fontSize: "11px",
                      color: "#a0aec0",
                    }}>
                      {formatarData(corrida.criado_em)}
                    </span>
                  </div>

                  {/* ===== BOTÕES DE AÇÃO ===== */}

                  {/* Botão cancelar — só para corridas pendentes */}
                  {corrida.status === "pendente" && (
                    <button
                      onClick={() => handleCancelar(corrida.id)}
                      style={{
                        marginTop: "12px",
                        padding: "8px 12px",
                        width: "100%",
                        background: "rgba(234,179,8,0.15)",
                        color: "#eab308",
                        border: "1px solid rgba(234,179,8,0.3)",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: "600",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "rgba(234,179,8,0.25)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "rgba(234,179,8,0.15)";
                      }}
                    >
                      ✕ Cancelar corrida
                    </button>
                  )}

                  {/* Botão pagar — só para corridas finalizadas E não pagas */}
                  {corrida.status === "finalizada" &&
                    !pagamentos.some((p) => p.corrida_id === corrida.id) && (
                    <button
                      onClick={() => navigate("/pagamento")}
                      style={{
                        marginTop: "12px",
                        padding: "8px 12px",
                        width: "100%",
                        background: "rgba(0,212,170,0.15)",
                        color: "#00d4aa",
                        border: "1px solid rgba(0,212,170,0.3)",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: "600",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "rgba(0,212,170,0.25)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "rgba(0,212,170,0.15)";
                      }}
                    >
                      💳 Pagar corrida
                    </button>
                  )}

                  {/* Corrida paga — mostrar botão avaliar ou "avaliado" */}
                  {corrida.status === "finalizada" &&
                    pagamentos.some((p) => p.corrida_id === corrida.id) && (
                    <div style={{ marginTop: "8px" }}>
                      <p style={{
                        fontSize: "13px",
                        color: "#00d4aa",
                        fontWeight: "600",
                        marginBottom: "4px",
                      }}>
                        ✅ Pago
                      </p>

                      {/* Botão avaliar — só se ainda não avaliou */}
                      {!avaliacoes.some((a) => a.corrida_id === corrida.id) && (
                        <button
                          onClick={() => navigate("/avaliacao", { state: { corridaId: corrida.id } })}
                          style={{
                            padding: "8px 12px",
                            width: "100%",
                            background: "rgba(234,179,8,0.15)",
                            color: "#eab308",
                            border: "1px solid rgba(234,179,8,0.3)",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "13px",
                            fontWeight: "600",
                            transition: "all 0.3s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = "rgba(234,179,8,0.25)";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = "rgba(234,179,8,0.15)";
                          }}
                        >
                          ⭐ Avaliar motorista
                        </button>
                      )}

                      {/* Já avaliado */}
                      {avaliacoes.some((a) => a.corrida_id === corrida.id) && (
                        <p style={{
                          fontSize: "13px",
                          color: "#eab308",
                          fontWeight: "600",
                        }}>
                          ⭐ Avaliado
                        </p>
                      )}
                    </div>
                  )}

                </motion.div>
              );
            })}

          </div>
        )}

      </motion.div>
    </div>
  );
}

export default Historico;
