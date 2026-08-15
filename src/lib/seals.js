// Selos especiais do card de produto.
//
// Todos derivam de dado que existe no cadastro (marca e categoria). Não há
// campo de "tecnologia de formulação" na base, então NÃO existe selo de
// quelato/aminoácido/fosfito — inventar isso a partir de texto livre daria um
// selo errado em produto de concorrente, que é justamente onde ele pesaria
// numa conversa de venda.

import { categoryGroupId } from "../dashboard/categoryGroups.js";

const AGROCETE = "AGROCETE";

export function sealsFor(product) {
  const out = [];
  if (product.brand === AGROCETE) {
    out.push({ id: "agrocete", label: "Agrocete", tone: "brand" });
  }

  const cat = (product.category || "").toLowerCase();
  if (cat.includes("bioestimulante")) {
    out.push({ id: "bioestimulante", label: "Bioestimulante", tone: "info" });
  }

  const group = categoryGroupId(product.category);
  if (group === "adjuvantes") {
    out.push({ id: "aplicacao", label: "Tec. de aplicação", tone: "neutral" });
  } else if (group === "biologicos") {
    out.push({ id: "biologico", label: "Biológico", tone: "ok" });
  } else if (group === "sementes") {
    out.push({ id: "ts", label: "Trat. de sementes", tone: "neutral" });
  } else if (group === "solo") {
    out.push({ id: "solo", label: "Solo", tone: "neutral" });
  }

  return out;
}

export const SEAL_STYLES = {
  brand: { bg: "var(--brand-soft)", fg: "var(--brand)" },
  info: { bg: "var(--info-soft)", fg: "var(--info)" },
  ok: { bg: "var(--ok-soft)", fg: "var(--ok)" },
  neutral: { bg: "var(--surface-2)", fg: "var(--text-2)" },
};
