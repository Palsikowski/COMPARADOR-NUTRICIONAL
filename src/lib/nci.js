// NCI — Nutrição & Custo Index.
//
// É um **índice comparativo entre os produtos selecionados**, não uma nota de
// qualidade do produto e não um veredito de "vencedor". Cada critério é
// normalizado contra o outro lado da comparação (o melhor do par vira 100),
// então o mesmo produto pode ter NCI diferente dependendo de com quem está
// sendo comparado. Isso é intencional: fora de um par, o número não significa
// nada.
//
// REGRA DE HONESTIDADE (a parte mais importante deste arquivo):
// só entram na conta critérios que têm dado real no catálogo. Os critérios
// abaixo foram pedidos mas NÃO existem na base, então são declarados como
// ausentes na interface em vez de receberem um valor inventado:
//
//   - tecnologia (quelato/complexado/aminoácido/fosfito): não há campo;
//     apenas ~4% dos produtos mencionam algo em texto livre.
//   - evidência experimental: não há nenhum ensaio cadastrado.
//
// Sem dado suficiente, o índice não é calculado — devolve `insufficient` e a
// interface mostra "Dados insuficientes para avaliação completa".

import { economicsFor } from "./economics.js";
import { positioningFor } from "./catalog.js";
import { isComparable } from "./provenance.js";

// Critérios efetivamente calculados, com peso. A soma dos pesos usados é
// renormalizada quando algum critério não se aplica ao par.
export const CRITERIA = [
  {
    id: "cost_per_ha",
    label: "Custo por hectare",
    weight: 25,
    lowerIsBetter: true,
    help: "Dose informada × preço informado.",
  },
  {
    id: "cost_per_kg",
    label: "Custo por kg de nutriente",
    weight: 30,
    lowerIsBetter: true,
    help: "Custo/ha dividido pelo total de nutriente entregue por hectare. É o critério de maior peso porque é o que compara produtos de concentrações diferentes.",
  },
  {
    id: "delivery",
    label: "Nutriente entregue por hectare",
    weight: 25,
    lowerIsBetter: false,
    help: "Soma dos nutrientes entregues na dose informada (g/ha).",
  },
  {
    id: "breadth",
    label: "Amplitude de nutrientes",
    weight: 10,
    lowerIsBetter: false,
    help: "Quantos nutrientes distintos o produto declara.",
  },
  {
    id: "positioning",
    label: "Posicionamento cadastrado",
    weight: 10,
    lowerIsBetter: false,
    help: "Quantas combinações de cultura/estádio o produto tem registradas no manejo oficial.",
  },
];

// Critérios pedidos que a base não sustenta — a interface lista isso aberto.
export const MISSING_CRITERIA = [
  {
    label: "Tecnologia de formulação",
    reason: "Não existe campo de tecnologia no catálogo; só ~4% dos produtos citam algo em texto livre.",
  },
  {
    label: "Evidência experimental",
    reason: "Não há nenhum resultado de ensaio cadastrado na base.",
  },
];

function totalDelivered(product, dose) {
  const d = Number(dose) || 0;
  return Object.values(product?.nutrients || {}).reduce((s, v) => s + (Number(v) || 0) * d, 0);
}

function rawValues(product, { dose, price }) {
  const econ = economicsFor(product, { dose, price, areaHa: 1 });
  const delivered = totalDelivered(product, dose);
  const costPerKg = delivered > 0 && econ.costPerHa > 0 ? econ.costPerHa / (delivered / 1000) : null;
  return {
    cost_per_ha: econ.costPerHa > 0 ? econ.costPerHa : null,
    cost_per_kg: costPerKg,
    delivery: delivered > 0 ? delivered : null,
    breadth: Object.keys(product?.nutrients || {}).length || null,
    positioning: positioningFor(product.id).length || null,
  };
}

// Normaliza um critério dentro do par: o melhor vira 100, o outro recebe a
// proporção. Empate = 100 pros dois.
function normalizePair(a, b, lowerIsBetter) {
  if (a == null && b == null) return [null, null];
  if (a == null) return [null, 100];
  if (b == null) return [100, null];
  if (a === b) return [100, 100];
  if (lowerIsBetter) {
    const best = Math.min(a, b);
    return [(best / a) * 100, (best / b) * 100];
  }
  const best = Math.max(a, b);
  return [(a / best) * 100, (b / best) * 100];
}

/**
 * Calcula o NCI dos dois lados de uma comparação.
 * Devolve { insufficient, reasons, a: {score, parts}, b: {...}, usedWeight }.
 */
export function computeNCI(sideA, sideB) {
  const reasons = [];
  [
    [sideA, "Produto A"],
    [sideB, "Produto B"],
  ].forEach(([s, label]) => {
    if (!s?.product) return;
    if (!isComparable(s.product)) reasons.push(`${label} não tem composição nutricional cadastrada`);
    if (!(Number(s.dose) > 0)) reasons.push(`${label} está sem dose informada`);
    if (!(Number(s.price) > 0)) reasons.push(`${label} está sem preço informado`);
  });

  if (!sideA?.product || !sideB?.product) {
    return { insufficient: true, reasons: ["Selecione dois produtos"], a: null, b: null };
  }
  if (reasons.length > 0) {
    return { insufficient: true, reasons, a: null, b: null };
  }

  const rawA = rawValues(sideA.product, sideA);
  const rawB = rawValues(sideB.product, sideB);

  const partsA = [];
  const partsB = [];
  let usedWeight = 0;

  CRITERIA.forEach((c) => {
    const [na, nb] = normalizePair(rawA[c.id], rawB[c.id], c.lowerIsBetter);
    // Critério que nenhum dos dois tem simplesmente não entra na conta.
    if (na == null && nb == null) {
      partsA.push({ ...c, raw: null, normalized: null, applied: false });
      partsB.push({ ...c, raw: null, normalized: null, applied: false });
      return;
    }
    usedWeight += c.weight;
    partsA.push({ ...c, raw: rawA[c.id], normalized: na ?? 0, applied: true });
    partsB.push({ ...c, raw: rawB[c.id], normalized: nb ?? 0, applied: true });
  });

  if (usedWeight === 0) {
    return { insufficient: true, reasons: ["Nenhum critério pôde ser calculado com os dados disponíveis"], a: null, b: null };
  }

  const score = (parts) =>
    parts.filter((p) => p.applied).reduce((s, p) => s + (p.normalized * p.weight) / usedWeight, 0);

  return {
    insufficient: false,
    reasons: [],
    usedWeight,
    a: { score: score(partsA), parts: partsA },
    b: { score: score(partsB), parts: partsB },
  };
}
