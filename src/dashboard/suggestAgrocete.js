const AGROCETE = "AGROCETE";
const MAX_SUGGESTIONS = 6;
const MIN_SCORE = 0.005; // abaixo disso o produto não ajuda o suficiente pra valer a pena sugerir
const STILL_NEEDED_RATIO = 0.15; // segue sugerindo enquanto restar >15% do déficit original de algum nutriente

// Heurística gulosa de aproximação de nutrientes — NÃO é um solver exato
// nem uma recomendação agronômica validada, é um ponto de partida rápido
// pra cotação: dado o total de nutrientes do manejo concorrente (menos o
// que o manejo Agrocete já selecionado cobre), escolhe produtos Agrocete
// reais do catálogo, um de cada vez, priorizando quem cobre mais dos
// nutrientes que ainda faltam, e calcula uma dose que cobre o nutriente
// mais restritivo daquele produto sem estourar muito além da dose de
// referência do catálogo.
//
// Retorna { suggestions, remaining, deficit }. "remaining" é o que sobrou
// sem cobertura ao final — para saber se isso é significativo (ex: um
// nutriente que nenhum produto Agrocete do catálogo contém) ou só um
// resíduo de arredondamento, compare com "deficit" (o valor original,
// antes de qualquer sugestão) usando uncoveredKeys() abaixo, em vez de
// checar remaining[k] > 0 diretamente.
export function suggestAgroceteProducts({ totals, allNutrientKeys, allProducts, selected }) {
  const deficit = {};
  allNutrientKeys.forEach((k) => {
    const comp = totals.comp.nutrients[k] || 0;
    const agro = totals.agro.nutrients[k] || 0;
    deficit[k] = Math.max(0, comp - agro);
  });

  const deficitKeys = allNutrientKeys.filter((k) => deficit[k] > 0);
  if (deficitKeys.length === 0) return { suggestions: [], remaining: {}, deficit };

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

    // dose = a MAIOR dose entre as necessárias pra cobrir cada nutriente que
    // esse produto ajuda — ou seja, a dose que atende o nutriente em que o
    // produto é mais "diluído" relativamente ao que falta (o mais
    // restritivo). Os outros nutrientes, mais concentrados nesse produto,
    // acabam sobrando (o que é bom, não um problema). Usar a MENOR dose
    // aqui (como numa versão anterior) sub-cobre todo o resto e, com
    // déficits pequenos e produtos concentrados, podia arredondar pra 0 e
    // descartar silenciosamente um produto que na verdade era uma ótima
    // indicação — capado abaixo pra não estourar longe da dose de
    // referência do catálogo.
    let dose = 0;
    Object.entries(best.nutrients).forEach(([k, gPerUnit]) => {
      const need = remaining[k];
      if (!need || need <= 0 || !gPerUnit) return;
      const neededDose = need / gPerUnit;
      if (neededDose > dose) dose = neededDose;
    });
    used.add(best.id);
    if (!isFinite(dose) || dose <= 0) continue;

    const cap = (best.defaultDose || 1) * 8;
    const rawDose = Math.min(dose, cap);
    dose = Math.round(rawDose * 100) / 100;
    if (dose <= 0) dose = rawDose > 0 ? 0.01 : 0; // não descarta um produto bom só por arredondamento
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

  return { suggestions, remaining, deficit };
}

// Nutrientes cuja cobertura ficou genuinamente insuficiente (ainda resta
// mais de 20% do déficit original) — filtra ruído de arredondamento de
// dose, que deixa uma sobra minúscula mesmo quando o nutriente foi bem
// coberto (ex: 1,32 g vs 1,32 g não deveria aparecer como "não coberto").
export function uncoveredKeys(remaining, deficit, ratio = 0.2) {
  return Object.keys(remaining).filter((k) => deficit[k] > 0 && remaining[k] > deficit[k] * ratio);
}
