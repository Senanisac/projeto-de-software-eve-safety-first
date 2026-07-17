
// pages/motorista/HistoricoMotorista.jsx - Histórico de corridas do motorista
// Mostra todas as corridas que o motorista aceitou — confirmadas, finalizadas e canceladas

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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


  // ===================== COR DO STATUS =====================
  // Retorna estilo diferente baseado no status da corrida
  const corStatus = (status) => {
    const cores = {
      confirmada: { backgroundColor: "#dbeafe", color: "#1d4ed8" },  // Azul
      finalizada: { backgroundColor: "#dcfce7", color: "#16a34a" },  // Verde
      cancelada:  { backgroundColor: "#fee2e2", color: "#dc2626" },  // Vermelho
      pendente:   { backgroundColor: "#fef9c3", color: "#854d0e" },  // Amarelo
    };
    return cores[status] || { backgroundColor: "#f3f4f6", color: "#374151" };
  };


  // ===================== INTERFACE =====================
  return (
    <div style={estilos.container}>
      <div style={estilos.caixa}>

        {/* Cabeçalho */}
        <button onClick={() => navigate("/menu")} style={estilos.botaoVoltar}>
          ← Voltar
        </button>
        <h2 style={estilos.titulo}>📋 Meu Histórico</h2>

        {/* Carregando */}
        {carregando && <p style={estilos.mensagem}>Carregando histórico...</p>}

        {/* Erro */}
        {erro && <p style={estilos.erro}>{erro}</p>}

        {/* Lista vazia */}
        {!carregando && !erro && corridas.length === 0 && (
          <div style={estilos.vazio}>
            <p style={{fontSize: "48px", margin: "0"}}>🚗</p>
            <p style={estilos.vazioTexto}>Nenhuma corrida no histórico.</p>
            <p style={{color: "#666", fontSize: "13px"}}>
              As corridas que aceitar aparecerão aqui.
            </p>
            <button
              onClick={() => navigate("/motorista/corridas")}
              style={estilos.botao}
            >
              Ver corridas disponíveis
            </button>
          </div>
        )}

        {/* Resumo — total de corridas por status */}
        {!carregando && corridas.length > 0 && (
          <>
            {/* Cards de resumo */}
            <div style={estilos.resumo}>

              <div style={estilos.resumoCard}>
                <p style={estilos.resumoNumero}>
                  {corridas.filter(c => c.status === "confirmada").length}
                </p>
                <p style={estilos.resumoLabel}>Em curso</p>
              </div>

              <div style={estilos.resumoCard}>
                <p style={estilos.resumoNumero}>
                  {corridas.filter(c => c.status === "finalizada").length}
                </p>
                <p style={estilos.resumoLabel}>Finalizadas</p>
              </div>

              <div style={{...estilos.resumoCard, borderColor: "#fca5a5"}}>
                <p style={{...estilos.resumoNumero, color: "#dc2626"}}>
                  {corridas.filter(c => c.status === "cancelada").length}
                </p>
                <p style={estilos.resumoLabel}>Canceladas</p>
              </div>

            </div>

            {/* Lista de corridas */}
            <div style={estilos.lista}>
              {corridas.map((corrida) => (
                <div key={corrida.id} style={estilos.card}>

                  {/* Linha superior — rota e status */}
                  <div style={estilos.cardTopo}>
                    <p style={estilos.rota}>
                      {corrida.origem} → {corrida.destino}
                    </p>
                    {/* Badge colorido com o status */}
                    <span style={{...estilos.badge, ...corStatus(corrida.status)}}>
                      {corrida.status}
                    </span>
                  </div>

                  {/* Detalhes */}
                  <div style={estilos.detalhes}>
                    <span style={estilos.detalhe}>🚗 {corrida.tipo_veiculo}</span>
                    <span style={estilos.detalhe}>📍 {corrida.distancia} km</span>
                    <span style={estilos.detalhe}>💰 R${corrida.valor.toFixed(2)}</span>
                  </div>

                  {/* Data */}
                  <p style={estilos.data}>
                    {new Date(corrida.criado_em).toLocaleString("pt-BR")}
                  </p>

                </div>
              ))}
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
  titulo: {
    color: "#1a1a2e",
    marginBottom: "20px",
    fontSize: "20px",
  },
  mensagem: {
    textAlign: "center",
    color: "#666",
    padding: "20px",
  },
  erro: {
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    padding: "10px",
    borderRadius: "8px",
    fontSize: "14px",
    textAlign: "center",
  },
  vazio: {
    textAlign: "center",
    padding: "40px 20px",
  },
  vazioTexto: {
    color: "#374151",
    fontWeight: "600",
    marginBottom: "8px",
  },
  botao: {
    padding: "10px 20px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    marginTop: "16px",
  },
  resumo: {
    display: "flex",
    gap: "12px",
    marginBottom: "20px",
  },
  resumoCard: {
    flex: 1,
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "12px",
    textAlign: "center",
  },
  resumoNumero: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1a1a2e",
    margin: "0 0 4px 0",
  },
  resumoLabel: {
    fontSize: "12px",
    color: "#666",
    margin: "0",
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
  rota: {
    fontWeight: "600",
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
  detalhes: {
    display: "flex",
    gap: "16px",
    marginBottom: "6px",
  },
  detalhe: {
    fontSize: "13px",
    color: "#374151",
  },
  data: {
    fontSize: "12px",
    color: "#9ca3af",
    margin: "0",
  },
};


export default HistoricoMotorista;

