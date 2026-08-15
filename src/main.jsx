import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import PasswordGate from "./PasswordGate.jsx";
import { applyStoredOverrides } from "./lib/overrides.js";

// Aplica as edições manuais de composição ANTES do primeiro render, pra que
// todas as telas (grade, comparativo, caderno, NCI) já nasçam com os mesmos
// valores.
applyStoredOverrides();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <PasswordGate>
      <App />
    </PasswordGate>
  </React.StrictMode>
);
