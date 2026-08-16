// Agrupamento funcional das categorias do catálogo.
//
// As planilhas-fonte trazem o mesmo tipo de produto escrito de formas
// diferentes ("Nutrição e Fisiologia" e "NUTRIÇÃO E FISIOLOGIA", "Biocontrole"
// e "BIOCONTROLE", "Tec. de Aplicação" e "TEC. APLIC."), então filtrar pela
// string crua deixaria metade dos produtos de fora do filtro. Aqui cada grupo
// junta todas as grafias que significam a mesma coisa.
//
// IMPORTANTE: os grupos refletem o que a planilha de fato diz — não inferimos
// via de aplicação. Em especial, não existe um grupo "Foliar": a categoria
// dominante das planilhas é "Nutrição e Fisiologia", que mistura foliar e
// solo sem distinguir, e separar isso seria inventar classificação agronômica
// que o dado não tem.

const GROUPS = [
  {
    id: "nutricao",
    label: "Nutrição",
    match: [
      "nutricao e fisiologia", "nutricao", "bioestimulantes", "linha profol", "linha kellus",
      "linha pro", "linha bees", "sais", "compass minerals",
      // linhas do portfólio Gran7
      "nutricao gran7", "tecnologia complex", "fosfitos", "fisiologicos",
      "tecnologias anti-estresse", "desalojante de lagartas",
    ],
  },
  {
    id: "solo",
    label: "Solo",
    match: ["macro e micro de solo", "fertilizante de solo"],
  },
  {
    id: "sementes",
    label: "Trat. de sementes",
    match: ["ts", "inoculante", "inoculantes", "tratamento de sementes", "nodusoja", "noduagri", "dat"],
  },
  {
    id: "biologicos",
    label: "Biológicos",
    match: ["biologicos", "controle biologico", "biocontrole", "nematicida fitoquimico"],
  },
  {
    id: "adjuvantes",
    label: "Adjuvantes / Tec. aplicação",
    match: ["tec. aplic.", "tec. de aplicacao", "adjuvantes", "oleos e condicionadores"],
  },
];

function norm(s) {
  return (s || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

const LOOKUP = new Map();
GROUPS.forEach((g) => g.match.forEach((m) => LOOKUP.set(m, g.id)));

export function categoryGroupId(category) {
  return LOOKUP.get(norm(category)) ?? null;
}

export function productInGroup(product, groupId) {
  return categoryGroupId(product.category) === groupId;
}

// Só devolve os grupos que realmente têm produto no catálogo, já com a
// contagem — chip de filtro vazio só atrapalha.
export function buildCategoryGroups(products) {
  const counts = {};
  products.forEach((p) => {
    const id = categoryGroupId(p.category);
    if (id) counts[id] = (counts[id] || 0) + 1;
  });
  return GROUPS.filter((g) => counts[g.id] > 0).map((g) => ({ id: g.id, label: g.label, count: counts[g.id] }));
}
