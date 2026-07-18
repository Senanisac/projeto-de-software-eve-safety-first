
// pages/motorista/CorridasMotorista.jsx - Tela de corridas do motorista
// Mostra corridas pendentes (para aceitar) e corridas confirmadas (para cancelar)

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  return (
    <div style={estilos.container}>
      <div style={estilos.caixa}>

        {/* Cabeçalho */}
        <button onClick={() => navigate("/menu")} style={estilos.botaoVoltar}>
          ← Voltar
        </button>
        <div style={estilos.cabecalho}>
          <h2 style={estilos.titulo}>🚕 Minhas Corridas</h2>
          <button onClick={buscarCorridas} style={estilos.botaoAtualizar}>
            🔄 Atualizar
          </button>
        </div>

        {/* Mensagens */}
        {mensagem && <p style={estilos.sucesso}>{mensagem}</p>}
        {erro && <p style={estilos.erro}>{erro}</p>}

        {carregando && <p style={estilos.mensagem}>Carregando corridas...</p>}

        {!carregando && (
          <>
            {/* ===== CORRIDAS QUE O MOTORISTA ACEITOU ===== */}
            {corridasConfirmadas.length > 0 && (
              <div style={estilos.secao}>
                <h3 style={estilos.secaoTitulo}>✅ Corridas em andamento</h3>
                <p style={estilos.secaoDesc}>
                  Corridas que aceitaste — podes cancelar se necessário.
                </p>

                {corridasConfirmadas.map((corrida) => (
                  <div key={corrida.id} style={{...estilos.card, borderColor: "#86efac"}}>

                    <p style={estilos.rota}>
                      {corrida.origem} → {corrida.destino}
                    </p>

                    <div style={estilos.detalhes}>
                      <span style={estilos.detalhe}>🚗 {corrida.tipo_veiculo}</span>
                      <span style={estilos.detalhe}>📍 {corrida.distancia} km</span>
                      <span style={estilos.detalhe}>💰 R${corrida.valor.toFixed(2)}</span>
                    </div>

                    <span style={{...estilos.badge, backgroundColor: "#dbeafe", color: "#1d4ed8"}}>
                      confirmada
                    </span>

                    <div style={estilos.acoes}>
                      <button
                        onClick={() => handleFinalizar(corrida.id)}
                        style={estilos.botaoFinalizar}
                      >
                        ✓ Finalizar
                      </button>
                      <button
                        onClick={() => handleCancelar(corrida.id)}
                        style={estilos.botaoCancelar}
                      >
                        ✕ Cancelar
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}

            {/* ===== CORRIDAS PENDENTES DISPONÍVEIS ===== */}
            <div style={estilos.secao}>
              <h3 style={estilos.secaoTitulo}>🔍 Corridas disponíveis</h3>
              <p style={estilos.secaoDesc}>
                Corridas à espera de um motorista.
              </p>

              {corridasPendentes.length === 0 ? (
                <div style={estilos.vazio}>
                  <p style={{fontSize: "40px", margin: "0"}}>🔍</p>
                  <p style={estilos.vazioTexto}>
                    Nenhuma corrida pendente no momento.
                  </p>
                </div>
              ) : (
                corridasPendentes.map((corrida) => (
                  <div key={corrida.id} style={estilos.card}>

                    <p style={estilos.rota}>
                      {corrida.origem} → {corrida.destino}
                    </p>

                    <div style={estilos.detalhes}>
                      <span style={estilos.detalhe}>🚗 {corrida.tipo_veiculo}</span>
                      <span style={estilos.detalhe}>📍 {corrida.distancia} km</span>
                      <span style={estilos.detalhe}>💰 R${corrida.valor.toFixed(2)}</span>
                    </div>

                    <span style={estilos.badge}>pendente</span>

                    <div style={estilos.acoes}>
                      <button
                        onClick={() => handleAceitar(corrida.id)}
                        style={estilos.botaoAceitar}
                      >
                        ✓ Aceitar
                      </button>
                      <button
                        onClick={() => handleRecusar(corrida.id)}
                        style={estilos.botaoRecusar}
                      >
                        ✕ Recusar
                      </button>
                    </div>

                  </div>
                ))
              )}
            </div>
          </>
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
  cabecalho: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  titulo: {
    color: "#1a1a2e",
    fontSize: "20px",
    margin: "0",
  },
  botaoAtualizar: {
    padding: "8px 12px",
    backgroundColor: "#f3f4f6",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },
  sucesso: {
    backgroundColor: "#dcfce7",
    color: "#16a34a",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontSize: "14px",
  },
  erro: {
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontSize: "14px",
  },
  mensagem: {
    textAlign: "center",
    color: "#666",
    padding: "20px",
  },
  secao: {
    marginBottom: "24px",
  },
  secaoTitulo: {
    color: "#1a1a2e",
    fontSize: "15px",
    marginBottom: "4px",
  },
  secaoDesc: {
    color: "#666",
    fontSize: "13px",
    marginBottom: "12px",
  },
  vazio: {
    textAlign: "center",
    padding: "24px",
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
  },
  vazioTexto: {
    color: "#666",
    fontSize: "14px",
    marginTop: "8px",
  },
  card: {
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "12px",
  },
  rota: {
    fontWeight: "700",
    color: "#1a1a2e",
    fontSize: "15px",
    margin: "0 0 8px 0",
  },
  detalhes: {
    display: "flex",
    gap: "16px",
    marginBottom: "8px",
  },
  detalhe: {
    fontSize: "13px",
    color: "#374151",
  },
  badge: {
    display: "inline-block",
    padding: "2px 10px",
    backgroundColor: "#fef9c3",
    color: "#854d0e",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    marginBottom: "12px",
  },
  acoes: {
    display: "flex",
    gap: "10px",
  },
  botaoAceitar: {
    flex: 1,
    padding: "10px",
    backgroundColor: "#16a34a",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
  },
  botaoRecusar: {
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
  botaoFinalizar: {
    flex: 1,
    padding: "10px",
    backgroundColor: "#2563eb",   // Azul
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
  },
  botaoCancelar: {
    flex: 1,
    padding: "10px",
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    border: "1px solid #fca5a5",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
  },
};


export default CorridasMotorista;
