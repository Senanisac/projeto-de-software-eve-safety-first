
// pages/SolicitarCorrida.jsx - Tela para solicitar uma corrida
// Fluxo: preencher dados → ver preço → confirmar → sucesso

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";


function SolicitarCorrida() {
  // ===================== ESTADOS =====================

  // Campos do formulário
  const [origem, setOrigem] = useState("");
  const [destino, setDestino] = useState("");
  const [tipoVeiculo, setTipoVeiculo] = useState("Carro"); // Valor padrão

  // Controlo da fase da tela
  // "formulario" → "confirmacao" → "sucesso"
  const [fase, setFase] = useState("formulario");

  // Dados da corrida criada — preenchidos após a resposta da API
  const [corrida, setCorrida] = useState(null);

  // Estados de controlo
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const navigate = useNavigate();


  // ===================== TARIFAS (para mostrar ao utilizador) =====================
  // Mesmo dicionário que existe no backend — só para exibição
  const tarifas = { Moto: 1.0, Carro: 2.0, VIP: 4.0 };


  // ===================== FUNÇÃO PARA SOLICITAR CORRIDA =====================
  const handleSolicitar = async (e) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      // Chama POST /corridas com os dados do formulário
      const resposta = await api.post("/corridas", {
        origem,
        destino,
        tipo_veiculo: tipoVeiculo, // A API espera "tipo_veiculo" com underscore
      });

      setCorrida(resposta.data); // Guarda os dados da corrida criada
      setFase("confirmacao");    // Avança para a fase de confirmação

    } catch (err) {
      setErro(err.response?.data?.detail || "Erro ao solicitar corrida");
    } finally {
      setCarregando(false);
    }
  };


  // ===================== FUNÇÃO PARA FINALIZAR CORRIDA =====================
  const handleFinalizar = async () => {
    setErro("");
    setCarregando(true);

    try {
      // Chama PATCH /corridas/{id}/finalizar para mudar status para "finalizada"
      await api.patch(`/corridas/${corrida.id}/finalizar`);
      setFase("sucesso"); // Avança para a fase de sucesso

    } catch (err) {
      setErro(err.response?.data?.detail || "Erro ao finalizar corrida");
    } finally {
      setCarregando(false);
    }
  };


  // ===================== INTERFACE — FASE FORMULÁRIO =====================
  if (fase === "formulario") {
    return (
      <div style={estilos.container}>
        <div style={estilos.caixa}>

          {/* Botão voltar */}
          <button onClick={() => navigate("/menu")} style={estilos.botaoVoltar}>
            ← Voltar
          </button>

          <h2 style={estilos.titulo}>🚕 Solicitar Corrida</h2>

          {erro && <p style={estilos.erro}>{erro}</p>}

          <form onSubmit={handleSolicitar}>

            <div style={estilos.campo}>
              <label style={estilos.label}>Origem</label>
              <input
                type="text"
                value={origem}
                onChange={(e) => setOrigem(e.target.value)}
                placeholder="Ex: UFAL — Maceió"
                style={estilos.input}
                required
              />
            </div>

            <div style={estilos.campo}>
              <label style={estilos.label}>Destino</label>
              <input
                type="text"
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
                placeholder="Ex: Av. Primeiro de Maio"
                style={estilos.input}
                required
              />
            </div>

            {/* Seleção do tipo de veículo com cards visuais */}
            <div style={estilos.campo}>
              <label style={estilos.label}>Tipo de veículo</label>
              <div style={estilos.veiculos}>

                {/* Itera sobre os 3 tipos de veículo */}
                {["Moto", "Carro", "VIP"].map((tipo) => (
                  <div
                    key={tipo}                                    // key é obrigatório em listas React
                    onClick={() => setTipoVeiculo(tipo)}          // Seleciona o veículo ao clicar
                    style={tipoVeiculo === tipo ? estilos.veiculoAtivo : estilos.veiculoInativo}
                  >
                    {/* Emoji diferente para cada tipo */}
                    <p style={estilos.veiculoEmoji}>
                      {tipo === "Moto" ? "🏍️" : tipo === "Carro" ? "🚗" : "⭐"}
                    </p>
                    <p style={estilos.veiculoNome}>{tipo}</p>
                    <p style={estilos.veiculoTarifa}>R${tarifas[tipo].toFixed(2)}/km</p>
                  </div>
                ))}

              </div>
            </div>

            <button
              type="submit"
              style={carregando ? estilos.botaoDesativado : estilos.botao}
              disabled={carregando}
            >
              {carregando ? "Calculando..." : "Ver preço"}
            </button>

          </form>
        </div>
      </div>
    );
  }


  // ===================== INTERFACE — FASE CONFIRMAÇÃO =====================
  if (fase === "confirmacao") {
    return (
      <div style={estilos.container}>
        <div style={estilos.caixa}>

          <h2 style={estilos.titulo}>📋 Confirmar Corrida</h2>

          {erro && <p style={estilos.erro}>{erro}</p>}

          {/* Resumo da corrida calculada pela API */}
          <div style={estilos.resumo}>
            <div style={estilos.resumoLinha}>
              <span style={estilos.resumoLabel}>Origem</span>
              <span style={estilos.resumoValor}>{corrida.origem}</span>
            </div>
            <div style={estilos.resumoLinha}>
              <span style={estilos.resumoLabel}>Destino</span>
              <span style={estilos.resumoValor}>{corrida.destino}</span>
            </div>
            <div style={estilos.resumoLinha}>
              <span style={estilos.resumoLabel}>Veículo</span>
              <span style={estilos.resumoValor}>{corrida.tipo_veiculo}</span>
            </div>
            <div style={estilos.resumoLinha}>
              <span style={estilos.resumoLabel}>Distância</span>
              <span style={estilos.resumoValor}>{corrida.distancia} km</span>
            </div>
            {/* Valor destacado */}
            <div style={{...estilos.resumoLinha, borderTop: "2px solid #e5e7eb", paddingTop: "12px", marginTop: "4px"}}>
              <span style={{...estilos.resumoLabel, fontWeight: "700", fontSize: "16px"}}>Total</span>
              <span style={{...estilos.resumoValor, fontWeight: "700", fontSize: "20px", color: "#2563eb"}}>
                R${corrida.valor.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Dois botões — finalizar ou cancelar */}
          <div style={{display: "flex", gap: "12px"}}>
            <button
              onClick={() => navigate("/menu")}  // Volta ao menu sem finalizar
              style={estilos.botaoCancelar}
            >
              Cancelar
            </button>
            <button
              onClick={handleFinalizar}
              style={carregando ? estilos.botaoDesativado : estilos.botao}
              disabled={carregando}
            >
              {carregando ? "Finalizando..." : "✓ Confirmar"}
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
          <h2 style={estilos.titulo}>Corrida Finalizada!</h2>
          <p style={{color: "#374151", marginBottom: "8px"}}>
            {corrida.origem} → {corrida.destino}
          </p>
          <p style={{fontSize: "28px", fontWeight: "700", color: "#2563eb", marginBottom: "24px"}}>
            R${corrida.valor.toFixed(2)}
          </p>
          <p style={{color: "#666", fontSize: "14px", marginBottom: "24px"}}>
            ID da corrida para pagamento:<br />
            <strong style={{fontSize: "12px", wordBreak: "break-all"}}>{corrida.id}</strong>
          </p>
        </div>

        {/* Botões de ação após sucesso */}
        <div style={{display: "flex", flexDirection: "column", gap: "12px"}}>
          <button
            onClick={() => navigate("/pagamento")}  // Vai direto para pagamento
            style={{...estilos.botao, backgroundColor: "#16a34a"}} // Verde
          >
            💳 Pagar agora
          </button>
          <button
            onClick={() => navigate("/menu")}
            style={estilos.botaoCancelar}
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
    alignItems: "center",
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
  erro: {
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontSize: "14px",
    textAlign: "center",
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
  veiculos: {
    display: "flex",
    gap: "10px",                  // Espaço entre os cards
  },
  veiculoAtivo: {
    flex: 1,
    padding: "12px 8px",
    backgroundColor: "#eff6ff",   // Fundo azul claro — selecionado
    border: "2px solid #2563eb",  // Borda azul — selecionado
    borderRadius: "8px",
    cursor: "pointer",
    textAlign: "center",
  },
  veiculoInativo: {
    flex: 1,
    padding: "12px 8px",
    backgroundColor: "white",
    border: "2px solid #e5e7eb",  // Borda cinza — não selecionado
    borderRadius: "8px",
    cursor: "pointer",
    textAlign: "center",
  },
  veiculoEmoji: {
    fontSize: "24px",
    margin: "0 0 4px 0",
  },
  veiculoNome: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
    margin: "0 0 2px 0",
  },
  veiculoTarifa: {
    fontSize: "11px",
    color: "#666",
    margin: "0",
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
  resumo: {
    backgroundColor: "#f8fafc",
    padding: "16px",
    borderRadius: "8px",
    marginBottom: "24px",
  },
  resumoLinha: {
    display: "flex",
    justifyContent: "space-between",  // Label à esquerda, valor à direita
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
};


export default SolicitarCorrida;

