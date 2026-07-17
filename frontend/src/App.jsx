
// App.jsx - Mapa de navegação da aplicação
// Define quais telas existem e quais precisam de autenticação

// BrowserRouter — envolve toda a aplicação e ativa o sistema de rotas
// Routes — container que agrupa todas as rotas
// Route — define uma rota (URL → componente)
// Navigate — redireciona para outra URL programaticamente
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Importa todas as telas que vamos criar
import Login from "./pages/Login";                     // Tela de login
import Cadastro from "./pages/Cadastro";               // Tela de cadastro
import Menu from "./pages/Menu";                       // Menu principal após login
import SolicitarCorrida from "./pages/SolicitarCorrida"; // Tela para solicitar corrida
import Historico from "./pages/Historico";             // Tela de histórico de corridas
import Pagamento from "./pages/Pagamento";             // Tela de pagamento
import CorridasMotorista from "./pages/motorista/CorridasMotorista";
import HistoricoMotorista from "./pages/motorista/HistoricoMotorista";


// ===================== COMPONENTE DE ROTA PROTEGIDA =====================
// Envolve telas que só podem ser acedidas por utilizadores logados
// Se não houver token, redireciona para a tela de login automaticamente
function RotaProtegida({ children }) {
  // Verifica se existe um token guardado no localStorage
  // Token é guardado após login bem-sucedido
  const token = localStorage.getItem("token");

  // Se não há token — utilizador não está logado
  // Navigate redireciona para "/" (tela de login) sem mostrar a tela protegida
  if (!token) {
    return <Navigate to="/" />;
  }

  // Se há token — utilizador está logado — mostra a tela normalmente
  // children é o componente filho passado entre as tags <RotaProtegida>...</RotaProtegida>
  return children;
}


// ===================== COMPONENTE PRINCIPAL =====================
function App() {
  return (
    // BrowserRouter ativa o sistema de rotas em toda a aplicação
    <BrowserRouter>

      {/* Routes agrupa todas as rotas — só uma rota é mostrada de cada vez */}
      <Routes>

        {/* Telas públicas — acessíveis sem login */}
        <Route path="/" element={<Login />} />           {/* localhost:5173/ → Login */}
        <Route path="/cadastro" element={<Cadastro />} /> {/* localhost:5173/cadastro → Cadastro */}

        {/* Telas protegidas — só acessíveis com login */}
        {/* RotaProtegida verifica o token antes de mostrar cada tela */}

        <Route
          path="/menu"
          element={
            <RotaProtegida>
              <Menu />    {/* Só mostra Menu se estiver logado */}
            </RotaProtegida>
          }
        />

        <Route
          path="/corrida"
          element={
            <RotaProtegida>
              <SolicitarCorrida />    {/* Só mostra SolicitarCorrida se estiver logado */}
            </RotaProtegida>
          }
        />

        <Route
          path="/historico"
          element={
            <RotaProtegida>
              <Historico />    {/* Só mostra Historico se estiver logado */}
            </RotaProtegida>
          }
        />

        <Route
          path="/pagamento"
          element={
            <RotaProtegida>
              <Pagamento />    {/* Só mostra Pagamento se estiver logado */}
            </RotaProtegida>
          }
        />

        <Route
          path="/motorista/corridas"
          element={
            <RotaProtegida>
              <CorridasMotorista />
            </RotaProtegida>
          }
        />

        <Route
          path="/motorista/historico"
          element={
            <RotaProtegida>
              <HistoricoMotorista />
            </RotaProtegida>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App; // Exporta para que main.jsx possa importar e renderizar

