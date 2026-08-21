import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import PasswordGate from "./PasswordGate.jsx";
import { applyStoredOverrides } from "./lib/overrides.js";
import { readStoredTheme, applyTheme } from "./lib/theme.js";

// Aplica as edições manuais de composição ANTES do primeiro render, pra que
// todas as telas (grade, comparativo, caderno, NCI) já nasçam com os mesmos
// valores.
applyStoredOverrides();

// O tema é aplicado antes do primeiro render, e não quando o App monta: a tela
// de entrada vem antes do App e piscava branca pra quem usa o tema escuro.
applyTheme(readStoredTheme());

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <PasswordGate>
      <App />
    </PasswordGate>
  </React.StrictMode>
);
