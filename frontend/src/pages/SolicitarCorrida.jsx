
// pages/SolicitarCorrida.jsx - Tela para solicitar uma corrida
// Fluxo: escolher veículo → mapa → ver preço → confirmar → aguardar motorista

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
        <p style={{fontSize: "48px", margin: "0"}}>🔍</p>
        <h2 style={{color: "#1a1a2e", marginBottom: "8px"}}>
          Procurando motorista...
        </h2>
        <p style={{color: "#666", fontSize: "14px", marginBottom: "8px"}}>
          {corrida.origem} → {corrida.destino}
        </p>
        <p style={{
          color: "#2563eb",
          fontSize: "28px",
          fontWeight: "700",
          marginBottom: "8px"
        }}>
          R${corrida.valor.toFixed(2)}
        </p>

        {/* Animação de pontos */}
        <p style={{color: "#666", fontSize: "14px", marginBottom: "24px"}}>
          Aguardando um motorista aceitar
          {".".repeat((tentativas % 3) + 1)}
        </p>

        <button onClick={() => navigate("/historico")} style={estilos.botaoSecundario}>
          Ver histórico
        </button>
        
      </div>
    );
  }


  // ===== MOTORISTA ENCONTRADO =====
  if (status === "confirmada") {
    return (
      <div style={{textAlign: "center", padding: "20px"}}>
        <p style={{fontSize: "64px", margin: "0"}}>🎉</p>
        <h2 style={{color: "#16a34a", marginBottom: "8px"}}>
          Motorista encontrado!
        </h2>
        <p style={{color: "#374151", fontSize: "14px", marginBottom: "8px"}}>
          O teu motorista está a caminho.<br />
          Quando chegare ao destino, paga a corrida no histórico.
        </p>
        <p style={{
          color: "#2563eb",
          fontSize: "28px",
          fontWeight: "700",
          marginBottom: "24px"
        }}>
          R${corrida.valor.toFixed(2)}
        </p>

        <div style={{display: "flex", flexDirection: "column", gap: "12px"}}>
          <button onClick={() => navigate("/historico")} style={estilos.botao}>
            📋 Ver histórico
          </button>
          <button onClick={() => navigate("/menu")} style={estilos.botaoSecundario}>
            Voltar ao menu
          </button>
        </div>
      </div>
    );
  }


  // ===== CORRIDA CANCELADA =====
  return (
    <div style={{textAlign: "center", padding: "20px"}}>
      <p style={{fontSize: "48px", margin: "0"}}>❌</p>
      <h2 style={{color: "#dc2626", marginBottom: "8px"}}>
        Corrida cancelada
      </h2>
      <p style={{color: "#666", fontSize: "14px", marginBottom: "24px"}}>
        A corrida foi cancelada. Pode solicitar uma nova.
      </p>
      <button onClick={() => navigate("/corrida")} style={estilos.botao}>
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
      <div style={estilos.container}>
        <div style={estilos.caixa}>
          <button onClick={() => navigate("/menu")} style={estilos.botaoVoltar}>← Voltar</button>
          <h2 style={estilos.titulo}>🚕 Solicitar Corrida</h2>
          <p style={{color: "#666", fontSize: "14px", marginBottom: "20px"}}>
            Escolhe o tipo de veículo para continuar.
          </p>

          <div style={estilos.veiculos}>
            {["Moto", "Carro", "VIP"].map((tipo) => (
              <div
                key={tipo}
                onClick={() => setTipoVeiculo(tipo)}
                style={tipoVeiculo === tipo ? estilos.veiculoAtivo : estilos.veiculoInativo}
              >
                <p style={estilos.veiculoEmoji}>
                  {tipo === "Moto" ? "🏍️" : tipo === "Carro" ? "🚗" : "⭐"}
                </p>
                <p style={estilos.veiculoNome}>{tipo}</p>
                <p style={estilos.veiculoTarifa}>R${tarifas[tipo].toFixed(2)}/km</p>
              </div>
            ))}
          </div>

          <button onClick={() => setFase("mapa")} style={estilos.botao}>
            Escolher no mapa →
          </button>
        </div>
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
            background: "white",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            padding: "8px 12px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "13px",
            color: "#2563eb",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
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
      <div style={estilos.container}>
        <div style={estilos.caixa}>
          <h2 style={estilos.titulo}>📋 Confirmar Corrida</h2>

          {erro && <p style={estilos.erro}>{erro}</p>}

          <div style={estilos.resumo}>
            <div style={estilos.resumoLinha}>
              <span style={estilos.resumoLabel}>Origem</span>
              <span style={estilos.resumoValor}>{dadosMapa?.origem}</span>
            </div>
            <div style={estilos.resumoLinha}>
              <span style={estilos.resumoLabel}>Destino</span>
              <span style={estilos.resumoValor}>{dadosMapa?.destino}</span>
            </div>
            <div style={estilos.resumoLinha}>
              <span style={estilos.resumoLabel}>Veículo</span>
              <span style={estilos.resumoValor}>{tipoVeiculo}</span>
            </div>
            <div style={estilos.resumoLinha}>
              <span style={estilos.resumoLabel}>Distância</span>
              <span style={estilos.resumoValor}>{dadosMapa?.distancia} km</span>
            </div>
            <div style={{...estilos.resumoLinha, borderTop: "2px solid #e5e7eb", paddingTop: "12px", marginTop: "4px"}}>
              <span style={{...estilos.resumoLabel, fontWeight: "700", fontSize: "16px"}}>Total estimado</span>
              <span style={{...estilos.resumoValor, fontWeight: "700", fontSize: "20px", color: "#2563eb"}}>
                R${valorEstimado}
              </span>
            </div>
          </div>

          <div style={{display: "flex", gap: "12px"}}>
            <button
              onClick={() => setFase("mapa")}
              style={estilos.botaoSecundario}
            >
              ← Editar
            </button>
            <button
              onClick={handleSolicitar}
              style={carregando ? estilos.botaoDesativado : estilos.botao}
              disabled={carregando}
            >
              {carregando ? "Solicitando..." : "✓ Confirmar"}
            </button>
          </div>

          </div>
      </div>
    );
  }


  // ===================== FASE SUCESSO =====================
  return (
    <div style={estilos.container}>
      <div style={estilos.caixa}>
        {corrida && <AguardandoMotorista corrida={corrida} />}
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
  veiculos: {
    display: "flex",
    gap: "10px",
    marginBottom: "24px",
  },
  veiculoAtivo: {
    flex: 1,
    padding: "12px 8px",
    backgroundColor: "#eff6ff",
    border: "2px solid #2563eb",
    borderRadius: "8px",
    cursor: "pointer",
    textAlign: "center",
  },
  veiculoInativo: {
    flex: 1,
    padding: "12px 8px",
    backgroundColor: "white",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    cursor: "pointer",
    textAlign: "center",
  },
  veiculoEmoji: { fontSize: "24px", margin: "0 0 4px 0" },
  veiculoNome: { fontSize: "13px", fontWeight: "600", color: "#374151", margin: "0 0 2px 0" },
  veiculoTarifa: { fontSize: "11px", color: "#666", margin: "0" },
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
  botaoSecundario: {
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
    justifyContent: "space-between",
    padding: "6px 0",
  },
  resumoLabel: { color: "#666", fontSize: "14px" },
  resumoValor: { color: "#1a1a2e", fontSize: "14px", fontWeight: "600" },
};

export default SolicitarCorrida; 
