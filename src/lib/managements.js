// Manejos: os oficiais (dos materiais Agrocete) e os do usuário.
//
// Os oficiais em `data/managementPresets.js` são somente leitura — são a
// referência. Editar um deles cria uma CÓPIA do usuário, guardada no
// aparelho; o oficial permanece intacto pra sempre dar pra voltar à
// referência e pra ninguém alterar sem perceber o que a Agrocete publicou.

import { MANAGEMENT_PRESETS } from "../data/managementPresets.js";

export const STORAGE_KEY = "agro-managements-v1";

export function loadCustom() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustom(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // sem localStorage: só não persiste
  }
}

export function genId() {
  return `mng-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

// Formato normalizado usado pela interface, igual pros dois tipos.
export function officialManagements() {
  return Object.entries(MANAGEMENT_PRESETS).map(([name, data]) => ({
    id: `oficial:${name}`,
    name,
    official: true,
    source: data.source || "Material oficial Agrocete.",
    stages: data.stages.map((s) => ({
      id: s.key,
      label: s.label,
      items: s.items.map((i) => ({ productId: i.productId, dose: i.dose, note: i.note || "" })),
    })),
  }));
}

export function allManagements(custom) {
  return [...officialManagements(), ...custom];
}

// Cópia editável a partir de um manejo existente (oficial ou do usuário).
export function duplicateManagement(mng, newName) {
  return {
    id: genId(),
    name: newName || `${mng.name} (cópia)`,
    official: false,
    basedOn: mng.official ? mng.name : mng.basedOn || mng.name,
    source: mng.official
      ? `Cópia editável do manejo oficial "${mng.name}".`
      : `Cópia de "${mng.name}".`,
    createdAt: Date.now(),
    stages: mng.stages.map((s) => ({
      id: genId(),
      label: s.label,
      items: s.items.map((i) => ({ ...i })),
    })),
  };
}

export function emptyManagement(name = "Novo manejo") {
  return {
    id: genId(),
    name,
    official: false,
    source: "Manejo criado por você neste aparelho.",
    createdAt: Date.now(),
    stages: [{ id: genId(), label: "Etapa 1", items: [] }],
  };
}

// Soma as doses de um manejo por produto (um produto em 2 etapas soma).
export function totalsByProduct(mng) {
  const out = {};
  mng.stages.forEach((s) =>
    s.items.forEach((i) => {
      const d = Number(i.dose) || 0;
      out[i.productId] = Math.round(((out[i.productId] || 0) + d) * 1000) / 1000;
    })
  );
  return out;
}

// Seleção pronta pro comparador do catálogo (mesmo formato do `selected`).
export function toSelection(mng) {
  const totals = totalsByProduct(mng);
  const selection = {};
  Object.entries(totals).forEach(([id, dose]) => {
    selection[id] = { dose, price: 0 };
  });
  return selection;
}
