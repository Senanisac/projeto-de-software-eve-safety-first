
// pages/Mapa.jsx - Componente de mapa interativo
// Usa Leaflet + OpenStreetMap + Nominatim para geocodificação gratuita
// Design moderno com painel glass escuro, animações e melhorias UX

import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";

// Corrige o problema dos ícones do Leaflet com Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Ícone verde para origem
const iconeOrigem = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Ícone vermelho para destino
const iconeDestino = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});


// ===================== COMPONENTE PARA CENTRAR O MAPA =====================
// Necessário porque o MapContainer não atualiza o centro após a criação
function CentrarMapa({ coordenadas, origem, destino }) {
  const mapa = useMap();
  
  useEffect(() => {
    if (coordenadas) {
      mapa.flyTo(coordenadas, 14, { duration: 1.5 });  // Animação suave ao centrar
    }
    
    // Se ambos os pontos estão definidos, centraliza no meio do caminho
    if (origem && destino) {
      const latMedio = (origem.lat + destino.lat) / 2;
      const lngMedio = (origem.lng + destino.lng) / 2;
      
      // Calcular a distância aproximada para ajustar o zoom
      const dLat = (destino.lat - origem.lat) * 111; // Aproximadamente km por grau
      const dLng = (destino.lng - origem.lng) * 111 * Math.cos(origem.lat * Math.PI / 180);
      const distancia = Math.sqrt(dLat * dLat + dLng * dLng);
      
      // Ajusta o zoom baseado na distância
      let zoom = 13;
      if (distancia > 20) zoom = 10;
      else if (distancia > 10) zoom = 11;
      else if (distancia > 5) zoom = 12;
      else if (distancia > 2) zoom = 13;
      else zoom = 14;
      
      mapa.flyTo([latMedio, lngMedio], zoom, { duration: 1.5 });
    }
  }, [coordenadas, origem, destino, mapa]);
  
  return null;
}


// ===================== COMPONENTE PRINCIPAL DO MAPA =====================
function Mapa({ onConfirmar, onVoltar }) {
  // Estados dos endereços
  const [textoOrigem, setTextoOrigem] = useState("");
  const [textoDestino, setTextoDestino] = useState("");

  // Estados das coordenadas
  const [origem, setOrigem] = useState(null);    // { lat, lng, nome }
  const [destino, setDestino] = useState(null);  // { lat, lng, nome }

  // Estados de controlo
  const [carregandoOrigem, setCarregandoOrigem] = useState(false);
  const [carregandoDestino, setCarregandoDestino] = useState(false);
  const [erro, setErro] = useState("");
  const [centrarEm, setCentrarEm] = useState(null);

  // Centro inicial — Maceió, Alagoas
  const centroInicial = [-9.6658, -35.7350];


  // ===================== GEOCODIFICAÇÃO COM NOMINATIM =====================
  const geocodificar = async (endereco, tipo) => {
    if (!endereco || endereco.length < 3) return;

    if (tipo === "origem") setCarregandoOrigem(true);
    else setCarregandoDestino(true);
    setErro("");

    try {
      // Nominatim — API gratuita do OpenStreetMap
      // Adiciona "Maceió, Brasil" para melhorar resultados locais
      const query = encodeURIComponent(`${endereco}, Maceió, Brasil`);
      const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

      const resposta = await fetch(url, {
        headers: {
          // Nominatim exige um User-Agent identificando a aplicação
          "User-Agent": "EveSafetyFirst/1.0"
        }
      });

      const dados = await resposta.json();

      if (dados.length === 0) {
        setErro(`Endereço "${endereco}" não encontrado. Tente ser mais específico.`);
        return;
      }

      const { lat, lon, display_name } = dados[0];
      const coordenadas = { lat: parseFloat(lat), lng: parseFloat(lon), nome: display_name };

      if (tipo === "origem") {
        setOrigem(coordenadas);
        setCentrarEm([coordenadas.lat, coordenadas.lng]);
      } else {
        setDestino(coordenadas);
        setCentrarEm([coordenadas.lat, coordenadas.lng]);
      }

    } catch (err) {
      setErro("Erro ao buscar endereço. Verifica a tua ligação à internet.");
    } finally {
      if (tipo === "origem") setCarregandoOrigem(false);
      else setCarregandoDestino(false);
    }
  };


  // ===================== CALCULAR DISTÂNCIA HAVERSINE =====================
  const calcularDistancia = (orig, dest) => {
    const R = 6371;
    const dLat = (dest.lat - orig.lat) * Math.PI / 180;
    const dLng = (dest.lng - orig.lng) * Math.PI / 180;
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(orig.lat * Math.PI / 180) * Math.cos(dest.lat * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c * 100) / 100;  // 2 casas decimais
  };


  // ===================== CONFIRMAR CORRIDA =====================
  const handleConfirmar = () => {
    if (!origem || !destino) {
      setErro("Define a origem e o destino antes de confirmar.");
      return;
    }

    const distancia = calcularDistancia(origem, destino);

    // Passa os dados para o componente pai (SolicitarCorrida)
    onConfirmar({
      origem: textoOrigem,
      origem_lat: origem.lat,
      origem_lng: origem.lng,
      destino: textoDestino,
      destino_lat: destino.lat,
      destino_lng: destino.lng,
      distancia,
    });
  };


  // ===================== SPINNER ANIMADO =====================
  const Spinner = () => (
    <span style={{
      width: "16px",
      height: "16px",
      border: "2px solid rgba(108,99,255,0.3)",
      borderTop: "2px solid #6c63ff",
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
      display: "inline-block",
    }} />
  );


  // ===================== INTERFACE =====================
  return (
    <div style={estilos.container}>

      {/* ===== PAINEL DE PESQUISA ===== */}
      <div style={estilos.painel}>
        
        {/* Botão Voltar no painel */}
        {onVoltar && (
          <button
            onClick={onVoltar}
            style={estilos.botaoVoltar}
            onMouseEnter={(e) => {
              e.target.style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              e.target.style.color = "#a0aec0";
            }}
          >
            ← Voltar
          </button>
        )}

        <h3 style={estilos.painelTitulo}>📍 Definir percurso</h3>

        {erro && <p style={estilos.erro}>{erro}</p>}

        {/* Campo origem */}
        <div style={estilos.campo}>
          <label style={estilos.label}>🟢 Origem</label>
          <div style={estilos.inputBotao}>
            <input
              type="text"
              value={textoOrigem}
              onChange={(e) => setTextoOrigem(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && geocodificar(textoOrigem, "origem")}
              placeholder="Ex: UFAL, Maceió"
              style={estilos.input}
              onFocus={(e) => e.target.style.borderColor = "#6c63ff"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
            />
            <button
              onClick={() => geocodificar(textoOrigem, "origem")}
              style={estilos.botaoBuscar}
              disabled={carregandoOrigem}
            >
              {carregandoOrigem ? <Spinner /> : "🔍"}
            </button>
          </div>
          {origem && (
            <p style={estilos.enderecoEncontrado}>
              ✅ {origem.nome.split(",").slice(0, 2).join(",")}
            </p>
          )}
        </div>

        {/* Campo destino */}
        <div style={estilos.campo}>
          <label style={estilos.label}>🔴 Destino</label>
          <div style={estilos.inputBotao}>
            <input
              type="text"
              value={textoDestino}
              onChange={(e) => setTextoDestino(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && geocodificar(textoDestino, "destino")}
              placeholder="Ex: Av. Primeiro de Maio"
              style={estilos.input}
              onFocus={(e) => e.target.style.borderColor = "#6c63ff"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
            />
            <button
              onClick={() => geocodificar(textoDestino, "destino")}
              style={estilos.botaoBuscar}
              disabled={carregandoDestino}
            >
              {carregandoDestino ? <Spinner /> : "🔍"}
            </button>
          </div>
          {destino && (
            <p style={estilos.enderecoEncontrado}>
              ✅ {destino.nome.split(",").slice(0, 2).join(",")}
            </p>
          )}
        </div>

        {/* Distância calculada */}
        {origem && destino && (
          <div style={estilos.distancia}>
            <p style={estilos.distanciaTexto}>
              📏 Distância: <strong>{calcularDistancia(origem, destino)} km</strong>
            </p>
          </div>
        )}

        {/* Botão confirmar */}
        <button
          onClick={handleConfirmar}
          disabled={!origem || !destino}
          style={origem && destino ? estilos.botaoConfirmar : estilos.botaoConfirmarDesativado}
          onMouseEnter={(e) => {
            if (origem && destino) {
              e.target.style.transform = "scale(1.02)";
              e.target.style.boxShadow = "0 0 20px rgba(108,99,255,0.3)";
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "scale(1)";
            e.target.style.boxShadow = "none";
          }}
        >
          ✓ Confirmar percurso
        </button>

        {/* Légende */}
        <div style={estilos.legenda}>
          <span style={{ color: "#22c55e" }}>●</span> Origem &nbsp;
          <span style={{ color: "#ef4444" }}>●</span> Destino
        </div>
      </div>

      {/* ===== MAPA ===== */}
      <div style={estilos.mapa}>
        <MapContainer
          center={centroInicial}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          {/* Tiles do OpenStreetMap — gratuito */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Centrar mapa automaticamente */}
          {centrarEm && <CentrarMapa coordenadas={centrarEm} origem={origem} destino={destino} />}

          {/* Pin da origem */}
          {origem && (
            <Marker position={[origem.lat, origem.lng]} icon={iconeOrigem}>
              <Popup>🟢 Origem: {textoOrigem}</Popup>
            </Marker>
          )}

          {/* Pin do destino */}
          {destino && (
            <Marker position={[destino.lat, destino.lng]} icon={iconeDestino}>
              <Popup>🔴 Destino: {textoDestino}</Popup>
            </Marker>
          )}

          {/* Linha entre origem e destino */}
          {origem && destino && (
            <Polyline
              positions={[
                [origem.lat, origem.lng],
                [destino.lat, destino.lng]
              ]}
              color="#6c63ff"        // Linha violeta (coerente com tema)
              weight={3}             // Espessura
              dashArray="8, 8"       // Linha tracejada
            />
          )}

        </MapContainer>
      </div>

      {/* CSS para o spinner */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .leaflet-marker-icon {
          filter: drop-shadow(0 2px 8px rgba(0,0,0,0.3));
        }
      `}</style>
    </div>
  );
}


// ===================== ESTILOS =====================
const estilos = {
  container: {
    display: "flex",
    gap: "0",
    height: "100vh",
    backgroundColor: "#0f0f1a",  // Fundo escuro
  },
  painel: {
    width: "340px",
    minWidth: "340px",
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderRight: "1px solid rgba(255,255,255,0.1)",
    padding: "24px",
    overflowY: "auto",
    zIndex: 1000,
  },
  botaoVoltar: {
    background: "none",
    border: "none",
    color: "#a0aec0",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    padding: "0",
    marginBottom: "16px",
    transition: "all 0.3s ease",
  },
  painelTitulo: {
    color: "#ffffff",
    fontSize: "16px",
    marginBottom: "20px",
    fontFamily: "Poppins, sans-serif",
  },
  erro: {
    background: "rgba(255,101,132,0.15)",
    border: "1px solid rgba(255,101,132,0.3)",
    color: "#ff6584",
    padding: "8px 12px",
    borderRadius: "8px",
    marginBottom: "12px",
    fontSize: "13px",
    textAlign: "center",
  },
  campo: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    color: "#a0aec0",
    fontSize: "13px",
    fontWeight: "600",
  },
  inputBotao: {
    display: "flex",
    gap: "8px",
  },
  input: {
    flex: 1,
    padding: "8px 12px",
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px",
    color: "#ffffff",
    fontSize: "13px",
    outline: "none",
    transition: "border-color 0.3s ease",
  },
  botaoBuscar: {
    padding: "8px 12px",
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px",
    color: "#a0aec0",
    cursor: "pointer",
    fontSize: "16px",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "40px",
  },
  enderecoEncontrado: {
    marginTop: "4px",
    fontSize: "11px",
    color: "#00d4aa",
  },
  distancia: {
    background: "rgba(108,99,255,0.1)",
    border: "1px solid rgba(108,99,255,0.2)",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "16px",
    textAlign: "center",
  },
  distanciaTexto: {
    color: "#a0aec0",
    fontSize: "14px",
    margin: "0",
  },
  botaoConfirmar: {
    width: "100%",
    padding: "12px",
    background: "linear-gradient(135deg, #6c63ff, #8b85ff)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  botaoConfirmarDesativado: {
    width: "100%",
    padding: "12px",
    background: "rgba(108,99,255,0.3)",
    color: "rgba(255,255,255,0.5)",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "not-allowed",
  },
  legenda: {
    marginTop: "16px",
    padding: "8px 12px",
    background: "rgba(255,255,255,0.05)",
    borderRadius: "8px",
    color: "#a0aec0",
    fontSize: "12px",
    textAlign: "center",
  },
  mapa: {
    flex: 1,
    height: "100vh",
    position: "relative",
  },
};


export default Mapa;

