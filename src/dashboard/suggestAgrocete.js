const AGROCETE = "AGROCETE";
const MAX_SUGGESTIONS = 6;
const MIN_SCORE = 0.05; // abaixo disso o produto não ajuda o suficiente pra valer a pena sugerir
const STILL_NEEDED_RATIO = 0.15; // segue sugerindo enquanto restar >15% do déficit original de algum nutriente

// Heurística gulosa de aproximação de nutrientes — NÃO é um solver exato
// nem uma recomendação agronômica validada, é um ponto de partida rápido
// pra cotação: dado o total de nutrientes do manejo concorrente (menos o
// que o manejo Agrocete já selecionado cobre), escolhe produtos Agrocete
// reais do catálogo, um de cada vez, priorizando quem cobre mais dos
// nutrientes que ainda faltam, e calcula uma dose que cobre o nutriente
// mais restritivo daquele produto sem estourar muito além da dose de
// referência do catálogo.
export function suggestAgroceteProducts({ totals, allNutrientKeys, allProducts, selected }) {
  const deficit = {};
  allNutrientKeys.forEach((k) => {
    const comp = totals.comp.nutrients[k] || 0;
    const agro = totals.agro.nutrients[k] || 0;
    deficit[k] = Math.max(0, comp - agro);
  });

  const deficitKeys = allNutrientKeys.filter((k) => deficit[k] > 0);
  if (deficitKeys.length === 0) return [];

  const candidates = allProducts.filter(
    (p) =>
      p.brand === AGROCETE &&
      p.hasNutrients &&
      !selected[p.id] &&
      Object.entries(p.nutrients || {}).some(([k, v]) => v > 0 && deficit[k] > 0)
  );

  const remaining = { ...deficit };
  const used = new Set();
  const suggestions = [];

  for (let iter = 0; iter < MAX_SUGGESTIONS; iter++) {
    let best = null;
    let bestScore = 0;

    for (const p of candidates) {
      if (used.has(p.id)) continue;
      let score = 0;
      Object.entries(p.nutrients).forEach(([k, gPerUnit]) => {
        const need = remaining[k];
        if (!need || need <= 0 || !gPerUnit) return;
        const contribAtDefaultDose = gPerUnit * (p.defaultDose || 1);
        score += Math.min(contribAtDefaultDose, need) / need;
      });
      if (score > bestScore) {
        bestScore = score;
        best = p;
      }
    }

    if (!best || bestScore < MIN_SCORE) break;

    // dose = a menor dose que cobre totalmente o nutriente mais restritivo
    // que esse produto ajuda (evita estourar muito esse nutriente).
    let dose = Infinity;
    Object.entries(best.nutrients).forEach(([k, gPerUnit]) => {
      const need = remaining[k];
      if (!need || need <= 0 || !gPerUnit) return;
      const neededDose = need / gPerUnit;
      if (neededDose < dose) dose = neededDose;
    });
    used.add(best.id);
    if (!isFinite(dose) || dose <= 0) continue;

    const cap = (best.defaultDose || 1) * 8;
    dose = Math.round(Math.min(dose, cap) * 100) / 100;
    if (dose <= 0) continue;

    const covers = [];
    Object.entries(best.nutrients).forEach(([k, gPerUnit]) => {
      if (remaining[k] > 0 && gPerUnit > 0) {
        remaining[k] = Math.max(0, remaining[k] - gPerUnit * dose);
        covers.push(k);
      }
    });

    suggestions.push({ productId: best.id, dose, price: best.defaultPrice ?? 0, covers });

    const stillNeeded = deficitKeys.some((k) => remaining[k] > deficit[k] * STILL_NEEDED_RATIO);
    if (!stillNeeded) break;
  }

  return suggestions;
}
