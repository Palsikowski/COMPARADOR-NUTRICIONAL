// Modelo do modo apresentação.
//
// O comparativo da página da empresa é uma tela de estudo: densa, com tudo
// visível ao mesmo tempo. Numa reunião isso não funciona — projetado, o
// gráfico inteiro vira uma parede de barras e ninguém sabe onde olhar.
//
// Este arquivo transforma os mesmos painéis do comparativo numa sequência de
// slides: primeiro o quadro completo, depois um nutriente por vez, depois as
// ressalvas. Nenhum número novo é inventado aqui — é o mesmo dado do gráfico,
// reordenado por "o que separa os produtos".
//
// A view fica em src/presentation/. Aqui só o modelo, para que a regra de o
// que vira destaque seja legível (e discutível) sem abrir JSX.

import { chartValues } from "./brandTiles.js";

// Quantas BARRAS cabem num slide — não quantos nutrientes.
//
// O que estoura a altura da projeção é a barra, e cada nutriente vale uma
// barra por produto: 7 nutrientes são 7 linhas com um produto e 28 com
// quatro. Contar nutrientes deixava o slide caber com dois produtos e passar
// da tela com quatro. Contando barras, o gráfico ocupa a mesma altura
// independentemente do tamanho da seleção.
export const MAX_BAR_ROWS = 10;

// Piso: com quatro produtos, 10 barras dariam 2 nutrientes por slide. Menos de
// dois vira um slide por barra.
const MIN_NUTRIENTS_PER_SLIDE = 2;

export function nutrientsPerSlide(productCount) {
  return Math.max(MIN_NUTRIENTS_PER_SLIDE, Math.floor(MAX_BAR_ROWS / Math.max(1, productCount)));
}

// Teto de slides de destaque. Três é o que uma reunião absorve; o resto
// continua no slide do painel completo.
export const MAX_HIGHLIGHTS = 3;

export function valueOf(product, nutrient) {
  const v = Number(chartValues(product)?.values?.[nutrient]);
  return Number.isFinite(v) && v > 0 ? v : 0;
}

/**
 * Como um nutriente se comporta dentro de um painel.
 *
 * `gap` é a distância relativa do primeiro para o segundo (0 = empatados,
 * 1 = só um declara). `share` é o tamanho do líder contra o maior valor do
 * painel inteiro — sem ele, um micronutriente com 10× de diferença e 0,4 g/L
 * roubaria o slide de um macro com diferença real de 80 g/L.
 *
 * O score é o produto dos dois: **grande e claramente diferente**. Ordem de
 * destaque, não julgamento de qualidade — quem entrega mais de um nutriente
 * não é "melhor", é diferente.
 */
export function nutrientStats(panel, nutrient) {
  const entries = panel.products
    .map((p) => ({ product: p, value: valueOf(p, nutrient) }))
    .sort((a, b) => b.value - a.value);
  const declared = entries.filter((e) => e.value > 0);
  const leader = declared[0] || null;
  const runnerUp = declared[1] || null;
  const share = panel.max > 0 && leader ? leader.value / panel.max : 0;
  const gap = leader ? (leader.value - (runnerUp ? runnerUp.value : 0)) / leader.value : 0;

  return {
    nutrient,
    unit: panel.unit,
    entries,
    declared,
    leader,
    runnerUp,
    // "Exclusivo" só faz sentido havendo com quem comparar.
    exclusive: declared.length === 1 && panel.products.length > 1,
    silent: entries.length - declared.length, // quantos não declaram
    share,
    gap,
    ratio: runnerUp && runnerUp.value > 0 ? leader.value / runnerUp.value : null,
    score: share * gap,
  };
}

// Nutrientes que mais separam os produtos do painel, do mais para o menos.
export function highlightsOf(panel) {
  if (panel.products.length < 2) return [];
  return panel.nutrients
    .map((n) => nutrientStats(panel, n))
    .filter((s) => s.leader && s.score > 0)
    .sort((a, b) => b.score - a.score);
}

// Fatia um painel em pedaços que caibam em MAX_BAR_ROWS barras,
// preservando `max` para que a escala não mude de um slide para o outro — se
// mudasse, a mesma barra teria dois tamanhos na mesma apresentação.
function slicePanel(panel) {
  const total = panel.nutrients.length;
  const step = nutrientsPerSlide(panel.products.length);
  if (total <= step) return [panel];

  // Fatias equilibradas em vez de "enche até o teto e sobra o resto": com 4
  // nutrientes e teto 3, encher daria 3 + 1 — e um slide inteiro para uma
  // barra solta parece erro de montagem. Distribuindo, dá 2 + 2.
  const count = Math.ceil(total / step);
  const base = Math.floor(total / count);
  const extra = total % count;

  const parts = [];
  let at = 0;
  for (let k = 0; k < count; k++) {
    const size = base + (k < extra ? 1 : 0);
    parts.push({ ...panel, nutrients: panel.nutrients.slice(at, at + size) });
    at += size;
  }
  return parts;
}

/**
 * Monta a sequência de slides a partir do que o comparativo já calculou.
 *
 * A ordem é a da conversa: quem estamos comparando → o quadro completo → o que
 * chama atenção → o que o dado NÃO sustenta → fecho. As ressalvas vêm antes do
 * fecho de propósito: numa reunião elas precisam ser ditas por quem apresenta,
 * não descobertas depois pelo cliente.
 */
export function buildDeck({ brand, panels, withoutData = [], note = "", products = [] }) {
  const slides = [];

  slides.push({ kind: "cover", brand, products, panels, withoutData });

  const usable = panels.filter((p) => p.products.length > 0 && p.nutrients.length > 0);
  usable.forEach((panel) => {
    const parts = slicePanel(panel);
    parts.forEach((part, i) => {
      slides.push({
        kind: "panel",
        panel: part,
        unit: panel.unit,
        multiUnit: usable.length > 1,
        part: parts.length > 1 ? { index: i + 1, total: parts.length } : null,
      });
    });
  });

  // Destaques de todos os painéis disputam as mesmas vagas: se a seleção
  // mistura g/L e %m/m, ganha vaga quem separa mais dentro do seu painel.
  const highlights = usable
    .flatMap((panel) => highlightsOf(panel).map((s) => ({ ...s, panel })))
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_HIGHLIGHTS);
  highlights.forEach((stat) => slides.push({ kind: "highlight", stat, panel: stat.panel }));

  const caveats = caveatsOf({ panels: usable, withoutData });
  if (caveats.length) slides.push({ kind: "caveats", caveats });

  slides.push({ kind: "close", brand, note, products, panels: usable });

  return slides;
}

// Ressalvas que a plataforma já declara na tela, reunidas num slide só para
// serem ditas em voz alta em vez de lidas em letra miúda.
export function caveatsOf({ panels, withoutData }) {
  const out = [];

  if (panels.length > 1) {
    out.push({
      id: "unidades",
      tone: "info",
      title: `A seleção mistura ${panels.map((p) => p.unit).join(" e ")}`,
      body:
        "É um gráfico por unidade porque elas não dividem a mesma escala: g/L é por litro, g/kg é por quilo e %m/m é proporção. Comparar a altura de uma barra de um gráfico com a de outro não significa nada.",
    });
  }

  if (panels.some((p) => p.unit === "% m/m")) {
    out.push({
      id: "percentual",
      tone: "warn",
      title: "Os produtos em %m/m não têm densidade cadastrada",
      body:
        "O material de origem não trouxe a densidade, então não dá para converter para g/L nem calcular custo por quilo de nutriente. O gráfico compara a proporção declarada, não a entrega por hectare.",
    });
  }

  if (withoutData.length) {
    out.push({
      id: "sem-composicao",
      tone: "warn",
      title: `${withoutData.length} produto${withoutData.length > 1 ? "s" : ""} fora do gráfico`,
      body: `${withoutData
        .map((p) => p.name)
        .join(", ")} não tem composição cadastrada. Não vira barra zerada porque “não sabemos” é diferente de “não entrega”.`,
    });
  }

  out.push({
    id: "dose",
    tone: "info",
    title: "O gráfico é concentração, não entrega por hectare",
    body:
      "Duas concentrações só viram quantidade aplicada depois da dose, e só viram custo depois do preço — nenhum dos dois está no catálogo. Para essa conta, a Calculadora Custo/ha.",
  });

  return out;
}
