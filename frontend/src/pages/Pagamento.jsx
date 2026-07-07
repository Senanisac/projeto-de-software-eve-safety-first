
// pages/Pagamento.jsx - Tela de pagamento de corridas
// Lista corridas finalizadas e permite escolher o método de pagamento

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
      <div style={estilos.container}>
        <div style={estilos.caixa}>

          <button onClick={() => navigate("/menu")} style={estilos.botaoVoltar}>
            ← Voltar
          </button>
          <h2 style={estilos.titulo}>💳 Pagamentos</h2>

          {carregando && <p style={estilos.mensagem}>Carregando...</p>}
          {erro && <p style={estilos.erro}>{erro}</p>}

          {/* Lista vazia — sem corridas para pagar */}
          {!carregando && corridasParaPagar.length === 0 && (
            <div style={estilos.vazio}>
              <p style={{fontSize: "48px", margin: "0"}}>✅</p>
              <p style={estilos.vazioTexto}>
                Nenhuma corrida pendente de pagamento.
              </p>
              <button
                onClick={() => navigate("/corrida")}
                style={estilos.botao}
              >
                Solicitar corrida
              </button>
            </div>
          )}

          {/* Lista de corridas disponíveis para pagar */}
          {!carregando && corridasParaPagar.length > 0 && (
            <div style={estilos.lista}>
              <p style={estilos.instrucao}>
                Selecione uma corrida para pagar:
              </p>

              {corridasParaPagar.map((corrida) => (
                <div
                  key={corrida.id}
                  onClick={() => {
                    setCorridaSelecionada(corrida); // Guarda a corrida selecionada
                    setFase("confirmacao");          // Avança para confirmação
                  }}
                  style={estilos.card}
                >
                  <div style={estilos.cardTopo}>
                    <p style={estilos.rota}>
                      {corrida.origem} → {corrida.destino}
                    </p>
                    <span style={estilos.valor}>
                      R${corrida.valor.toFixed(2)}
                    </span>
                  </div>
                  <div style={estilos.cardDetalhes}>
                    <span style={estilos.detalhe}>🚗 {corrida.tipo_veiculo}</span>
                    <span style={estilos.detalhe}>📍 {corrida.distancia} km</span>
                  </div>
                  <p style={estilos.cliqueAqui}>Clique para pagar →</p>
                </div>
              ))}

            </div>
          )}

        </div>
      </div>
    );
  }


  // ===================== INTERFACE — FASE CONFIRMAÇÃO =====================
  if (fase === "confirmacao") {
    return (
      <div style={estilos.container}>
        <div style={estilos.caixa}>

          <h2 style={estilos.titulo}>💳 Confirmar Pagamento</h2>

          {erro && <p style={estilos.erro}>{erro}</p>}

          {/* Resumo da corrida selecionada */}
          <div style={estilos.resumo}>
            <div style={estilos.resumoLinha}>
              <span style={estilos.resumoLabel}>Origem</span>
              <span style={estilos.resumoValor}>{corridaSelecionada.origem}</span>
            </div>
            <div style={estilos.resumoLinha}>
              <span style={estilos.resumoLabel}>Destino</span>
              <span style={estilos.resumoValor}>{corridaSelecionada.destino}</span>
            </div>
            <div style={estilos.resumoLinha}>
              <span style={estilos.resumoLabel}>Veículo</span>
              <span style={estilos.resumoValor}>{corridaSelecionada.tipo_veiculo}</span>
            </div>
            <div style={{...estilos.resumoLinha, borderTop: "2px solid #e5e7eb", paddingTop: "12px", marginTop: "4px"}}>
              <span style={{...estilos.resumoLabel, fontWeight: "700"}}>Total</span>
              <span style={{...estilos.resumoValor, fontSize: "20px", color: "#2563eb"}}>
                R${corridaSelecionada.valor.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Seleção do método de pagamento */}
          <div style={estilos.campo}>
            <label style={estilos.label}>Forma de pagamento</label>
            <div style={estilos.metodos}>

              {/* Itera sobre os 3 métodos */}
              {[
                {id: "pix",     emoji: "⚡", nome: "PIX"},
                {id: "cartao",  emoji: "💳", nome: "Cartão"},
                {id: "dinheiro",emoji: "💵", nome: "Dinheiro"},
              ].map((m) => (
                <div
                  key={m.id}
                  onClick={() => setMetodo(m.id)}   // Seleciona o método ao clicar
                  style={metodo === m.id ? estilos.metodoAtivo : estilos.metodoInativo}
                >
                  <p style={{fontSize: "24px", margin: "0 0 4px 0"}}>{m.emoji}</p>
                  <p style={{fontSize: "13px", fontWeight: "600", margin: "0"}}>{m.nome}</p>
                </div>
              ))}

            </div>
          </div>

          {/* Botões */}
          <div style={{display: "flex", gap: "12px"}}>
            <button
              onClick={() => setFase("lista")}  // Volta à lista sem pagar
              style={estilos.botaoCancelar}
            >
              Voltar
            </button>
            <button
              onClick={handlePagar}
              style={carregando ? estilos.botaoDesativado : estilos.botao}
              disabled={carregando}
            >
              {carregando ? "Processando..." : "✓ Pagar"}
            </button>
          </div>

        </div>
      </div>
    );
  }


  // ===================== INTERFACE — FASE SUCESSO =====================
  return (
    <div style={estilos.container}>
      <div style={estilos.caixa}>

        <div style={{textAlign: "center"}}>
          <p style={{fontSize: "64px", margin: "0"}}>✅</p>
          <h2 style={estilos.titulo}>Pagamento Aprovado!</h2>

          {/* Detalhes do pagamento */}
          <div style={estilos.resumo}>
            <div style={estilos.resumoLinha}>
              <span style={estilos.resumoLabel}>Método</span>
              <span style={estilos.resumoValor}>{pagamentoFeito.metodo.toUpperCase()}</span>
            </div>
            <div style={estilos.resumoLinha}>
              <span style={estilos.resumoLabel}>Status</span>
              <span style={{...estilos.resumoValor, color: "#16a34a"}}>
                {pagamentoFeito.status}
              </span>
            </div>
            <div style={estilos.resumoLinha}>
              <span style={estilos.resumoLabel}>Valor pago</span>
              <span style={{...estilos.resumoValor, fontSize: "20px", color: "#2563eb"}}>
                R${pagamentoFeito.valor.toFixed(2)}
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate("/menu")}
            style={estilos.botao}
          >
            Voltar ao menu
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
    maxWidth: "480px",
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
    marginBottom: "16px",
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
  instrucao: {
    color: "#374151",
    fontSize: "14px",
    marginBottom: "12px",
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
    cursor: "pointer",            // Indica que é clicável
    transition: "border-color 0.2s", // Animação suave ao passar o rato
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
  valor: {
    fontWeight: "700",
    color: "#2563eb",
    fontSize: "16px",
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
  cliqueAqui: {
    fontSize: "12px",
    color: "#2563eb",
    margin: "6px 0 0 0",
    fontWeight: "600",
  },
  campo: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    marginBottom: "10px",
    color: "#374151",
    fontSize: "14px",
    fontWeight: "600",
  },
  metodos: {
    display: "flex",
    gap: "10px",
  },
  metodoAtivo: {
    flex: 1,
    padding: "12px 8px",
    backgroundColor: "#eff6ff",
    border: "2px solid #2563eb",
    borderRadius: "8px",
    cursor: "pointer",
    textAlign: "center",
  },
  metodoInativo: {
    flex: 1,
    padding: "12px 8px",
    backgroundColor: "white",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    cursor: "pointer",
    textAlign: "center",
  },
  resumo: {
    backgroundColor: "#f8fafc",
    padding: "16px",
    borderRadius: "8px",
    marginBottom: "24px",
  },
  resumoLinha: {
    display: "flex",
    justifyContent: "space-between",
    padding: "6px 0",
  },
  resumoLabel: {
    color: "#666",
    fontSize: "14px",
  },
  resumoValor: {
    color: "#1a1a2e",
    fontSize: "14px",
    fontWeight: "600",
  },
  botao: {
    flex: 1,
    width: "100%",
    padding: "12px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "8px",
  },
  botaoDesativado: {
    flex: 1,
    width: "100%",
    padding: "12px",
    backgroundColor: "#93c5fd",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "not-allowed",
    marginTop: "8px",
  },
  botaoCancelar: {
    flex: 1,
    padding: "12px",
    backgroundColor: "white",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "8px",
  },
};


export default Pagamento;

