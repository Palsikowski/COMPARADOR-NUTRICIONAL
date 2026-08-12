// Confiabilidade dos dados.
//
// Cada produto do catálogo carrega um campo `fonte` dizendo de onde os dados
// vieram. Aqui esse texto vira um selo comparável na interface, pra o usuário
// saber o peso do que está lendo antes de decidir.
//
// IMPORTANTE: nada aqui inventa procedência. Os níveis são derivados do campo
// `fonte` real; quando não dá pra classificar, o resultado é explicitamente
// "não informada" em vez de um selo otimista.

export const LEVELS = {
  OFFICIAL: {
    id: "official",
    icon: "✓",
    label: "Planilha oficial",
    short: "Oficial",
    tone: "ok",
    help: "Dado extraído de planilha/material oficial da Agrocete ou do fabricante.",
  },
  DECLARED: {
    id: "declared",
    icon: "✓",
    label: "Dado informado",
    short: "Informado",
    tone: "info",
    help: "Dado informado por planilha enviada pela equipe, sem conferência contra ficha técnica do fabricante.",
  },
  UNVERIFIED: {
    id: "unverified",
    icon: "⚠",
    label: "Não verificado",
    short: "Não verificado",
    tone: "warn",
    help: "Só o nome do produto foi cadastrado — sem composição conferida. Confirme na ficha técnica antes de usar numa cotação.",
  },
  TRIAL: {
    id: "trial",
    icon: "🧪",
    label: "Resultado experimental",
    short: "Experimental",
    tone: "trial",
    help: "Dado vindo de ensaio/experimento cadastrado.",
  },
  UNKNOWN: {
    id: "unknown",
    icon: "—",
    label: "Fonte não informada",
    short: "Sem fonte",
    tone: "muted",
    help: "Não há origem registrada para esse dado.",
  },
};

// Classifica pelo texto real do campo `fonte`. As regras cobrem exatamente as
// procedências que existem hoje no catálogo — qualquer texto novo cai em
// DECLARED (informado) e nunca em OFFICIAL, pra não promover dado sozinho.
export function provenanceOf(product) {
  const f = (product?.fonte || "").toLowerCase();
  if (!f) return LEVELS.UNKNOWN;
  // Produto que entrou só como nome na matriz de equivalência: sem composição.
  if (f.includes("matriz de equival")) return LEVELS.UNVERIFIED;
  if (f.includes("planilha interna agrocete")) return LEVELS.OFFICIAL;
  if (f.includes("diel.pdf") || f.includes("material enviado")) return LEVELS.DECLARED;
  if (f.includes("planilha")) return LEVELS.DECLARED;
  return LEVELS.DECLARED;
}

// Um produto sem nutriente cadastrado não sustenta comparação numérica,
// independente da fonte — a interface usa isso pra avisar antes de comparar.
export function isComparable(product) {
  return !!product?.hasNutrients && Object.keys(product?.nutrients || {}).length > 0;
}

// Motivos pelos quais uma comparação fica incompleta. A interface lista isso
// em vez de simplesmente mostrar números vazios.
export function comparisonGaps(product, { dose, price }) {
  const gaps = [];
  if (!isComparable(product)) gaps.push("sem composição nutricional cadastrada");
  if (!(Number(dose) > 0)) gaps.push("sem dose definida");
  if (!(Number(price) > 0)) gaps.push("sem preço informado");
  return gaps;
}
