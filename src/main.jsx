import React from "react";
import ReactDOM from "react-dom/client";
import AgroComparador from "./AgroComparador.jsx";
import PasswordGate from "./PasswordGate.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <PasswordGate>
      <AgroComparador />
    </PasswordGate>
  </React.StrictMode>
);
