
// pages/Mapa.jsx - Componente de mapa interativo
// Usa Leaflet + OpenStreetMap + Nominatim para geocodificação gratuita

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
function CentrarMapa({ coordenadas }) {
  const mapa = useMap();
  useEffect(() => {
    if (coordenadas) {
      mapa.flyTo(coordenadas, 14, { duration: 1.5 });  // Animação suave ao centrar
    }
  }, [coordenadas, mapa]);
  return null;
}


// ===================== COMPONENTE PRINCIPAL DO MAPA =====================
function Mapa({ onConfirmar }) {
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


  // ===================== INTERFACE =====================
  return (
    <div style={estilos.container}>

      {/* ===== PAINEL DE PESQUISA ===== */}
      <div style={estilos.painel}>
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
            />
            <button
              onClick={() => geocodificar(textoOrigem, "origem")}
              style={estilos.botaoBuscar}
              disabled={carregandoOrigem}
            >
              {carregandoOrigem ? "..." : "🔍"}
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
            />
            <button
              onClick={() => geocodificar(textoDestino, "destino")}
              style={estilos.botaoBuscar}
              disabled={carregandoDestino}
            >
              {carregandoDestino ? "..." : "🔍"}
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
          style={origem && destino ? estilos.botaoConfirmar : estilos.botaoConfirmarDesativado}
          disabled={!origem || !destino}
        >
          ✓ Confirmar percurso
        </button>
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
          {centrarEm && <CentrarMapa coordenadas={centrarEm} />}

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
              color="#2563eb"        // Linha azul
              weight={3}             // Espessura
              dashArray="8, 8"       // Linha tracejada
            />
          )}

        </MapContainer>
      </div>

    </div>
  );
}


// ===================== ESTILOS =====================
const estilos = {
  container: {
    display: "flex",
    gap: "0",
    height: "100vh",
    backgroundColor: "#f0f2f5",
  },
  painel: {
    width: "340px",
    minWidth: "340px",
    backgroundColor: "white",
    padding: "24px",
    boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
    overflowY: "auto",
    zIndex: 1000,
  },
  painelTitulo: {
    color: "#1a1a2e",
    fontSize: "16px",
    marginBottom: "20px",
  },
  erro: {
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    padding: "8px 12px",
    borderRadius: "8px",
    marginBottom: "12px",
    fontSize: "13px",
  },
  campo: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    color: "#374151",
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
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "13px",
    outline: "none",
  },
  botaoBuscar: {
    padding: "8px 12px",
    backgroundColor: "#f3f4f6",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
  },
  enderecoEncontrado: {
    marginTop: "4px",
    fontSize: "11px",
    color: "#16a34a",
  },
  distancia: {
    backgroundColor: "#eff6ff",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "16px",
    textAlign: "center",
  },
  distanciaTexto: {
    color: "#1d4ed8",
    fontSize: "14px",
    margin: "0",
  },
  botaoConfirmar: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  botaoConfirmarDesativado: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#93c5fd",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "not-allowed",
  },
  mapa: {
    flex: 1,
    height: "100vh",
  },
};


export default Mapa;

