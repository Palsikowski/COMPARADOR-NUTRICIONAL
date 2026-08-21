import React, { useState } from "react";
import SignInPage from "./components/SignInPage.jsx";
import { platformStats } from "./lib/catalog.js";
import { fmtNum } from "./lib/economics.js";

// Portão de senha simples para desencorajar acesso casual ao app publicado.
// NÃO é segurança de verdade: o hash abaixo fica visível no código-fonte da
// página, e quem quiser pode tentar quebrá-lo offline. Serve só para não
// deixar o app aberto pra qualquer um que ache o link.
//
// Aqui mora a regra (o que é senha válida, onde o desbloqueio fica guardado);
// o desenho da tela é do SignInPage.
const PASSWORD_HASH = "ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f";
const STORAGE_KEY = "agro-comparador-auth-v1";

async function sha256Hex(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// O desbloqueio pode ficar em dois lugares: `localStorage` dura entre sessões
// (aparelho da pessoa) e `sessionStorage` some ao fechar a aba (aparelho
// compartilhado, que é o caso do notebook que roda no escritório). Quem decide
// é a caixa "manter conectado".
function readUnlocked() {
  for (const store of [safeStore(() => localStorage), safeStore(() => sessionStorage)]) {
    try {
      if (store && store.getItem(STORAGE_KEY) === PASSWORD_HASH) return true;
    } catch {
      // storage bloqueado: segue pro próximo
    }
  }
  return false;
}

function safeStore(get) {
  try {
    return get();
  } catch {
    return null;
  }
}

function storeUnlocked(hash, remember) {
  try {
    const store = remember ? localStorage : sessionStorage;
    store.setItem(STORAGE_KEY, hash);
  } catch {
    // sem storage: o desbloqueio vale só enquanto a página estiver aberta
  }
}

export default function PasswordGate({ children }) {
  const [unlocked, setUnlocked] = useState(readUnlocked);
  const [error, setError] = useState(null);
  const [hint, setHint] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const senha = String(form.get("password") || "");
    const remember = form.get("remember") === "on";

    setBusy(true);
    try {
      const hash = await sha256Hex(senha);
      if (hash === PASSWORD_HASH) {
        storeUnlocked(hash, remember);
        setUnlocked(true);
      } else {
        setError("Senha incorreta. Confira e tente de novo.");
        setHint(null);
      }
    } catch {
      // crypto.subtle exige contexto seguro (https ou localhost). Abrindo o
      // arquivo por http://IP da rede local, por exemplo, ele não existe.
      setError("Não foi possível verificar a senha neste navegador. Abra o painel por HTTPS ou pelo endereço local.");
    } finally {
      setBusy(false);
    }
  }

  if (unlocked) return children;

  const stats = platformStats();
  const notes = [
    {
      value: fmtNum(stats.products, 0),
      label: "produtos",
      text: "Cada um com a origem do dado registrada — planilha interna, material do fabricante ou só o nome.",
    },
    {
      value: fmtNum(stats.withNutrients, 0),
      label: "com composição",
      text: "Convertida para g/L ou g/kg. O que falta aparece como lacuna, nunca como zero.",
    },
    {
      value: fmtNum(stats.brands, 0),
      label: "empresas",
      text: "Portfólio da Agrocete e dos concorrentes lado a lado, na mesma unidade.",
    },
  ];

  return (
    <SignInPage
      title="Entrar no painel"
      description="Acesso restrito à equipe. A senha é a mesma para todo mundo — peça a quem administra o painel se ainda não tiver."
      passwordPlaceholder="Digite a senha do time"
      error={error}
      hint={hint}
      busy={busy}
      heroShader
      heroTitle="Compare. Entenda. Decida melhor."
      heroText="Composição, posicionamento e custo por hectare a partir dos dados reais das planilhas internas e dos materiais oficiais — nunca de dados inventados."
      notes={notes}
      onSubmit={handleSubmit}
      onResetPassword={() => {
        setError(null);
        setHint("Não há recuperação automática: a entrada é uma senha só, compartilhada pela equipe. Peça a quem administra o painel.");
      }}
    />
  );
}
