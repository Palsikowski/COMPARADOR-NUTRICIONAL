import { createContext, useContext } from "react";

// Estado de acesso: onde o desbloqueio fica guardado e como sair.
//
// O `PasswordGate` decide se a senha vale; aqui ficam só o armazenamento e o
// contexto, pra qualquer tela poder oferecer "Sair" sem importar o portão (e
// sem duplicar o nome da chave, que precisa ser o mesmo nos dois lados).
//
// Dois lugares possíveis: `localStorage` dura entre sessões (aparelho da
// pessoa) e `sessionStorage` some ao fechar a aba (aparelho compartilhado).
// Quem escolhe é a caixa "manter conectado" da tela de entrada.
export const AUTH_STORAGE_KEY = "agro-comparador-auth-v1";

function safeStore(get) {
  try {
    return get();
  } catch {
    // Navegador com storage bloqueado (aba anônima restrita, política de
    // privacidade): sem persistência, o acesso vale só enquanto a aba viver.
    return null;
  }
}

function stores() {
  return [safeStore(() => localStorage), safeStore(() => sessionStorage)];
}

export function readUnlocked(expectedHash) {
  for (const store of stores()) {
    try {
      if (store && store.getItem(AUTH_STORAGE_KEY) === expectedHash) return true;
    } catch {
      // storage recusou a leitura: tenta o próximo
    }
  }
  return false;
}

export function storeUnlocked(hash, remember) {
  try {
    const store = remember ? localStorage : sessionStorage;
    store.setItem(AUTH_STORAGE_KEY, hash);
  } catch {
    // sem storage: o desbloqueio vale só enquanto a página estiver aberta
  }
}

export function clearUnlock() {
  for (const store of stores()) {
    try {
      store?.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // idem: se não dá pra apagar, o estado em memória já foi derrubado
    }
  }
}

export const AuthContext = createContext({ signOut: () => {} });

export function useAuth() {
  return useContext(AuthContext);
}
