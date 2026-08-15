// Nome por extenso de cada nutriente, num lugar só.
//
// Estava repetido em quatro telas com pequenas divergências entre elas (uma com
// "P2O5", outra com "P₂O₅"), o que fazia o mesmo nutriente aparecer escrito
// diferente conforme onde o consultor olhasse.
export const NUTRIENT_LABEL = {
  N: "Nitrogênio",
  P2O5: "Fósforo (P₂O₅)",
  K2O: "Potássio (K₂O)",
  Ca: "Cálcio",
  Mg: "Magnésio",
  S: "Enxofre",
  B: "Boro",
  Cu: "Cobre",
  Mn: "Manganês",
  Zn: "Zinco",
  Fe: "Ferro",
  Mo: "Molibdênio",
  Ni: "Níquel",
  Co: "Cobalto",
  Cl: "Cloro",
  C_Org: "Carbono orgânico",
};

export function nutrientLabel(key) {
  return NUTRIENT_LABEL[key] || key;
}
