// Camada de acesso ao catálogo: índices derivados e estatísticas.
//
// Tudo aqui é calculado a partir dos dados reais em `data/` — nenhum número
// é escrito à mão. Se o catálogo crescer, os indicadores da home acompanham
// sozinhos.

import { PRODUCTS } from "../data/products.js";
import { COMPETITOR_BRANDS } from "../data/brands.js";
import { EQUIVALENCES } from "../data/equivalences.js";
import { MANAGEMENT_PRESETS } from "../data/managementPresets.js";
import { provenanceOf, isComparable } from "./provenance.js";

export const AGROCETE = "AGROCETE";

export const ALL_BRANDS = [AGROCETE, ...COMPETITOR_BRANDS];

export const PRODUCTS_BY_ID = new Map(PRODUCTS.map((p) => [p.id, p]));

export function getProduct(id) {
  return PRODUCTS_BY_ID.get(id) || null;
}

// Onde cada produto aparece posicionado por cultura/estádio. Hoje isso só
// existe pros produtos que estão nos manejos oficiais (Soja, Milho, Algodão) —
// ver `data/managementPresets.js`. Produto fora desses manejos simplesmente
// não tem posicionamento cadastrado, e a interface diz isso em vez de inventar.
export const POSITIONING_BY_PRODUCT = (() => {
  const map = new Map();
  Object.entries(MANAGEMENT_PRESETS).forEach(([culture, data]) => {
    data.stages.forEach((stage) => {
      stage.items.forEach((item) => {
        if (!map.has(item.productId)) map.set(item.productId, []);
        map.get(item.productId).push({
          culture,
          stageKey: stage.key,
          stage: stage.label,
          dose: item.dose,
          note: item.note || null,
        });
      });
    });
  });
  return map;
})();

export function positioningFor(productId) {
  return POSITIONING_BY_PRODUCT.get(productId) || [];
}

export const CULTURES = Object.keys(MANAGEMENT_PRESETS);

// Estádios fenológicos cadastrados, por cultura. Buscar "V4" precisa achar o
// estádio "V3–V5" da Soja, então o casamento é por faixa: quebra o rótulo em
// tokens (V3, V5, V6...) e confere se o termo cai dentro do intervalo.
export const STAGES = (() => {
  const out = [];
  Object.entries(MANAGEMENT_PRESETS).forEach(([culture, data]) => {
    data.stages.forEach((s) => out.push({ culture, key: s.key, label: s.label, count: s.items.length }));
  });
  return out;
})();

// Extrai as faixas numéricas de um rótulo de estádio ("V3–V5/V6" -> V:[3,6]).
function stageRanges(label) {
  const ranges = {};
  const re = /([A-Za-z]+)\s*(\d+)/g;
  let m;
  while ((m = re.exec(label)) !== null) {
    const letter = m[1].toUpperCase();
    const num = Number(m[2]);
    if (!ranges[letter]) ranges[letter] = [num, num];
    else {
      ranges[letter][0] = Math.min(ranges[letter][0], num);
      ranges[letter][1] = Math.max(ranges[letter][1], num);
    }
  }
  return ranges;
}

export function stagesMatching(term) {
  const t = (term || "").trim().toUpperCase();
  const m = /^([A-Z]+)\s*(\d+)$/.exec(t);
  if (!m) {
    // texto solto: casa pelo rótulo mesmo
    return STAGES.filter((s) => s.label.toUpperCase().includes(t) && t.length >= 2);
  }
  const [, letter, numStr] = m;
  const num = Number(numStr);
  return STAGES.filter((s) => {
    const r = stageRanges(s.label)[letter];
    return r && num >= r[0] && num <= r[1];
  });
}

// Nutrientes distintos efetivamente presentes no catálogo (não a lista
// teórica de nutrientes possíveis).
export const NUTRIENTS_IN_CATALOG = (() => {
  const set = new Set();
  PRODUCTS.forEach((p) => Object.keys(p.nutrients || {}).forEach((k) => set.add(k)));
  return Array.from(set);
})();

// Indicadores da plataforma — todos derivados, nada digitado.
export function platformStats() {
  const withNutrients = PRODUCTS.filter(isComparable).length;
  const withDose = PRODUCTS.filter((p) => Number(p.defaultDose) > 0).length;
  const byProvenance = {};
  PRODUCTS.forEach((p) => {
    const id = provenanceOf(p).id;
    byProvenance[id] = (byProvenance[id] || 0) + 1;
  });
  return {
    products: PRODUCTS.length,
    brands: ALL_BRANDS.length,
    nutrients: NUTRIENTS_IN_CATALOG.length,
    cultures: CULTURES.length,
    withNutrients,
    withDose,
    equivalences: EQUIVALENCES.length,
    agroceteProducts: PRODUCTS.filter((p) => p.brand === AGROCETE).length,
    byProvenance,
  };
}

export function productsOfBrand(brand) {
  return PRODUCTS.filter((p) => p.brand === brand);
}

// Perfil de uma empresa a partir do que o catálogo realmente tem sobre ela.
export function brandProfile(brand) {
  const items = productsOfBrand(brand);
  const categories = {};
  const nutrients = new Set();
  items.forEach((p) => {
    if (p.category) categories[p.category] = (categories[p.category] || 0) + 1;
    Object.keys(p.nutrients || {}).forEach((k) => nutrients.add(k));
  });
  return {
    brand,
    total: items.length,
    comparable: items.filter(isComparable).length,
    categories: Object.entries(categories).sort((a, b) => b[1] - a[1]),
    nutrients: Array.from(nutrients),
    products: items,
  };
}

function norm(s) {
  return (s || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

// Busca unificada da plataforma: produtos, marcas e nutrientes no mesmo
// resultado, porque a home promete "produto, empresa, nutriente ou cultura".
export function searchAll(query, { nutrientMeta = {}, limit = 8 } = {}) {
  const q = norm(query).trim();
  if (q.length < 2) return { products: [], brands: [], nutrients: [], cultures: [] };

  const products = [];
  for (const p of PRODUCTS) {
    const name = norm(p.name);
    let score = -1;
    if (name.startsWith(q)) score = 100;
    else if (name.includes(q)) score = 60;
    else if (norm(p.brand).includes(q)) score = 25;
    else if (norm(p.composition).includes(q)) score = 15;
    if (score < 0) continue;
    if (p.brand === AGROCETE) score += 6;
    if (isComparable(p)) score += 4;
    products.push({ p, score });
  }
  products.sort((a, b) => b.score - a.score || a.p.name.localeCompare(b.p.name));

  const brands = ALL_BRANDS.filter((b) => norm(b).includes(q)).slice(0, 4);

  const nutrients = NUTRIENTS_IN_CATALOG.filter((k) => {
    const label = norm(nutrientMeta[k]?.label ?? k);
    return norm(k).includes(q) || label.includes(q);
  }).slice(0, 5);

  const cultures = CULTURES.filter((c) => norm(c).includes(q));
  const stages = stagesMatching(query).slice(0, 5);

  return { products: products.slice(0, limit).map((x) => x.p), brands, nutrients, cultures, stages };
}
