
// pages/motorista/CorridasMotorista.jsx - Tela de corridas do motorista
// Mostra corridas pendentes (para aceitar) e corridas confirmadas (para cancelar)
// Design moderno com glassmorphism, seções separadas e cores personalizadas

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api/axios";


function CorridasMotorista() {
  // ===================== ESTADOS =====================

  const [corridasPendentes, setCorridasPendentes] = useState([]);   // Corridas disponíveis para aceitar
  const [corridasConfirmadas, setCorridasConfirmadas] = useState([]); // Corridas que o motorista aceitou
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const navigate = useNavigate();


  // ===================== BUSCAR CORRIDAS =====================
  const buscarCorridas = async () => {
    setCarregando(true);
    setErro("");
    try {
      // Busca as duas listas em paralelo — mais rápido que sequencial
      const [respostaPendentes, respostaMinhas] = await Promise.all([
        api.get("/corridas/pendentes"),        // Corridas disponíveis para aceitar
        api.get("/corridas/motorista/minhas"), // Todas as corridas do motorista
      ]);

      setCorridasPendentes(respostaPendentes.data);

      // Filtra apenas as confirmadas do histórico do motorista
      // São as que ele aceitou e ainda pode cancelar
      const confirmadas = respostaMinhas.data.filter(
        (c) => c.status === "confirmada"
      );
      setCorridasConfirmadas(confirmadas);

    } catch (err) {
      setErro("Erro ao carregar corridas. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarCorridas();
  }, []);


  // ===================== ACEITAR CORRIDA =====================
  const handleAceitar = async (corridaId) => {
    setErro("");
    setMensagem("");
    try {
      await api.patch(`/corridas/${corridaId}/aceitar`);
      setMensagem("✅ Corrida aceita com sucesso!");
      buscarCorridas(); // Atualiza as duas listas
    } catch (err) {
      setErro(err.response?.data?.detail || "Erro ao aceitar corrida");
    }
  };


  // ===================== RECUSAR CORRIDA =====================
  const handleRecusar = async (corridaId) => {
    const confirmar = window.confirm(
      "Recusar esta corrida?\nEla continuará disponível para outros motoristas."
    );
    if (!confirmar) return;

    setErro("");
    setMensagem("");
    try {
      // Chama PATCH /corridas/{id}/recusar
      await api.patch(`/corridas/${corridaId}/recusar`);
      setMensagem("Corrida recusada. Ela continua disponível para outros motoristas.");
      buscarCorridas(); // Atualiza a lista
    } catch (err) {
      setErro(err.response?.data?.detail || "Erro ao recusar corrida");
    }
  };


  // ===================== CANCELAR CORRIDA =====================
  const handleCancelar = async (corridaId) => {
    const confirmar = window.confirm(
      "Tem certeza que deseja cancelar esta corrida?\nIsso contará como um cancelamento no seu limite diário."
    );
    if (!confirmar) return;

    setErro("");
    setMensagem("");
    try {
      await api.patch(`/corridas/${corridaId}/cancelar`, {
        motivo: "Motorista cancelou após aceitar"
      });
      setMensagem("Corrida cancelada. Ela voltou para a fila de corridas pendentes.");
      buscarCorridas(); // Atualiza as duas listas
    } catch (err) {
      setErro(err.response?.data?.detail || "Erro ao cancelar corrida");
    }
  };


  // ===================== FINALIZAR CORRIDA =====================
  const handleFinalizar = async (corridaId) => {
    const confirmar = window.confirm(
      "Confirmar que o passageiro chegou ao destino?"
    );
    if (!confirmar) return;

    setErro("");
    setMensagem("");
    try {
      // Chama PATCH /corridas/{id}/finalizar — agora é o motorista que finaliza
      await api.patch(`/corridas/${corridaId}/finalizar`);
      setMensagem("✅ Corrida finalizada com sucesso!");
      buscarCorridas(); // Atualiza as duas listas
    } catch (err) {
      setErro(err.response?.data?.detail || "Erro ao finalizar corrida");
    }
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
        <p style={{ color: "#a0aec0" }}>Carregando corridas...</p>
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
      {/* Motorista → Verde + Roxo */}

      {/* Círculo superior direito — VERDE */}
      <div style={{
        position: "absolute", top: "-120px", right: "-120px",
        width: "450px", height: "450px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,212,170,0.35), transparent 70%)",
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
          maxWidth: "540px",
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
          <div>
            <h2 style={{
              color: "#ffffff",
              fontSize: "20px",
              margin: "0",
              fontFamily: "Poppins, sans-serif",
            }}>
              🚕 Minhas Corridas
            </h2>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
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
            <button
              onClick={buscarCorridas}
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
              🔄 Atualizar
            </button>
          </div>
        </div>

        {/* Mensagens */}
        {mensagem && (
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
            {mensagem}
          </div>
        )}
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

        {!carregando && (
          <>
            {/* ===== CORRIDAS QUE O MOTORISTA ACEITOU ===== */}
            {corridasConfirmadas.length > 0 && (
              <div style={{
                marginBottom: "28px",
              }}>
                <h3 style={{
                  color: "#00d4aa",
                  fontSize: "15px",
                  marginBottom: "4px",
                  fontFamily: "Poppins, sans-serif",
                }}>
                  ✅ Em andamento
                </h3>
                <p style={{
                  color: "#a0aec0",
                  fontSize: "13px",
                  marginBottom: "12px",
                }}>
                  Corridas que aceitaste — podes finalizar ou cancelar.
                </p>

                {/* Linha divisória */}
                <div style={{
                  borderBottom: "1px solid rgba(0,212,170,0.2)",
                  marginBottom: "16px",
                }} />

                {corridasConfirmadas.map((corrida, index) => (
                  <motion.div
                    key={corrida.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.01 }}
                    style={{
                      background: "rgba(0,212,170,0.05)",
                      border: "2px solid #00d4aa",
                      borderRadius: "14px",
                      padding: "16px 18px",
                      marginBottom: "12px",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <p style={{
                      fontWeight: "700",
                      color: "#ffffff",
                      fontSize: "15px",
                      margin: "0 0 8px 0",
                    }}>
                      {corrida.origem} → {corrida.destino}
                    </p>

                    <div style={{
                      display: "flex",
                      gap: "16px",
                      marginBottom: "8px",
                    }}>
                      <span style={{ fontSize: "13px", color: "#a0aec0" }}>
                        🚗 {corrida.tipo_veiculo}
                      </span>
                      <span style={{ fontSize: "13px", color: "#a0aec0" }}>
                        📏 {corrida.distancia} km
                      </span>
                      <span style={{ fontSize: "13px", color: "#a0aec0" }}>
                        💰 R${corrida.valor.toFixed(2)}
                      </span>
                    </div>

                    <span style={{
                      display: "inline-block",
                      padding: "2px 10px",
                      background: "rgba(0,212,170,0.15)",
                      color: "#00d4aa",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "600",
                      marginBottom: "12px",
                    }}>
                      confirmada
                    </span>

                    <div style={{
                      display: "flex",
                      gap: "10px",
                    }}>
                      <button
                        onClick={() => handleFinalizar(corrida.id)}
                        style={{
                          flex: 1,
                          padding: "10px",
                          background: "linear-gradient(135deg, #00d4aa, #00b894)",
                          color: "white",
                          border: "none",
                          borderRadius: "10px",
                          cursor: "pointer",
                          fontWeight: "600",
                          fontSize: "14px",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = "scale(1.02)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = "scale(1)";
                        }}
                      >
                        ✓ Finalizar
                      </button>
                      <button
                        onClick={() => handleCancelar(corrida.id)}
                        style={{
                          flex: 1,
                          padding: "10px",
                          background: "rgba(255,101,132,0.15)",
                          color: "#ff6584",
                          border: "1px solid rgba(255,101,132,0.3)",
                          borderRadius: "10px",
                          cursor: "pointer",
                          fontWeight: "600",
                          fontSize: "14px",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = "rgba(255,101,132,0.25)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = "rgba(255,101,132,0.15)";
                        }}
                      >
                        ✕ Cancelar
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* ===== CORRIDAS PENDENTES DISPONÍVEIS ===== */}
            <div style={{
              marginBottom: "0",
            }}>
              <h3 style={{
                color: "#6c63ff",
                fontSize: "15px",
                marginBottom: "4px",
                fontFamily: "Poppins, sans-serif",
              }}>
                🔍 Corridas disponíveis
              </h3>
              <p style={{
                color: "#a0aec0",
                fontSize: "13px",
                marginBottom: "12px",
              }}>
                Corridas à espera de um motorista.
              </p>

              {/* Linha divisória */}
              {corridasConfirmadas.length > 0 && (
                <div style={{
                  borderBottom: "1px solid rgba(108,99,255,0.2)",
                  marginBottom: "16px",
                }} />
              )}

              {corridasPendentes.length === 0 ? (
                <div style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  color: "#a0aec0",
                }}>
                  <p style={{ fontSize: "40px", margin: "0" }}>🔍</p>
                  <p style={{ fontSize: "14px", marginTop: "8px" }}>
                    Nenhuma corrida pendente no momento.
                  </p>
                </div>
              ) : (
                corridasPendentes.map((corrida, index) => (
                  <motion.div
                    key={corrida.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.01 }}
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "2px solid rgba(108,99,255,0.3)",
                      borderRadius: "14px",
                      padding: "16px 18px",
                      marginBottom: "12px",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <p style={{
                      fontWeight: "700",
                      color: "#ffffff",
                      fontSize: "15px",
                      margin: "0 0 8px 0",
                    }}>
                      {corrida.origem} → {corrida.destino}
                    </p>

                    <div style={{
                      display: "flex",
                      gap: "16px",
                      marginBottom: "8px",
                    }}>
                      <span style={{ fontSize: "13px", color: "#a0aec0" }}>
                        🚗 {corrida.tipo_veiculo}
                      </span>
                      <span style={{ fontSize: "13px", color: "#a0aec0" }}>
                        📏 {corrida.distancia} km
                      </span>
                      <span style={{ fontSize: "13px", color: "#a0aec0" }}>
                        💰 R${corrida.valor.toFixed(2)}
                      </span>
                    </div>

                    <span style={{
                      display: "inline-block",
                      padding: "2px 10px",
                      background: "rgba(234,179,8,0.15)",
                      color: "#eab308",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "600",
                      marginBottom: "12px",
                    }}>
                      pendente
                    </span>

                    <div style={{
                      display: "flex",
                      gap: "10px",
                    }}>
                      <button
                        onClick={() => handleAceitar(corrida.id)}
                        style={{
                          flex: 1,
                          padding: "10px",
                          background: "linear-gradient(135deg, #6c63ff, #8b85ff)",
                          color: "white",
                          border: "none",
                          borderRadius: "10px",
                          cursor: "pointer",
                          fontWeight: "600",
                          fontSize: "14px",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = "scale(1.02)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = "scale(1)";
                        }}
                      >
                        ✓ Aceitar
                      </button>
                      <button
                        onClick={() => handleRecusar(corrida.id)}
                        style={{
                          flex: 1,
                          padding: "10px",
                          background: "rgba(255,255,255,0.07)",
                          color: "#a0aec0",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "10px",
                          cursor: "pointer",
                          fontWeight: "600",
                          fontSize: "14px",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = "rgba(255,255,255,0.15)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = "rgba(255,255,255,0.07)";
                        }}
                      >
                        ✕ Recusar
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </>
        )}

      </motion.div>
    </div>
  );
}

export default CorridasMotorista;

