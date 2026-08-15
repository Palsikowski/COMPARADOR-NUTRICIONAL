// Vitrine de empresas ("bandeiras") e o material do comparativo dentro de cada
// uma.
//
// Uma observação importante sobre a bandeira: **o catálogo não tem logotipo de
// nenhuma empresa** — as planilhas trazem só o nome. Desenhar um logo parecido
// seria inventar identidade visual de terceiros, então a bandeira é um bloco de
// cor com a inicial da empresa, derivado do próprio nome. É um marcador
// consistente (a mesma empresa recebe sempre a mesma cor), não uma marca.

import { PRODUCTS } from "../data/products.js";
import { AGROCETE, productsOfBrand } from "./catalog.js";
import { provenanceOf, LEVELS } from "./provenance.js";
import { concentrationUnit } from "./economics.js";

// Matiz derivada do nome: determinística, então a empresa não "troca de cor" a
// cada carregamento. Saturação e luminosidade fixas mantêm todas as bandeiras
// no mesmo peso visual — nenhuma empresa ganha destaque por acaso.
function hueFromName(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return h;
}

export function brandBadge(brand) {
  const isAgrocete = brand === AGROCETE;
  const letters = brand
    .replace(/[^A-Za-zÀ-ÿ0-9 ]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const initials = (letters.length >= 2 ? letters[0][0] + letters[1][0] : brand.slice(0, 2)).toUpperCase();
  const hue = hueFromName(brand);
  return {
    initials,
    // A Agrocete usa o verde da plataforma; as demais, a matiz do próprio nome.
    fg: isAgrocete ? "var(--brand)" : `hsl(${hue} 62% 34%)`,
    bg: isAgrocete ? "var(--brand-soft)" : `hsl(${hue} 62% 93%)`,
    fgDark: isAgrocete ? "var(--brand)" : `hsl(${hue} 55% 72%)`,
    bgDark: isAgrocete ? "var(--brand-soft)" : `hsl(${hue} 40% 20%)`,
  };
}

// Uma linha por empresa, com só o que a bandeira precisa mostrar. Calculado uma
// vez: são 61 empresas e 1595 produtos, não vale recalcular a cada render.
export const BRAND_TILES = (() => {
  const byBrand = new Map();
  for (const p of PRODUCTS) {
    let t = byBrand.get(p.brand);
    if (!t) {
      t = { brand: p.brand, total: 0, withComposition: 0, official: 0, categories: new Map(), nutrients: new Set() };
      byBrand.set(p.brand, t);
    }
    t.total += 1;
    if (p.hasNutrients) t.withComposition += 1;
    if (provenanceOf(p) === LEVELS.OFFICIAL) t.official += 1;
    if (p.category) t.categories.set(p.category, (t.categories.get(p.category) || 0) + 1);
    Object.entries(p.nutrients || {}).forEach(([k, v]) => {
      if (Number(v) > 0) t.nutrients.add(k);
    });
  }

  return Array.from(byBrand.values())
    .map((t) => ({
      brand: t.brand,
      total: t.total,
      withComposition: t.withComposition,
      official: t.official,
      topCategories: Array.from(t.categories.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([c]) => c),
      nutrients: Array.from(t.nutrients),
      badge: brandBadge(t.brand),
    }))
    .sort((a, b) => {
      // Agrocete primeiro (é a casa), depois por portfólio cadastrado.
      if (a.brand === AGROCETE) return -1;
      if (b.brand === AGROCETE) return 1;
      return b.total - a.total || a.brand.localeCompare(b.brand);
    });
})();

export function tileFor(brand) {
  return BRAND_TILES.find((t) => t.brand === brand) || null;
}

/**
 * Prepara os dados do gráfico comparativo de uma seleção de produtos.
 *
 * Duas decisões que mudam o resultado, e por quê:
 *
 * 1. **Produto sem composição não vira barra.** Ele não tem número; desenhar
 *    zero faria parecer "entrega nada", que é diferente de "não sabemos".
 *    Volta separado em `withoutData` pra tela dizer isso em texto.
 * 2. **g/L e g/kg não dividem o mesmo eixo.** Um é por litro e o outro por
 *    quilo — comparar as alturas seria comparar coisas diferentes. Quando a
 *    seleção mistura os dois, saem dois gráficos, um por unidade, cada um com
 *    a sua escala.
 */
export function comparisonData(products) {
  const withData = products.filter((p) => p.hasNutrients && Object.values(p.nutrients || {}).some((v) => Number(v) > 0));
  const withoutData = products.filter((p) => !withData.includes(p));

  const byUnit = new Map();
  for (const p of withData) {
    const unit = concentrationUnit(p);
    if (!byUnit.has(unit)) byUnit.set(unit, []);
    byUnit.get(unit).push(p);
  }

  const panels = Array.from(byUnit.entries()).map(([unit, items]) => {
    // Nutrientes ordenados pela maior entrega dentro do painel: o que mais
    // diferencia os produtos fica no topo, onde o olho começa.
    const totals = new Map();
    items.forEach((p) =>
      Object.entries(p.nutrients || {}).forEach(([k, v]) => {
        if (Number(v) > 0) totals.set(k, Math.max(totals.get(k) || 0, Number(v)));
      })
    );
    const nutrients = Array.from(totals.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([k]) => k);
    const max = Math.max(...totals.values());
    return { unit, products: items, nutrients, max };
  });

  return { panels, withoutData };
}
