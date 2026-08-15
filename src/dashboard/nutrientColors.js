// Cor fixa por nutriente — a mesma cor representa o mesmo nutriente em todo o
// app (pills do card, comparativo, bottom sheet), pra o consultor bater o olho
// e reconhecer sem ler o rótulo. Escolhidas pra terem contraste suficiente
// entre si e sobre o fundo escuro, inclusive no modo alto contraste.
export const NUTRIENT_COLORS = {
  // Macros
  N: "#4ADE80", // verde
  P2O5: "#60A5FA", // azul
  K2O: "#FB923C", // laranja
  Ca: "#E2E8F0", // branco-gelo (cálcio)
  // Secundários
  Mg: "#F472B6", // rosa
  S: "#FACC15", // amarelo
  // Micros
  B: "#38BDF8", // azul claro
  Cu: "#FB7185", // coral
  Mn: "#A78BFA", // roxo
  Zn: "#2DD4BF", // turquesa
  Fe: "#F87171", // vermelho
  Mo: "#818CF8", // índigo
  Ni: "#94A3B8", // cinza-azulado
  Co: "#C084FC", // lilás
  Cl: "#7DD3FC", // azul gelo (cloro)
  C_Org: "#D6A45C", // marrom claro (matéria orgânica)
};

const FALLBACK = "#8CA0AF";

export function nutrientColor(key) {
  return NUTRIENT_COLORS[key] ?? FALLBACK;
}

// Abreviação curta pra caber na pill (o rótulo longo vai no title/tooltip).
export const NUTRIENT_SHORT = {
  N: "N",
  P2O5: "P",
  K2O: "K",
  Ca: "Ca",
  Mg: "Mg",
  S: "S",
  B: "B",
  Cu: "Cu",
  Mn: "Mn",
  Zn: "Zn",
  Fe: "Fe",
  Mo: "Mo",
  Ni: "Ni",
  Co: "Co",
  Cl: "Cl",
  C_Org: "C.Org",
};

export function nutrientShort(key) {
  return NUTRIENT_SHORT[key] ?? key;
}
