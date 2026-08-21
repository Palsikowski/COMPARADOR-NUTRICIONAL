// Tema claro/escuro: chave, leitura e aplicação num lugar só.
//
// Estava dentro do App. Só que a tela de entrada é renderizada ANTES do App
// montar, então ela nascia sempre clara mesmo pra quem tinha escolhido escuro —
// um flash branco antes do login. Aqui o tema é aplicado no boot (main.jsx) e
// o App continua sendo o dono da alternância.

export const THEME_KEY = "agro-theme";

export function readStoredTheme() {
  try {
    return localStorage.getItem(THEME_KEY) === "dark";
  } catch {
    // sem localStorage: cai no tema claro, que é o padrão da plataforma
    return false;
  }
}

export function applyTheme(dark) {
  document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
}

export function storeTheme(dark) {
  try {
    localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
  } catch {
    // sem localStorage: o tema só não persiste
  }
}
