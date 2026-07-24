
// pages/Pagamento.jsx - Tela de pagamento de corridas
// Lista corridas finalizadas e permite escolher o método de pagamento
// Design moderno com glassmorphism, cards interativos e animações

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";


function Pagamento() {
  // ===================== ESTADOS =====================

  const [corridas, setCorridas] = useState([]);        // Todas as corridas do utilizador
  const [pagamentos, setPagamentos] = useState([]);    // Todos os pagamentos já feitos
  const [corridaSelecionada, setCorridaSelecionada] = useState(null); // Corrida escolhida para pagar
  const [metodo, setMetodo] = useState("pix");         // Método de pagamento — padrão PIX
  const [fase, setFase] = useState("lista");           // "lista" → "confirmacao" → "sucesso"
  const [pagamentoFeito, setPagamentoFeito] = useState(null); // Dados do pagamento após sucesso
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const navigate = useNavigate();


  // ===================== BUSCAR DADOS AO CARREGAR =====================
  useEffect(() => {
    const buscarDados = async () => {
      try {
        // Busca corridas e pagamentos em paralelo — mais rápido que sequencial
        // Promise.all executa as duas requisições ao mesmo tempo
        const [respostaCorridas, respostaPagamentos] = await Promise.all([
          api.get("/corridas"),    // GET /corridas — todas as corridas
          api.get("/pagamentos"),  // GET /pagamentos — todos os pagamentos
        ]);

        setCorridas(respostaCorridas.data);
        setPagamentos(respostaPagamentos.data);
      } catch (err) {
        setErro("Erro ao carregar dados. Tente novamente.");
      } finally {
        setCarregando(false);
      }
    };

    buscarDados();
  }, []);


  // ===================== CORRIDAS DISPONÍVEIS PARA PAGAR =====================
  // Filtra apenas corridas finalizadas que ainda não foram pagas
  const corridasParaPagar = corridas.filter((corrida) => {
    const jaPaga = pagamentos.some(
      // some() retorna true se pelo menos um elemento satisfaz a condição
      (pagamento) => pagamento.corrida_id === corrida.id
    );
    // Mantém apenas corridas finalizadas E que não têm pagamento
    return corrida.status === "finalizada" && !jaPaga;
  });


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


  // ===================== FUNÇÃO PARA PROCESSAR PAGAMENTO =====================
  const handlePagar = async () => {
    setErro("");
    setCarregando(true);

    try {
      // Chama POST /pagamentos com o ID da corrida e o método escolhido
      const resposta = await api.post("/pagamentos", {
        corrida_id: corridaSelecionada.id,
        metodo,
      });

      setPagamentoFeito(resposta.data); // Guarda os dados do pagamento
      setFase("sucesso");               // Avança para a fase de sucesso

    } catch (err) {
      setErro(err.response?.data?.detail || "Erro ao processar pagamento");
    } finally {
      setCarregando(false);
    }
  };


  // ===================== INTERFACE — FASE LISTA =====================
  if (fase === "lista") {
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
        {/* Pagamento → Verde + Roxo */}

        <div style={{
          position: "absolute", top: "-120px", right: "-120px",
          width: "450px", height: "450px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,212,170,0.35), transparent 70%)",
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
            maxWidth: "480px",
            maxHeight: "90vh",
            overflowY: "auto",
            position: "relative",
            zIndex: 10,
          }}
        >
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}>
            <h2 style={{
              color: "#ffffff",
              marginBottom: "0",
              fontSize: "20px",
              fontFamily: "Poppins, sans-serif",
            }}>
              💳 Pagamentos
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

          {carregando && <p style={{ color: "#a0aec0", textAlign: "center" }}>Carregando...</p>}
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

          {/* Lista vazia — com botão para solicitar corrida */}
          {!carregando && corridasParaPagar.length === 0 && (
            <div style={{
              textAlign: "center",
              padding: "40px 20px",
              color: "#a0aec0",
            }}>
              <p style={{ fontSize: "48px", margin: "0" }}>✅</p>
              <p style={{ fontSize: "16px" }}>Nenhuma corrida pendente de pagamento.</p>
              <p style={{ fontSize: "14px", marginTop: "4px" }}>
                Todas as corridas já foram pagas.
              </p>
              {/* ✅ BOTÃO SOLICITAR CORRIDA RESTAURADO */}
              <button
                onClick={() => navigate("/corrida")}
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
                Solicitar corrida
              </button>
            </div>
          )}

          {/* Lista de corridas disponíveis para pagar */}
          {!carregando && corridasParaPagar.length > 0 && (
            <div>
              <p style={{
                color: "#a0aec0",
                fontSize: "14px",
                marginBottom: "16px",
              }}>
                Selecione uma corrida para pagar:
              </p>

              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}>
                {corridasParaPagar.map((corrida, index) => (
                  <motion.div
                    key={corrida.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02, borderColor: "#00d4aa" }}
                    onClick={() => {
                      setCorridaSelecionada(corrida);
                      setFase("confirmacao");
                    }}
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "2px solid rgba(0,212,170,0.3)",
                      borderRadius: "14px",
                      padding: "16px 18px",
                      cursor: "pointer",
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
                        fontWeight: "600",
                        color: "#ffffff",
                        fontSize: "14px",
                        margin: "0",
                        flex: 1,
                        marginRight: "12px",
                      }}>
                        {corrida.origem} → {corrida.destino}
                      </p>
                      <span style={{
                        fontWeight: "700",
                        color: "#00d4aa",
                        fontSize: "16px",
                      }}>
                        R${corrida.valor.toFixed(2)}
                      </span>
                    </div>

                    <div style={{
                      display: "flex",
                      gap: "16px",
                      marginBottom: "4px",
                    }}>
                      <span style={{ fontSize: "13px", color: "#a0aec0" }}>
                        🚗 {corrida.tipo_veiculo}
                      </span>
                      <span style={{ fontSize: "13px", color: "#a0aec0" }}>
                        📏 {corrida.distancia} km
                      </span>
                    </div>

                    <p style={{
                      fontSize: "11px",
                      color: "rgba(0,212,170,0.5)",
                      margin: "4px 0 0 0",
                    }}>
                      {formatarData(corrida.criado_em)}
                    </p>

                    <p style={{
                      fontSize: "12px",
                      color: "#00d4aa",
                      margin: "6px 0 0 0",
                      fontWeight: "600",
                    }}>
                      Clique para pagar →
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

        </motion.div>
      </div>
    );
  }


  // ===================== INTERFACE — FASE CONFIRMAÇÃO =====================
  if (fase === "confirmacao") {
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

        <div style={{
          position: "absolute", top: "-120px", right: "-120px",
          width: "450px", height: "450px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,212,170,0.35), transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{
          position: "absolute", bottom: "-120px", left: "-120px",
          width: "450px", height: "450px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(108,99,255,0.3), transparent 70%)",
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
            fontSize: "20px",
            fontFamily: "Poppins, sans-serif",
          }}>
            💳 Confirmar Pagamento
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

          {/* Resumo da corrida */}
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
                {corridaSelecionada.origem}
              </span>
            </div>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "6px 0",
            }}>
              <span style={{ color: "#a0aec0", fontSize: "14px" }}>Destino</span>
              <span style={{ color: "#ffffff", fontSize: "14px", fontWeight: "600" }}>
                {corridaSelecionada.destino}
              </span>
            </div>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "6px 0",
            }}>
              <span style={{ color: "#a0aec0", fontSize: "14px" }}>Veículo</span>
              <span style={{ color: "#ffffff", fontSize: "14px", fontWeight: "600" }}>
                {corridaSelecionada.tipo_veiculo}
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
                Total
              </span>
              <span style={{
                color: "#00d4aa",
                fontSize: "22px",
                fontWeight: "700",
              }}>
                R${corridaSelecionada.valor.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Sélection du mode de paiement */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              marginBottom: "10px",
              color: "#a0aec0",
              fontSize: "14px",
              fontWeight: "600",
            }}>
              Forma de pagamento
            </label>
            <div style={{
              display: "flex",
              gap: "10px",
            }}>
              {[
                { id: "pix", emoji: "⚡", nome: "PIX" },
                { id: "cartao", emoji: "💳", nome: "Cartão" },
                { id: "dinheiro", emoji: "💵", nome: "Dinheiro" },
              ].map((m) => (
                <motion.div
                  key={m.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMetodo(m.id)}
                  style={{
                    flex: 1,
                    padding: "12px 8px",
                    background: metodo === m.id
                      ? "rgba(0,212,170,0.2)"
                      : "rgba(255,255,255,0.05)",
                    border: metodo === m.id
                      ? "2px solid #00d4aa"
                      : "2px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "all 0.3s ease",
                  }}
                >
                  <p style={{ fontSize: "24px", margin: "0 0 4px 0" }}>{m.emoji}</p>
                  <p style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: metodo === m.id ? "#00d4aa" : "#a0aec0",
                    margin: "0",
                  }}>
                    {m.nome}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Boutons */}
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => setFase("lista")}
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
              Voltar
            </button>
            <button
              onClick={handlePagar}
              disabled={carregando}
              style={{
                flex: 1,
                padding: "12px",
                background: carregando
                  ? "rgba(0,212,170,0.3)"
                  : "linear-gradient(135deg, #00d4aa, #00b894)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: "600",
                cursor: carregando ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
              }}
            >
              {carregando ? "Processando..." : "✓ Pagar"}
            </button>
          </div>

        </motion.div>
      </div>
    );
  }


  // ===================== INTERFACE — FASE SUCESSO =====================
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

      <div style={{
        position: "absolute", top: "-120px", right: "-120px",
        width: "450px", height: "450px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,212,170,0.35), transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{
        position: "absolute", bottom: "-120px", left: "-120px",
        width: "450px", height: "450px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(108,99,255,0.3), transparent 70%)",
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
        <div style={{ textAlign: "center" }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <p style={{ fontSize: "72px", margin: "0" }}>✅</p>
          </motion.div>
          <h2 style={{
            color: "#00d4aa",
            marginBottom: "24px",
            fontSize: "22px",
            fontFamily: "Poppins, sans-serif",
          }}>
            Pagamento Aprovado!
          </h2>

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
              <span style={{ color: "#a0aec0", fontSize: "14px" }}>Método</span>
              <span style={{ color: "#ffffff", fontSize: "14px", fontWeight: "600" }}>
                {pagamentoFeito.metodo.toUpperCase()}
              </span>
            </div>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "6px 0",
            }}>
              <span style={{ color: "#a0aec0", fontSize: "14px" }}>Status</span>
              <span style={{ color: "#00d4aa", fontSize: "14px", fontWeight: "600" }}>
                {pagamentoFeito.status}
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
                Valor pago
              </span>
              <span style={{
                color: "#00d4aa",
                fontSize: "22px",
                fontWeight: "700",
              }}>
                R${pagamentoFeito.valor.toFixed(2)}
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate("/menu")}
            style={{
              width: "100%",
              padding: "14px",
              background: "linear-gradient(135deg, #00d4aa, #00b894)",
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
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "scale(1)";
            }}
          >
            Voltar ao menu
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default Pagamento;

