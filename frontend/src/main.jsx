
// main.jsx - Ponto de entrada da aplicação React
// Este é o primeiro ficheiro executado pelo navegador

import { StrictMode } from "react";           // StrictMode ativa avisos extras durante desenvolvimento
import { createRoot } from "react-dom/client"; // createRoot conecta o React ao HTML
import "./index.css";    // ← importa o CSS global aqui
import App from "./App.jsx";                   // Importa o componente principal da aplicação

// Seleciona o elemento <div id="root"> que existe no index.html
// É dentro deste div que todo o React vai ser renderizado
const root = createRoot(document.getElementById("root"));

// Renderiza a aplicação dentro do root
// StrictMode envolve o App para detectar problemas durante o desenvolvimento
root.render(
  <StrictMode>
    <App />   {/* App é o componente principal — contém toda a navegação */}
  </StrictMode>
);

