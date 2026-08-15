// Edições manuais de composição feitas pelo usuário.
//
// PRINCÍPIO: o catálogo publicado nunca é sobrescrito. A edição vira uma
// camada por cima, guardada no aparelho, sempre reversível — o valor original
// fica preservado e o produto passa a exibir que foi editado.
//
// POR QUE MUTA O OBJETO DO PRODUTO: a composição é lida em muitos lugares
// (grade, ficha, comparador, NCI, caderno, sugestão de manejo, totais do
// manejo). Se a edição valesse só na ficha, o comparativo e o caderno
// continuariam com o número velho — que é exatamente o erro que essa função
// existe pra evitar. Aplicar no objeto compartilhado, uma vez no início,
// garante que TODO consumidor enxergue o mesmo valor, sem depender de lembrar
// de passar o override em cada tela.

import { PRODUCTS_BY_ID } from "./catalog.js";

export const STORAGE_KEY = "agro-product-overrides-v1";

// Guarda o estado original de cada produto tocado, pra permitir desfazer.
const ORIGINALS = new Map();

export function loadOverrides() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function persist(all) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // sem localStorage: a edição vale só nesta sessão
  }
}

function snapshot(product) {
  if (ORIGINALS.has(product.id)) return;
  ORIGINALS.set(product.id, {
    nutrients: { ...(product.nutrients || {}) },
    nutrientsPercent: product.nutrientsPercent ? { ...product.nutrientsPercent } : null,
    density: product.density ?? null,
    unit: product.unit ?? null,
    hasNutrients: !!product.hasNutrients,
    composition: product.composition ?? null,
  });
}

// Recalcula o %m/m a partir da concentração, mantendo a regra de unidades do
// catálogo: g/L = %m/m × densidade × 10 (líquido) e g/kg = %m/m × 10 (sólido).
function percentFrom(nutrients, unit, density) {
  const out = {};
  const divisor = unit === "kg/ha" ? 10 : (Number(density) || 0) * 10;
  if (!(divisor > 0)) return null;
  Object.entries(nutrients).forEach(([k, v]) => {
    out[k] = Math.round((Number(v) / divisor) * 10000) / 10000;
  });
  return out;
}

function applyToProduct(product, ov) {
  snapshot(product);
  const nutrients = {};
  Object.entries(ov.nutrients || {}).forEach(([k, v]) => {
    const n = Number(v);
    if (Number.isFinite(n) && n > 0) nutrients[k] = n;
  });

  product.nutrients = nutrients;
  product.hasNutrients = Object.keys(nutrients).length > 0;
  if (ov.unit) product.unit = ov.unit;
  if (ov.density !== undefined) product.density = ov.density === "" || ov.density == null ? null : Number(ov.density);
  product.nutrientsPercent = percentFrom(nutrients, product.unit, product.density);
  product.edited = true;
  product.editedAt = ov.editedAt || Date.now();
  product.editedNote = ov.note || null;
}

function restoreProduct(product) {
  const orig = ORIGINALS.get(product.id);
  if (!orig) return;
  product.nutrients = { ...orig.nutrients };
  product.nutrientsPercent = orig.nutrientsPercent ? { ...orig.nutrientsPercent } : null;
  product.density = orig.density;
  product.unit = orig.unit;
  product.hasNutrients = orig.hasNutrients;
  product.composition = orig.composition;
  delete product.edited;
  delete product.editedAt;
  delete product.editedNote;
}

// Chamada uma vez no início do app, antes de qualquer render.
export function applyStoredOverrides() {
  const all = loadOverrides();
  Object.entries(all).forEach(([id, ov]) => {
    const p = PRODUCTS_BY_ID.get(id);
    if (p) applyToProduct(p, ov);
  });
  return Object.keys(all).length;
}

export function saveOverride(productId, { nutrients, unit, density, note }) {
  const p = PRODUCTS_BY_ID.get(productId);
  if (!p) return;
  const all = loadOverrides();
  all[productId] = { nutrients, unit, density, note: note || "", editedAt: Date.now() };
  persist(all);
  applyToProduct(p, all[productId]);
}

export function clearOverride(productId) {
  const all = loadOverrides();
  delete all[productId];
  persist(all);
  const p = PRODUCTS_BY_ID.get(productId);
  if (p) restoreProduct(p);
}

export function isEdited(product) {
  return !!product?.edited;
}

// Valores originais, pra mostrar o "antes" na tela de edição.
export function originalOf(productId) {
  return ORIGINALS.get(productId) || null;
}

export function countEdited() {
  return Object.keys(loadOverrides()).length;
}
