
// pages/Historico.jsx - Tela de histórico de corridas
// Lista todas as corridas do passageiro logado com seus status

import { useState, useEffect } from "react";   // useState para guardar dados, useEffect para buscar ao carregar
import { useNavigate } from "react-router-dom"; // Para voltar ao menu
import api from "../api/axios";                 // Nossa instância configurada do axios


function Historico() {
  // ===================== ESTADOS =====================

  const [pagamentos, setPagamentos] = useState([]);
  const [corridas, setCorridas] = useState([]);    // Lista de corridas — começa vazia
  const [carregando, setCarregando] = useState(true); // Começa como true — está a carregar
  const [erro, setErro] = useState("");

  const navigate = useNavigate();


  // ===================== BUSCAR CORRIDAS AO CARREGAR =====================
  useEffect(() => {
    const buscarDados = async () => {
      try {
        // Busca corridas e pagamentos em paralelo
        const [respostaCorridas, respostaPagamentos] = await Promise.all([
          api.get("/corridas"),
          api.get("/pagamentos"),
        ]);
        setCorridas(respostaCorridas.data);   // Guarda a lista no estado
        setPagamentos(respostaPagamentos.data);
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

  // ===================== FUNÇÃO PARA COR DO STATUS =====================
  // Retorna um estilo diferente baseado no status da corrida
  const corStatus = (status) => {
    const cores = {
      confirmada: { backgroundColor: "#dbeafe", color: "#1d4ed8" },  // Azul
      finalizada: { backgroundColor: "#dcfce7", color: "#16a34a" },  // Verde
      cancelada:  { backgroundColor: "#fee2e2", color: "#dc2626" },  // Vermelho
      pendente:   { backgroundColor: "#fef9c3", color: "#854d0e" },  // Amarelo
    };
    // Retorna a cor correspondente ou cinza se o status não estiver mapeado
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
        <h2 style={estilos.titulo}>📋 Histórico de Corridas</h2>

        {/* Estado de carregamento */}
        {carregando && (
          <p style={estilos.mensagem}>Carregando...</p>
        )}

        {/* Mensagem de erro */}
        {erro && (
          <p style={estilos.erro}>{erro}</p>
        )}

        {/* Lista vazia — quando não há corridas */}
        {!carregando && !erro && corridas.length === 0 && (
          <div style={estilos.vazio}>
            <p style={{fontSize: "48px", margin: "0"}}>🚕</p>
            <p style={estilos.vazioTexto}>Nenhuma corrida encontrada.</p>
            <button
              onClick={() => navigate("/corrida")}
              style={estilos.botao}
            >
              Solicitar primeira corrida
            </button>
          </div>
        )}

        {/* Lista de corridas — quando há dados */}
        {!carregando && corridas.length > 0 && (
          <div style={estilos.lista}>

            {/* Itera sobre cada corrida e cria um card */}
            {corridas.map((corrida) => (
              <div key={corrida.id} style={estilos.card}>

                {/* Linha superior — origem/destino e status */}
                <div style={estilos.cardTopo}>
                  <p style={estilos.rota}>
                    {corrida.origem} → {corrida.destino}
                  </p>
                  {/* Badge colorido com o status */}
                  <span style={{...estilos.badge, ...corStatus(corrida.status)}}>
                    {corrida.status}
                  </span>
                </div>

                {/* Linha inferior — detalhes da corrida */}
                <div style={estilos.cardDetalhes}>
                  <span style={estilos.detalhe}>🚗 {corrida.tipo_veiculo}</span>
                  <span style={estilos.detalhe}>📍 {corrida.distancia} km</span>
                  <span style={estilos.detalhe}>💰 R${corrida.valor.toFixed(2)}</span>
                </div>

                {/* Data de criação formatada */}
                <p style={estilos.data}>
                  {/* Converte a string ISO para data legível */}
                  {new Date(corrida.criado_em).toLocaleString("pt-BR")}
                </p>

                {/* Botão cancelar — só para corridas pendentes */}
                  {corrida.status === "pendente" && (
                    <button
                      onClick={() => handleCancelar(corrida.id)}
                      style={estilos.botaoCancelar}
                    >
                      ✕ Cancelar corrida
                    </button>
                  )}

                  {/* Botão pagar — só para corridas finalizadas E não pagas */}
                  {corrida.status === "finalizada" &&
                    !pagamentos.some((p) => p.corrida_id === corrida.id) && (
                    <button
                      onClick={() => navigate("/pagamento")}
                      style={estilos.botaoPagar}
                    >
                      💳 Pagar corrida
                    </button>
                  )}

                  {/* Mensagem de pago — corrida finalizada e já paga */}
                  {corrida.status === "finalizada" &&
                    pagamentos.some((p) => p.corrida_id === corrida.id) && (
                    <p style={{
                      marginTop: "8px",
                      fontSize: "13px",
                      color: "#16a34a",
                      fontWeight: "600"
                    }}>
                      ✅ Pago
                    </p>
                  )}

              </div>
            ))}

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
    alignItems: "flex-start",     // Alinha no topo — lista pode ser longa
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
    marginBottom: "24px",
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
    color: "#666",
    marginBottom: "20px",
  },
  botao: {
    padding: "12px 24px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  lista: {
    display: "flex",
    flexDirection: "column",      // Cards em coluna
    gap: "12px",                  // Espaço entre cards
  },
  card: {
    border: "1px solid #e5e7eb",  // Borda cinza
    borderRadius: "8px",
    padding: "16px",
  },
  cardTopo: {
    display: "flex",
    justifyContent: "space-between",  // Rota à esquerda, status à direita
    alignItems: "flex-start",
    marginBottom: "8px",
  },
  rota: {
    fontWeight: "600",
    color: "#1a1a2e",
    fontSize: "14px",
    margin: "0",
    flex: 1,                      // Ocupa o espaço disponível
    marginRight: "12px",
  },
  badge: {
    padding: "2px 10px",
    borderRadius: "20px",         // Formato pílula
    fontSize: "12px",
    fontWeight: "600",
    whiteSpace: "nowrap",         // Não quebra linha
  },
  cardDetalhes: {
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
    color: "#9ca3af",             // Cinza claro — menos importante
    margin: "0",
  },
  botaoCancelar: {
    marginTop: "8px",
    padding: "8px 12px",
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    border: "1px solid #fca5a5",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    width: "100%",
  },
  botaoPagar: {
    marginTop: "8px",
    padding: "8px 12px",
    backgroundColor: "#dcfce7",
    color: "#16a34a",
    border: "1px solid #86efac",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    width: "100%",
  },
};


export default Historico;

