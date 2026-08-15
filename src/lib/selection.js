// Seleção compartilhada entre o catálogo (grade) e a tela de manejo.
//
// As duas telas mexem no MESMO blob do localStorage que o dashboard já usava,
// preservando os outros campos (manejos salvos, doses travadas, cliente).
// Assim, marcar um produto na grade e ir pro comparativo simplesmente
// funciona, sem duplicar estado nem migrar o que já estava salvo.

export const STORAGE_KEY = "agro-dashboard-state-v1";

function readBlob() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function loadSelection() {
  const blob = readBlob();
  return blob.selected && typeof blob.selected === "object" ? blob.selected : {};
}

export function loadDoseOverrides() {
  const blob = readBlob();
  return blob.doseOverrides && typeof blob.doseOverrides === "object" ? blob.doseOverrides : {};
}

// Grava só a seleção, mantendo o resto do blob intacto.
export function saveSelection(selected) {
  try {
    const blob = readBlob();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...blob, selected }));
  } catch {
    // sem localStorage: só não persiste
  }
}

// Dose inicial de um produto ao entrar no manejo: a travada tem prioridade
// sobre a de referência do catálogo (mesma regra da tela de manejo).
export function initialDose(product, doseOverrides = {}) {
  const locked = doseOverrides[product.id]?.dose;
  return locked ?? product.defaultDose ?? 0;
}
