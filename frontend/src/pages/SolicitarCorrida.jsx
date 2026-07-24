
// pages/SolicitarCorrida.jsx - Tela para solicitar uma corrida
// Fluxo: escolher veículo → mapa → ver preço → confirmar → aguardar motorista

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";
import Mapa from "./Mapa";


// ===================== COMPONENTE DE ESPERA =====================
// Verifica o status da corrida a cada 3 segundos até o motorista aceitar
function AguardandoMotorista({ corrida }) {
  const [status, setStatus] = useState(corrida.status);   // Status atual da corrida
  const [tentativas, setTentativas] = useState(0);        // Contador de verificações
  const navigate = useNavigate();

  useEffect(() => {
    // Se já está confirmada — motorista aceitou antes de entrar nesta tela
    if (status === "confirmada") return;

    // Verifica o status a cada 3 segundos
    const intervalo = setInterval(async () => {
      try {
        const resposta = await api.get(`/corridas/${corrida.id}`);
        setStatus(resposta.data.status);           // Atualiza o status
        setTentativas((t) => t + 1);               // Incrementa o contador

        // Se foi confirmada — para de verificar
        if (resposta.data.status === "confirmada") {
          clearInterval(intervalo);
        }

        // Se foi cancelada pelo motorista — para de verificar
        if (resposta.data.status === "cancelada") {
          clearInterval(intervalo);
        }

      } catch (err) {
        clearInterval(intervalo);   // Para em caso de erro
      }
    }, 3000);   // Verifica a cada 3 segundos

    // Limpa o intervalo quando o componente é desmontado
    return () => clearInterval(intervalo);
  }, [status]);   // Reinicia se o status mudar


  // ===== AGUARDANDO =====
  if (status === "pendente") {
    return (
      <div style={{textAlign: "center", padding: "20px"}}>
        {/* Ícone com animação de pulso */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <p style={{fontSize: "56px", margin: "0"}}>🔍</p>
        </motion.div>
        <h2 style={{color: "#ffffff", marginBottom: "8px", fontFamily: "Poppins, sans-serif"}}>
          Procurando motorista...
        </h2>
        <p style={{color: "#a0aec0", fontSize: "14px", marginBottom: "8px"}}>
          {corrida.origem} → {corrida.destino}
        </p>
        <p style={{
          color: "#6c63ff",
          fontSize: "32px",
          fontWeight: "700",
          marginBottom: "8px"
        }}>
          R${corrida.valor.toFixed(2)}
        </p>

        {/* Animação de pontos */}
        <p style={{color: "#a0aec0", fontSize: "14px", marginBottom: "24px"}}>
          Aguardando um motorista aceitar
          {".".repeat((tentativas % 3) + 1)}
        </p>

        <button 
          onClick={() => navigate("/historico")} 
          style={{
            padding: "10px 20px",
            background: "rgba(255,255,255,0.07)",
            color: "#a0aec0",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "14px",
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
          Ver histórico
        </button>
        
      </div>
    );
  }


  // ===== MOTORISTA ENCONTRADO =====
  if (status === "confirmada") {
    return (
      <div style={{textAlign: "center", padding: "20px"}}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <p style={{fontSize: "72px", margin: "0"}}>🎉</p>
        </motion.div>
        <h2 style={{color: "#00d4aa", marginBottom: "8px", fontFamily: "Poppins, sans-serif"}}>
          Motorista encontrado!
        </h2>
        <p style={{color: "#a0aec0", fontSize: "14px", marginBottom: "8px"}}>
          O teu motorista está a caminho.<br />
          Quando chegares ao destino, paga a corrida no histórico.
        </p>
        <p style={{
          color: "#6c63ff",
          fontSize: "32px",
          fontWeight: "700",
          marginBottom: "24px"
        }}>
          R${corrida.valor.toFixed(2)}
        </p>

        <div style={{display: "flex", flexDirection: "column", gap: "12px"}}>
          <button
            onClick={() => navigate("/historico")}
            style={{
              padding: "12px",
              background: "linear-gradient(135deg, #6c63ff, #8b85ff)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "15px",
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
            📋 Ver histórico
          </button>
          <button
            onClick={() => navigate("/menu")}
            style={{
              padding: "12px",
              background: "rgba(255,255,255,0.07)",
              color: "#a0aec0",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "15px",
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
            Voltar ao menu
          </button>
        </div>
      </div>
    );
  }


  // ===== CORRIDA CANCELADA =====
  return (
    <div style={{textAlign: "center", padding: "20px"}}>
      <p style={{fontSize: "56px", margin: "0"}}>❌</p>
      <h2 style={{color: "#ff6584", marginBottom: "8px", fontFamily: "Poppins, sans-serif"}}>
        Corrida cancelada
      </h2>
      <p style={{color: "#a0aec0", fontSize: "14px", marginBottom: "24px"}}>
        A corrida foi cancelada. Podes solicitar uma nova.
      </p>
      <button
        onClick={() => navigate("/corrida")}
        style={{
          padding: "12px 24px",
          background: "linear-gradient(135deg, #6c63ff, #8b85ff)",
          color: "white",
          border: "none",
          borderRadius: "12px",
          cursor: "pointer",
          fontSize: "15px",
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
        Solicitar nova corrida
      </button>
    </div>
  );
}


// ===================== COMPONENTE PRINCIPAL =====================

function SolicitarCorrida() {
  // ===================== ESTADOS =====================
  const [tipoVeiculo, setTipoVeiculo] = useState("Carro");
  const [fase, setFase] = useState("veiculo");   // "veiculo" → "mapa" → "confirmacao" → "sucesso"
  const [dadosMapa, setDadosMapa] = useState(null);  // Dados vindos do mapa
  const [corrida, setCorrida] = useState(null);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const navigate = useNavigate();

  // ===================== TARIFAS (para mostrar ao utilizador) =====================
  // Mesmo dicionário que existe no backend — só para exibição
  const tarifas = { Moto: 1.0, Carro: 2.0, VIP: 4.0 };

  // ===================== QUANDO MAPA CONFIRMA =====================
  const handleMapaConfirmar = (dados) => {
    setDadosMapa(dados);
    setFase("confirmacao");
  };

  // ===================== SOLICITAR CORRIDA =====================
  const handleSolicitar = async () => {
    setErro("");
    setCarregando(true);

    try {
      const resposta = await api.post("/corridas", {
        origem: dadosMapa.origem,
        origem_lat: dadosMapa.origem_lat,
        origem_lng: dadosMapa.origem_lng,
        destino: dadosMapa.destino,
        destino_lat: dadosMapa.destino_lat,
        destino_lng: dadosMapa.destino_lng,
        tipo_veiculo: tipoVeiculo,
      });

      setCorrida(resposta.data);
      setFase("sucesso");

    } catch (err) {
      setErro(err.response?.data?.detail || "Erro ao solicitar corrida");
    } finally {
      setCarregando(false);
    }
  };


  // ===================== CANCELAR CORRIDA AO VER O PREÇO =====================
  const handleCancelarCorrida = async () => {
    setCarregando(true);
    try {
      // Chama o endpoint de cancelamento do passageiro
      // Muda o status de "pendente" para "cancelada" no banco
      await api.patch(`/corridas/${corrida.id}/passageiro/cancelar`);
    } catch (err) {
      // Se falhar, mostra o erro mas volta ao menu de qualquer forma
      console.error("Erro ao cancelar corrida:", err);
    } finally {
      setCarregando(false);
      navigate("/menu");   // Volta ao menu independentemente do resultado
    }
  };
  

  // ===================== FASE ESCOLHER VEÍCULO =====================
  if (fase === "veiculo") {
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
        {/* Solicitar Corrida → Roxo + Verde */}

        {/* Círculo superior direito — ROXO */}
        <div style={{
          position: "absolute", top: "-120px", right: "-120px",
          width: "450px", height: "450px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(108,99,255,0.35), transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Círculo inferior esquerdo — VERDE */}
        <div style={{
          position: "absolute", bottom: "-120px", left: "-120px",
          width: "450px", height: "450px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,212,170,0.3), transparent 70%)",
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
            maxWidth: "480px",
            position: "relative",
            zIndex: 10,
          }}
        >
          <button
            onClick={() => navigate("/menu")}
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
            marginBottom: "8px",
            fontSize: "22px",
            fontFamily: "Poppins, sans-serif",
          }}>
            🚕 Solicitar Corrida
          </h2>
          <p style={{
            color: "#a0aec0",
            fontSize: "14px",
            marginBottom: "24px",
          }}>
            Escolhe o tipo de veículo para continuar.
          </p>

          <div style={{
            display: "flex",
            gap: "10px",
            marginBottom: "24px",
          }}>
            {["Moto", "Carro", "VIP"].map((tipo) => (
              <motion.div
                key={tipo}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTipoVeiculo(tipo)}
                style={{
                  flex: 1,
                  padding: "16px 8px",
                  background: tipoVeiculo === tipo
                    ? "rgba(108,99,255,0.2)"
                    : "rgba(255,255,255,0.05)",
                  border: tipoVeiculo === tipo
                    ? "2px solid #6c63ff"
                    : "2px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 0.3s ease",
                }}
              >
                <p style={{
                  fontSize: "32px",
                  margin: "0 0 4px 0",
                }}>
                  {tipo === "Moto" ? "🏍️" : tipo === "Carro" ? "🚗" : "⭐"}
                </p>
                <p style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#ffffff",
                  margin: "0 0 2px 0",
                }}>
                  {tipo}
                </p>
                <p style={{
                  fontSize: "12px",
                  color: "#a0aec0",
                  margin: "0",
                }}>
                  R${tarifas[tipo].toFixed(2)}/km
                </p>
              </motion.div>
            ))}
          </div>

          <button
            onClick={() => setFase("mapa")}
            style={{
              width: "100%",
              padding: "14px",
              background: "linear-gradient(135deg, #6c63ff, #8b85ff)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "15px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "scale(1.02)";
              e.target.style.boxShadow = "0 0 20px rgba(108,99,255,0.3)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "scale(1)";
              e.target.style.boxShadow = "none";
            }}
          >
            Escolher no mapa →
          </button>
        </motion.div>  {/* ✅ CORRIGIDO */}
      </div>
    );
  }


  // ===================== FASE MAPA =====================
  if (fase === "mapa") {
    return (
      <div style={{position: "relative", height: "100vh"}}>
        {/* Botão voltar sobreposto ao mapa */}
        <button
          onClick={() => setFase("veiculo")}
          style={{
            position: "absolute",
            top: "16px",
            left: "356px",
            zIndex: 1001,
            background: "rgba(255,255,255,0.07)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "10px",
            padding: "8px 14px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "13px",
            color: "#a0aec0",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "rgba(255,255,255,0.15)";
            e.target.style.color = "#ffffff";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "rgba(255,255,255,0.07)";
            e.target.style.color = "#a0aec0";
          }}
        >
          ← Voltar
        </button>
        <Mapa onConfirmar={handleMapaConfirmar} />
      </div>
    );
  }

  // ===================== FASE CONFIRMAÇÃO =====================
  if (fase === "confirmacao") {
    const valorEstimado = dadosMapa
      ? (dadosMapa.distancia * tarifas[tipoVeiculo]).toFixed(2)
      : "0.00";

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
          position: "absolute", top: "-120px", right: "-120px",
          width: "450px", height: "450px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(108,99,255,0.35), transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "-120px", left: "-120px",
          width: "450px", height: "450px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,212,170,0.3), transparent 70%)",
          pointerEvents: "none",
        }} />

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
            maxWidth: "480px",
            position: "relative",
            zIndex: 10,
          }}
        >
          <h2 style={{
            color: "#ffffff",
            marginBottom: "24px",
            fontSize: "22px",
            fontFamily: "Poppins, sans-serif",
          }}>
            📋 Confirmar Corrida
          </h2>

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

          <div style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            padding: "16px",
            borderRadius: "12px",
            marginBottom: "24px",
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "6px 0",
            }}>
              <span style={{ color: "#a0aec0", fontSize: "14px" }}>Origem</span>
              <span style={{ color: "#ffffff", fontSize: "14px", fontWeight: "600" }}>
                {dadosMapa?.origem}
              </span>
            </div>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "6px 0",
            }}>
              <span style={{ color: "#a0aec0", fontSize: "14px" }}>Destino</span>
              <span style={{ color: "#ffffff", fontSize: "14px", fontWeight: "600" }}>
                {dadosMapa?.destino}
              </span>
            </div>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "6px 0",
            }}>
              <span style={{ color: "#a0aec0", fontSize: "14px" }}>Veículo</span>
              <span style={{ color: "#ffffff", fontSize: "14px", fontWeight: "600" }}>
                {tipoVeiculo}
              </span>
            </div>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "6px 0",
            }}>
              <span style={{ color: "#a0aec0", fontSize: "14px" }}>Distância</span>
              <span style={{ color: "#ffffff", fontSize: "14px", fontWeight: "600" }}>
                {dadosMapa?.distancia} km
              </span>
            </div>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              borderTop: "2px solid rgba(255,255,255,0.1)",
              paddingTop: "12px",
              marginTop: "4px",
            }}>
              <span style={{
                color: "#a0aec0",
                fontSize: "16px",
                fontWeight: "700",
              }}>
                Total estimado
              </span>
              <span style={{
                color: "#6c63ff",
                fontSize: "22px",
                fontWeight: "700",
              }}>
                R${valorEstimado}
              </span>
            </div>
          </div>

          <div style={{display: "flex", gap: "12px"}}>
            <button
              onClick={() => setFase("mapa")}
              style={{
                flex: 1,
                padding: "12px",
                background: "rgba(255,255,255,0.07)",
                color: "#a0aec0",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(255,255,255,0.15)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(255,255,255,0.07)";
              }}
            >
              ← Editar
            </button>
            <button
              onClick={handleSolicitar}
              disabled={carregando}
              style={{
                flex: 1,
                padding: "12px",
                background: carregando
                  ? "rgba(108,99,255,0.5)"
                  : "linear-gradient(135deg, #6c63ff, #8b85ff)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: "600",
                cursor: carregando ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
              }}
            >
              {carregando ? "Solicitando..." : "✓ Confirmar"}
            </button>
          </div>

        </motion.div>  {/* ✅ CORRIGIDO */}
      </div>
    );
  }


  // ===================== FASE SUCESSO =====================
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
        position: "absolute", top: "-120px", right: "-120px",
        width: "450px", height: "450px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(108,99,255,0.35), transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-120px", left: "-120px",
        width: "450px", height: "450px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,212,170,0.3), transparent 70%)",
        pointerEvents: "none",
      }} />

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
          maxWidth: "480px",
          position: "relative",
          zIndex: 10,
        }}
      >
        {corrida && <AguardandoMotorista corrida={corrida} />}
      </motion.div>  {/* ✅ CORRIGIDO */}
    </div>
  );
}

export default SolicitarCorrida;

