
// pages/motorista/HistoricoMotorista.jsx - Histórico de corridas do motorista
// Mostra todas as corridas que o motorista aceitou — confirmadas, finalizadas e canceladas
// Design moderno com glassmorphism, cards coloridos por status e resumo em cards

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api/axios";   // Dois níveis acima — pasta motorista está dentro de pages


function HistoricoMotorista() {
  // ===================== ESTADOS =====================

  const [corridas, setCorridas] = useState([]);        // Lista de corridas do motorista
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const navigate = useNavigate();


  // ===================== BUSCAR HISTÓRICO =====================
  useEffect(() => {
    const buscarHistorico = async () => {
      try {
        // Chama GET /corridas/motorista/minhas — só motoristas podem chamar
        const resposta = await api.get("/corridas/motorista/minhas");
        setCorridas(resposta.data);
      } catch (err) {
        setErro("Erro ao carregar histórico. Tente novamente.");
      } finally {
        setCarregando(false);
      }
    };

    buscarHistorico();
  }, []); // [] = executa apenas uma vez ao montar


  // ===================== CORES POR STATUS =====================
  // Mesmo mapeamento que no Historico.jsx do passageiro
  const coresStatus = {
    pendente: { borda: "#eab308", bg: "rgba(234,179,8,0.1)", texto: "#eab308", label: "⏳ Pendente" },
    confirmada: { borda: "#6c63ff", bg: "rgba(108,99,255,0.1)", texto: "#6c63ff", label: "✅ Confirmada" },
    finalizada: { borda: "#00d4aa", bg: "rgba(0,212,170,0.1)", texto: "#00d4aa", label: "🏁 Finalizada" },
    cancelada: { borda: "#ff6584", bg: "rgba(255,101,132,0.1)", texto: "#ff6584", label: "❌ Cancelada" },
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
      {/* Histórico Motorista → Roxo + Azul (mesmo do passageiro) */}

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
              📋 Meu Histórico
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

        {/* Lista vazia */}
        {!carregando && !erro && corridas.length === 0 && (
          <div style={{
            textAlign: "center",
            padding: "40px 20px",
            color: "#a0aec0",
          }}>
            <p style={{ fontSize: "48px", marginBottom: "12px" }}>🚗</p>
            <p style={{ fontSize: "16px" }}>Nenhuma corrida no histórico.</p>
            <p style={{ fontSize: "14px", marginTop: "4px" }}>
              As corridas que aceitares aparecerão aqui.
            </p>
            <button
              onClick={() => navigate("/motorista/corridas")}
              style={{
                marginTop: "20px",
                padding: "12px 24px",
                background: "linear-gradient(135deg, #6c63ff, #8b85ff)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "scale(1.02)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "scale(1)";
              }}
            >
              Ver corridas disponíveis
            </button>
          </div>
        )}

        {/* Resumo — total de corridas por status */}
        {!carregando && corridas.length > 0 && (
          <>
            {/* Cards de resumo */}
            <div style={{
              display: "flex",
              gap: "12px",
              marginBottom: "20px",
            }}>
              <div style={{
                flex: 1,
                border: "1px solid rgba(108,99,255,0.3)",
                borderRadius: "12px",
                padding: "12px",
                textAlign: "center",
                background: "rgba(108,99,255,0.05)",
              }}>
                <p style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#6c63ff",
                  margin: "0 0 4px 0",
                }}>
                  {corridas.filter(c => c.status === "confirmada").length}
                </p>
                <p style={{
                  fontSize: "12px",
                  color: "#a0aec0",
                  margin: "0",
                }}>
                  Em curso
                </p>
              </div>

              <div style={{
                flex: 1,
                border: "1px solid rgba(0,212,170,0.3)",
                borderRadius: "12px",
                padding: "12px",
                textAlign: "center",
                background: "rgba(0,212,170,0.05)",
              }}>
                <p style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#00d4aa",
                  margin: "0 0 4px 0",
                }}>
                  {corridas.filter(c => c.status === "finalizada").length}
                </p>
                <p style={{
                  fontSize: "12px",
                  color: "#a0aec0",
                  margin: "0",
                }}>
                  Finalizadas
                </p>
              </div>

              <div style={{
                flex: 1,
                border: "1px solid rgba(255,101,132,0.3)",
                borderRadius: "12px",
                padding: "12px",
                textAlign: "center",
                background: "rgba(255,101,132,0.05)",
              }}>
                <p style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#ff6584",
                  margin: "0 0 4px 0",
                }}>
                  {corridas.filter(c => c.status === "cancelada").length}
                </p>
                <p style={{
                  fontSize: "12px",
                  color: "#a0aec0",
                  margin: "0",
                }}>
                  Canceladas
                </p>
              </div>
            </div>

            {/* Lista de corridas */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}>
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
                  </motion.div>
                );
              })}
            </div>
          </>
        )}

      </motion.div>
    </div>
  );
}

export default HistoricoMotorista;

