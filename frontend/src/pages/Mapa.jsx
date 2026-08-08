
// pages/Mapa.jsx - Componente de mapa interativo
// Usa Leaflet + OpenStreetMap + Nominatim para geocodificação gratuita
// Integração com OSRM para cálculo de rotas reais (não linha reta)
// Design moderno com painel glass escuro, animações e melhorias UX

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";

// ===================== CORREÇÃO DOS ÍCONES DO LEAFLET =====================
// O Leaflet tem um problema com o Vite que faz os ícones não aparecerem
// Esta solução força as URLs corretas dos ícones
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ===================== ÍCONES PERSONALIZADOS =====================
// Ícone verde para a origem (passageiro)
const iconeOrigem = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Ícone vermelho para o destino
const iconeDestino = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});


// ===================== COMPONENTE PARA CENTRAR O MAPA =====================
// Necessário porque o MapContainer não atualiza o centro após a criação
// Este componente usa o hook useMap() para acessar a instância do mapa
function CentrarMapa({ coordenadas, origem, destino }) {
  const mapa = useMap();
  
  useEffect(() => {
    // Se temos coordenadas individuais (origem ou destino), centraliza nelas
    if (coordenadas) {
      mapa.flyTo(coordenadas, 14, { duration: 1.5 });  // Animação suave ao centrar
    }
    
    // Se ambos os pontos estão definidos, centraliza no meio do caminho
    // Isso permite ver o trajeto completo
    if (origem && destino) {
      // Calcula o ponto médio entre origem e destino
      const latMedio = (origem.lat + destino.lat) / 2;
      const lngMedio = (origem.lng + destino.lng) / 2;
      
      // Calcula a distância aproximada para ajustar o zoom automaticamente
      // 1 grau de latitude ≈ 111 km
      const dLat = (destino.lat - origem.lat) * 111;
      const dLng = (destino.lng - origem.lng) * 111 * Math.cos(origem.lat * Math.PI / 180);
      const distancia = Math.sqrt(dLat * dLat + dLng * dLng);
      
      // Ajusta o zoom baseado na distância — quanto maior a distância, menor o zoom
      let zoom = 13;
      if (distancia > 20) zoom = 10;      // Muito distante → zoom out
      else if (distancia > 10) zoom = 11;
      else if (distancia > 5) zoom = 12;
      else if (distancia > 2) zoom = 13;
      else zoom = 14;                     // Próximo → zoom in
      
      // Anima o mapa para o ponto médio com o zoom calculado
      mapa.flyTo([latMedio, lngMedio], zoom, { duration: 1.5 });
    }
  }, [coordenadas, origem, destino, mapa]);
  
  return null; // Este componente não renderiza nada visual
}


// ===================== COMPONENTE PRINCIPAL DO MAPA =====================
function Mapa({ onConfirmar, onVoltar }) {
  // ===================== ESTADOS =====================
  
  // Textos dos endereços digitados pelo usuário
  const [textoOrigem, setTextoOrigem] = useState("");
  const [textoDestino, setTextoDestino] = useState("");

  // Coordenadas dos pontos (latitude, longitude e nome do local)
  const [origem, setOrigem] = useState(null);    // { lat, lng, nome }
  const [destino, setDestino] = useState(null);  // { lat, lng, nome }

  // Estados de carregamento para cada campo
  const [carregandoOrigem, setCarregandoOrigem] = useState(false);
  const [carregandoDestino, setCarregandoDestino] = useState(false);
  const [carregandoRota, setCarregandoRota] = useState(false); // Para rota OSRM
  
  const [erro, setErro] = useState("");
  const [centrarEm, setCentrarEm] = useState(null);
  
  // Estado para armazenar a rota real (OSRM)
  const [rota, setRota] = useState(null); // { coordenadas, distancia, duracao }

  // Cache para geocodificação — evita requisições repetidas
  const cacheGeocode = useRef({});
  
  // Referência para debounce — evita requisições em cada tecla
  const debounceRef = useRef(null);

  // Centro inicial do mapa — Maceió, Alagoas
  const centroInicial = [-9.6658, -35.7350];


  // ===================== VALIDAÇÃO DE COORDENADAS =====================
  // Verifica se as coordenadas estão dentro da área de cobertura (Maceió)
  const isCoordenadaValida = useCallback((lat, lng) => {
    // Maceió está aproximadamente entre -9.5 e -9.7 de latitude
    // e entre -35.6 e -35.8 de longitude
    // Aumentamos um pouco a margem para não excluir áreas próximas
    return lat >= -10 && lat <= -9 && lng >= -36 && lng <= -35;
  }, []);


  // ===================== GEOCODIFICAÇÃO COM NOMINATIM =====================
  // Converte um endereço em coordenadas (latitude/longitude)
  const geocodificar = async (endereco, tipo) => {
    // Validação: endereço deve ter pelo menos 3 caracteres
    if (!endereco || endereco.length < 3) {
      setErro("Digite pelo menos 3 caracteres para buscar.");
      return;
    }

    // Limita o tamanho do endereço para evitar URLs muito longas
    if (endereco.length > 200) {
      setErro("Endereço muito longo. Por favor, seja mais específico.");
      return;
    }

    // Define qual estado de carregamento ativar
    if (tipo === "origem") setCarregandoOrigem(true);
    else setCarregandoDestino(true);
    setErro("");

    try {
      // Verifica se o endereço já está em cache
      const chaveCache = `${endereco}_${tipo}`;
      if (cacheGeocode.current[chaveCache]) {
        const dados = cacheGeocode.current[chaveCache];
        // Usa os dados em cache
        if (tipo === "origem") {
          setOrigem(dados);
          setCentrarEm([dados.lat, dados.lng]);
        } else {
          setDestino(dados);
          setCentrarEm([dados.lat, dados.lng]);
        }
        return;
      }

      // Nominatim — API gratuita do OpenStreetMap
      // Adiciona "Maceió, Brasil" para melhorar resultados locais
      const query = encodeURIComponent(`${endereco}, Maceió, Brasil`);
      const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

      // AbortController para timeout de 10 segundos
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const resposta = await fetch(url, {
        headers: {
          // Nominatim exige um User-Agent identificando a aplicação
          "User-Agent": "EveSafetyFirst/1.0"
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      // Verifica se a resposta foi bem-sucedida
      if (!resposta.ok) {
        if (resposta.status === 429) {
          throw new Error("Muitas requisições. Aguarde alguns segundos.");
        } else if (resposta.status === 403) {
          throw new Error("Acesso bloqueado. Tente novamente mais tarde.");
        } else {
          throw new Error("Erro ao buscar endereço.");
        }
      }

      const dados = await resposta.json();

      if (dados.length === 0) {
        setErro(`Endereço "${endereco}" não encontrado. Tente ser mais específico.`);
        return;
      }

      // Extrai os dados do primeiro resultado
      const { lat, lon, display_name } = dados[0];
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lon);
      
      // Valida as coordenadas
      if (!isCoordenadaValida(latNum, lngNum)) {
        setErro("Endereço fora da área de cobertura (Maceió e região).");
        return;
      }

      // Usa display_name ou um nome padrão
      const nome = display_name || `${endereco} (Maceió)`;
      const coordenadas = { lat: latNum, lng: lngNum, nome };

      // Armazena no cache
      cacheGeocode.current[chaveCache] = coordenadas;

      // Atualiza o estado correspondente
      if (tipo === "origem") {
        setOrigem(coordenadas);
        setCentrarEm([coordenadas.lat, coordenadas.lng]);
      } else {
        setDestino(coordenadas);
        setCentrarEm([coordenadas.lat, coordenadas.lng]);
      }

    } catch (err) {
      // Gestiona diferentes tipos de erro
      if (err.name === "AbortError") {
        setErro("Tempo limite excedido. Tente novamente.");
      } else if (err.message) {
        setErro(err.message);
      } else {
        setErro("Erro ao buscar endereço. Verifica a tua ligação à internet.");
      }
    } finally {
      // Desativa o estado de carregamento
      if (tipo === "origem") setCarregandoOrigem(false);
      else setCarregandoDestino(false);
    }
  };


  // ===================== DEBOUNCE PARA GEOCODIFICAÇÃO =====================
  // Evita fazer requisições a cada tecla pressionada
  // Aguarda 500ms após a última tecla para fazer a busca
  const handleGeocodeComDebounce = useCallback((endereco, tipo) => {
    // Limpa o timeout anterior
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    // Se o endereço for curto, não busca
    if (!endereco || endereco.length < 3) return;
    
    // Define um novo timeout
    debounceRef.current = setTimeout(() => {
      geocodificar(endereco, tipo);
    }, 500);
  }, []);


  // ===================== ROTEAMENTO COM OSRM =====================
  // Calcula a rota real (não linha reta) usando a API OSRM
  const buscarRota = useCallback(async (orig, dest) => {
    if (!orig || !dest) return;
    
    // Verifica se a origem e destino são o mesmo ponto
    if (orig.lat === dest.lat && orig.lng === dest.lng) {
      setErro("Origem e destino não podem ser o mesmo local.");
      return;
    }
    
    setCarregandoRota(true);
    setRota(null);
    
    try {
      // OSRM (Open Source Routing Machine) — API gratuita
      // Formato: longitude,latitude para OSRM
      const url = `https://router.project-osrm.org/route/v1/driving/${orig.lng},${orig.lat};${dest.lng},${dest.lat}?overview=full&geometries=geojson`;
      
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000); // 15 segundos para rotas longas
      
      const resposta = await fetch(url, {
        headers: {
          "User-Agent": "EveSafetyFirst/1.0"
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);
      
      if (!resposta.ok) {
        throw new Error("Erro ao calcular a rota.");
      }
      
      const dados = await resposta.json();
      
      if (dados.routes && dados.routes.length > 0) {
        const route = dados.routes[0];
        
        // Extrai as coordenadas da rota e converte para formato Leaflet [lat, lng]
        const coordenadas = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
        
        // Distância em quilômetros
        const distancia = route.distance / 1000;
        
        // Duração em minutos
        const duracao = route.duration / 60;
        
        setRota({ coordenadas, distancia, duracao });
      } else {
        setErro("Não foi possível calcular a rota. Tente novamente.");
      }
    } catch (err) {
      if (err.name === "AbortError") {
        setErro("Tempo limite excedido para cálculo da rota.");
      } else {
        setErro("Erro ao calcular rota. Verifique sua conexão.");
      }
    } finally {
      setCarregandoRota(false);
    }
  }, []);


  // ===================== EFEITO PARA CALCULAR ROTA AUTOMATICAMENTE =====================
  // Quando origem E destino são definidos, calcula a rota automaticamente
  useEffect(() => {
    if (origem && destino) {
      // Verifica se são o mesmo ponto
      if (origem.lat === destino.lat && origem.lng === destino.lng) {
        setErro("Origem e destino não podem ser o mesmo local.");
        setRota(null);
        return;
      }
      buscarRota(origem, destino);
    } else {
      setRota(null);
    }
  }, [origem, destino, buscarRota]);


  // ===================== CALCULAR DISTÂNCIA HAVERSINE (FALLBACK) =====================
  // Usado apenas se a rota OSRM falhar
  // Calcula a distância "em linha reta" entre dois pontos
  const calcularDistanciaHaversine = useCallback((orig, dest) => {
    const R = 6371; // Raio da Terra em km
    const dLat = (dest.lat - orig.lat) * Math.PI / 180;
    const dLng = (dest.lng - orig.lng) * Math.PI / 180;
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(orig.lat * Math.PI / 180) * Math.cos(dest.lat * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c * 100) / 100; // 2 casas decimais
  }, []);


  // ===================== MÉMOISATION DE LA DISTANCE =====================
  // La distance est recalculée seulement si origem ou destino changent
  const distancia = useMemo(() => {
    // Priorise la distance de la route OSRM (réelle)
    if (rota) return rota.distancia;
    // Fallback sur la distance en ligne droite (Haversine)
    if (origem && destino) return calcularDistanciaHaversine(origem, destino);
    return null;
  }, [origem, destino, rota, calcularDistanciaHaversine]);


  // ===================== CONFIRMAR CORRIDA =====================
  const handleConfirmar = () => {
    // Vérifie que l'origine et la destination sont définies
    if (!origem || !destino) {
      setErro("Define a origem e o destino antes de confirmar.");
      return;
    }
    
    // Vérifie que l'origine et la destination sont différentes
    if (origem.lat === destino.lat && origem.lng === destino.lng) {
      setErro("Origem e destino não podem ser o mesmo local.");
      return;
    }
    
    // Vérifie que la route a été calculée
    if (!rota) {
      setErro("Aguardando cálculo da rota...");
      return;
    }

    // Passe les données au composant parent (SolicitarCorrida)
    onConfirmar({
      origem: textoOrigem,
      origem_lat: origem.lat,
      origem_lng: origem.lng,
      destino: textoDestino,
      destino_lat: destino.lat,
      destino_lng: destino.lng,
      distancia: rota.distancia, // Distance réelle de la route
      duracao: rota.duracao,     // Temps estimé en minutes
    });
  };


  // ===================== SPINNER ANIMÉ =====================
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

      {/* ===== PANEL DE RECHERCHE ===== */}
      <div style={estilos.painel}>
        
        {/* Bouton retour */}
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

        {/* Message d'erreur */}
        {erro && <p style={estilos.erro}>{erro}</p>}

        {/* Champ origine */}
        <div style={estilos.campo}>
          <label style={estilos.label}>🟢 Origem</label>
          <div style={estilos.inputBotao}>
            <input
              type="text"
              value={textoOrigem}
              onChange={(e) => {
                setTextoOrigem(e.target.value);
                handleGeocodeComDebounce(e.target.value, "origem");
              }}
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

        {/* Champ destination */}
        <div style={estilos.campo}>
          <label style={estilos.label}>🔴 Destino</label>
          <div style={estilos.inputBotao}>
            <input
              type="text"
              value={textoDestino}
              onChange={(e) => {
                setTextoDestino(e.target.value);
                handleGeocodeComDebounce(e.target.value, "destino");
              }}
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

        {/* Affichage de la distance et du temps estimé */}
        {origem && destino && (
          <div style={estilos.distancia}>
            {carregandoRota ? (
              <p style={estilos.distanciaTexto}>
                <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>
                  ⏳
                </span>
                {" "}Calculando rota...
              </p>
            ) : rota ? (
              <>
                <p style={estilos.distanciaTexto}>
                  📏 Distância: <strong>{rota.distancia.toFixed(2)} km</strong>
                </p>
                <p style={{ ...estilos.distanciaTexto, fontSize: "12px", color: "#6c63ff", marginTop: "4px" }}>
                  ⏱️ Tempo estimado: {Math.round(rota.duracao)} min
                </p>
              </>
            ) : (
              <p style={estilos.distanciaTexto}>
                📏 Distância: <strong>{distancia ? distancia.toFixed(2) : "..."} km</strong>
              </p>
            )}
          </div>
        )}

        {/* Bouton confirmer */}
        <button
          onClick={handleConfirmar}
          disabled={!origem || !destino || !rota}
          style={origem && destino && rota ? estilos.botaoConfirmar : estilos.botaoConfirmarDesativado}
          onMouseEnter={(e) => {
            if (origem && destino && rota) {
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

        {/* Message de confirmation que les deux points sont définis */}
        {origem && destino && !rota && !carregandoRota && (
          <p style={{ ...estilos.legenda, color: "#eab308" }}>
            ⏳ Aguardando cálculo da rota...
          </p>
        )}
        {origem && destino && rota && (
          <p style={{ ...estilos.legenda, color: "#00d4aa" }}>
            ✅ Trajeto definido! Clique em "Confirmar percurso"
          </p>
        )}

        {/* Légende des couleurs */}
        <div style={estilos.legenda}>
          <span style={{ color: "#22c55e" }}>●</span> Origem &nbsp;
          <span style={{ color: "#ef4444" }}>●</span> Destino
        </div>
      </div>

      {/* ===== CARTE ===== */}
      <div style={estilos.mapa}>
        <MapContainer
          center={centroInicial}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          {/* Tuiles OpenStreetMap — gratuites */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Centrage automatique du mapa */}
          {centrarEm && <CentrarMapa coordenadas={centrarEm} origem={origem} destino={destino} />}

          {/* Marqueur de l'origine */}
          {origem && (
            <Marker 
              position={[origem.lat, origem.lng]} 
              icon={iconeOrigem}
              eventHandlers={{
                mouseover: (e) => {
                  e.target.openPopup();
                },
                mouseout: (e) => {
                  e.target.closePopup();
                },
              }}
            >
              <Popup>🟢 Origem: {textoOrigem}</Popup>
            </Marker>
          )}

          {/* Marqueur de la destination */}
          {destino && (
            <Marker 
              position={[destino.lat, destino.lng]} 
              icon={iconeDestino}
              eventHandlers={{
                mouseover: (e) => {
                  e.target.openPopup();
                },
                mouseout: (e) => {
                  e.target.closePopup();
                },
              }}
            >
              <Popup>🔴 Destino: {textoDestino}</Popup>
            </Marker>
          )}

          {/* Affichage de la route réelle (OSRM) */}
          {rota && (
            <Polyline
              positions={rota.coordenadas}
              color="#6c63ff"
              weight={4}
              opacity={0.9}
            />
          )}

          {/* Ligne droite en arrière-plan (transparente) — pour référence */}
          {origem && destino && (
            <Polyline
              positions={[
                [origem.lat, origem.lng],
                [destino.lat, destino.lng]
              ]}
              color="rgba(108,99,255,0.15)"
              weight={2}
              dashArray="5, 10"
            />
          )}

        </MapContainer>
      </div>

      {/* CSS pour le spinner et les popups */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .leaflet-marker-icon {
          filter: drop-shadow(0 2px 8px rgba(0,0,0,0.3));
        }
        /* Style des popups Leaflet — thème sombre */
        .leaflet-popup-content-wrapper {
          background: rgba(26, 26, 46, 0.95) !important;
          backdrop-filter: blur(10px);
          border-radius: 12px !important;
          color: #ffffff !important;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .leaflet-popup-tip {
          background: rgba(26, 26, 46, 0.95) !important;
        }
        .leaflet-popup-content {
          color: #ffffff !important;
          font-size: 14px !important;
        }
        .leaflet-popup-close-button {
          color: #ffffff !important;
        }
      `}</style>
    </div>
  );
}


// ===================== STYLES =====================
const estilos = {
  container: {
    display: "flex",
    gap: "0",
    height: "100vh",
    backgroundColor: "#0f0f1a",
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

