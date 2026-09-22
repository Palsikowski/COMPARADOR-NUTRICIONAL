// Portfólio Agrocete: a tabela do material oficial, montada a partir do
// catálogo em vez de transcrita à parte.
//
// A garantia exibida é a MESMA que alimenta os cálculos do app (g/L ou g/kg,
// com o %m/m ao lado). Guardar o texto do material como uma segunda string
// criaria duas versões da garantia que poderiam divergir com o tempo — e o
// portfólio impresso é justamente o que vai para a mão do cliente.

import { PRODUCTS } from "../data/products.js";
import { concentrationUnit, fmtNum } from "./economics.js";
import { nutrientLabel } from "./nutrientLabels.js";

// A ordem dos grupos é a das faixas coloridas na lateral do material.
export const PORTFOLIO_GROUPS = ["Nutrição e Fisiologia", "Tecnologia de Aplicação", "Biológicos"];

export const PORTFOLIO_SOURCE = "Portfólio e posicionamento AGROCETE (material oficial).";

/** Garantia de um produto, na unidade em que o app calcula. */
export function guaranteeParts(p) {
  const conv = Object.entries(p.nutrients || {}).filter(([, v]) => Number(v) > 0);
  if (conv.length > 0) {
    const unit = concentrationUnit(p);
    const pct = p.nutrientsPercent || {};
    return conv
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => ({
        key: k,
        label: nutrientLabel(k),
        value: `${fmtNum(v)} ${unit}`,
        percent: Number(pct[k]) > 0 ? `${fmtNum(pct[k])}%` : null,
      }));
  }
  const pct = Object.entries(p.nutrientsPercent || {}).filter(([, v]) => Number(v) > 0);
  if (pct.length > 0) {
    return pct
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => ({ key: k, label: nutrientLabel(k), value: `${fmtNum(v)}%`, percent: null }));
  }
  return [];
}

/**
 * Linhas do portfólio, agrupadas como no material.
 *
 * Produto biológico e adjuvante não tem garantia nutricional — a "garantia"
 * deles é a composição declarada (cepa, concentração, função). Por isso a
 * coluna cai para `composition` quando não há nutriente, em vez de ficar vazia.
 */
export function portfolioRows() {
  const items = PRODUCTS.filter((p) => p.portfolioGroup).sort(
    (a, b) => (a.portfolioOrder ?? 0) - (b.portfolioOrder ?? 0)
  );
  return PORTFOLIO_GROUPS.map((group) => ({
    group,
    products: items
      .filter((p) => p.portfolioGroup === group)
      .map((p) => ({
        product: p,
        nutrients: guaranteeParts(p),
        composition: p.composition || null,
        culturas: p.culturas || [],
      })),
  })).filter((g) => g.products.length > 0);
}

export function portfolioCultures() {
  const set = new Set();
  PRODUCTS.forEach((p) => {
    if (p.portfolioGroup) (p.culturas || []).forEach((c) => set.add(c.cultura));
  });
  return Array.from(set);
}
