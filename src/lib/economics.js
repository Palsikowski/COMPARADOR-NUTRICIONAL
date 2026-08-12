// Cálculos econômicos da plataforma.
//
// REGRA DE UNIDADES (crítica — nunca misturar sem converter):
//   - Produto LÍQUIDO  → `unit: "L/ha"`,  nutrientes em **g/L**,  preço em **R$/L**
//   - Produto SÓLIDO   → `unit: "kg/ha"`, nutrientes em **g/kg**, preço em **R$/kg**
// Em ambos os casos a conta de nutriente entregue é a mesma:
//   g/ha = (g por unidade) × (unidades por hectare)
// porque a unidade de dose casa com a unidade da concentração. É por isso
// que `nutrientPerHa` não precisa da densidade: a densidade já foi aplicada
// lá atrás, quando %m/m virou g/L (ver cabeçalho de data/products.js).

// Unidade base da dose ("L/ha" -> "L", "kg/ha" -> "kg").
export function doseUnit(product) {
  return (product?.unit || "un").split("/")[0];
}

// Unidade em que a concentração do produto está expressa.
export function concentrationUnit(product) {
  return product?.unit === "kg/ha" ? "g/kg" : "g/L";
}

// Custo por hectare = dose (un/ha) × preço (R$/un).
export function costPerHectare({ dose, price }) {
  const d = Number(dose) || 0;
  const p = Number(price) || 0;
  return d * p;
}

// Custo total para uma área. Mantido separado de `costPerHectare` de
// propósito: a área é uma variável do usuário, não do produto.
export function costForArea({ dose, price, areaHa }) {
  return costPerHectare({ dose, price }) * (Number(areaHa) || 0);
}

// Gramas de um nutriente entregues por hectare naquela dose.
export function nutrientPerHa(product, nutrientKey, dose) {
  const conc = product?.nutrients?.[nutrientKey];
  if (conc == null) return null;
  return conc * (Number(dose) || 0);
}

// Custo por quilo de nutriente entregue — o indicador que permite comparar
// produtos tecnicamente parecidos com concentrações e doses diferentes.
//
// Devolve `null` (e não 0) quando falta qualquer entrada, pra interface
// conseguir distinguir "custo zero" de "não dá pra calcular".
export function costPerKgNutrient(product, nutrientKey, { dose, price }) {
  const gPerHa = nutrientPerHa(product, nutrientKey, dose);
  if (gPerHa == null || gPerHa <= 0) return null;
  const cost = costPerHectare({ dose, price });
  if (cost <= 0) return null;
  return cost / (gPerHa / 1000); // R$ / kg de nutriente
}

// Quadro econômico completo de um produto numa dose/preço, pronto pra tela.
export function economicsFor(product, { dose, price, areaHa = 1 }) {
  const d = Number(dose) || 0;
  const p = Number(price) || 0;
  const perHa = costPerHectare({ dose: d, price: p });
  const nutrients = {};
  Object.keys(product?.nutrients || {}).forEach((k) => {
    nutrients[k] = {
      gPerHa: nutrientPerHa(product, k, d),
      costPerKg: costPerKgNutrient(product, k, { dose: d, price: p }),
    };
  });
  return {
    dose: d,
    price: p,
    doseUnit: doseUnit(product),
    concentrationUnit: concentrationUnit(product),
    costPerHa: perHa,
    costTotal: perHa * (Number(areaHa) || 0),
    areaHa: Number(areaHa) || 0,
    nutrients,
    // Sem preço não existe economia — a interface usa isso pra pedir o preço
    // em vez de mostrar "R$ 0,00" como se fosse um resultado.
    hasPrice: p > 0,
    hasDose: d > 0,
  };
}

// Diferença entre dois valores, em absoluto e percentual, tomando `b` como
// base. Devolve null quando não dá pra comparar (evita divisão por zero e
// falsos "+∞%").
export function diff(a, b) {
  const av = Number(a);
  const bv = Number(b);
  const aOk = Number.isFinite(av);
  const bOk = Number.isFinite(bv);
  if (!aOk && !bOk) return null;
  if (!aOk || av === 0) return { abs: -(bv || 0), pct: null, kind: "only-b" };
  if (!bOk || bv === 0) return { abs: av, pct: null, kind: "only-a" };
  return { abs: av - bv, pct: ((av - bv) / bv) * 100, kind: "both" };
}

export function fmtBRL(n) {
  return Number(n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function fmtNum(n, digits = 2) {
  return Number(n || 0).toLocaleString("pt-BR", { maximumFractionDigits: digits });
}
