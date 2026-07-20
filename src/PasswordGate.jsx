import React, { useState } from "react";
import { Lock } from "lucide-react";

// Portão de senha simples para desencorajar acesso casual ao app publicado.
// NÃO é segurança de verdade: o hash abaixo fica visível no código-fonte da
// página, e quem quiser pode tentar quebrá-lo offline. Serve só para não
// deixar o app aberto pra qualquer um que ache o link.
const PASSWORD_HASH = "ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f";
const STORAGE_KEY = "agro-comparador-auth-v1";

async function sha256Hex(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function PasswordGate({ children }) {
  const [unlocked, setUnlocked] = useState(() => localStorage.getItem(STORAGE_KEY) === PASSWORD_HASH);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const hash = await sha256Hex(password);
    if (hash === PASSWORD_HASH) {
      localStorage.setItem(STORAGE_KEY, hash);
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
    }
  }

  if (unlocked) return children;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#23301F",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', system-ui, sans-serif",
        padding: 20,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#EDEAE0",
          borderRadius: 14,
          padding: 28,
          width: "100%",
          maxWidth: 320,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: "#23301F",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 6,
          }}
        >
          <Lock size={20} color="#8FBF6B" />
        </div>
        <h1 style={{ fontSize: 16, fontWeight: 700, color: "#23301F", margin: 0 }}>Comparador de Manejo Foliar</h1>
        <p style={{ fontSize: 12, color: "#6B6A5F", margin: "0 0 10px", textAlign: "center" }}>
          Acesso restrito. Digite a senha para continuar.
        </p>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(false);
          }}
          placeholder="Senha"
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            border: `1.5px solid ${error ? "#A23E2B" : "#DEDACB"}`,
            fontSize: 14,
            boxSizing: "border-box",
            fontFamily: "inherit",
          }}
        />
        {error && <span style={{ fontSize: 12, color: "#A23E2B" }}>Senha incorreta.</span>}
        <button
          type="submit"
          style={{
            width: "100%",
            marginTop: 8,
            padding: "10px",
            borderRadius: 8,
            border: "none",
            background: "#23301F",
            color: "#EDEAE0",
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
