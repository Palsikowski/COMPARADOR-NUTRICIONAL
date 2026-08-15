// Manejos prontos por cultura, baseados no material oficial "Manejo
// Atualizado 2024" da própria Agrocete (PDFs fornecidos pelo usuário:
// SOJA, MILHO e ALGODÃO). Cada cultura é organizada por estágio
// fenológico (igual ao material oficial); os 3 níveis de investimento
// (Básico / Médio / Completo) são um agrupamento NOSSO desses mesmos
// estágios — não são 3 níveis definidos oficialmente pela Agrocete — pra
// dar um ponto de partida rápido em cotação. O nível "Completo" cobre
// exatamente o manejo integral do material oficial.
//
// Doses de tratamento de sementes (TS) variam conforme a taxa de
// semeadura da cultivar/densidade de plantio; aqui foi usada a dose de
// aplicação em SULCO (já em L/ha ou kg/ha no material oficial) quando
// disponível, por não depender dessa variável. Onde só havia faixa (ex:
// "0,4 a 1,2 L/ha"), foi usado o limite inferior — ajuste pra cima
// conforme a recomendação técnica de cada caso.
//
// Preços não estão incluídos (R$ 0 por padrão) — preencha antes de gerar
// uma cotação real. Revise sempre com a equipe técnica antes de cotar.

export const PRESET_SOURCE_NOTE =
  "Baseado no manejo oficial Agrocete 2024 (material interno). Preços não incluídos — adicione antes de cotar. Revise as doses de tratamento de sementes (TS) com a equipe técnica: elas dependem da taxa de semeadura.";

const P = {
  stPro: "agrocete__grap-st-pro",
  nodL: "agrocete__grap-nod-l",
  nodPhos: "agrocete__grap-nodphos",
  biostat: "agrocete__grap-biostat",
  beestric: "agrocete__grap-beestric",
  fieldPro: "agrocete__grap-field-pro",
  organoTop: "agrocete__grap-organo-top",
  amyno15: "agrocete__grap-amyno-15",
  grad: "agrocete__grap-grad",
  breedPro: "agrocete__grap-breed-pro",
  evicS: "agrocete__grap-evic-s",
  beessect: "agrocete__grap-beessect",
  superGun: "agrocete__grap-super-gun",
  dLim: "agrocete__grap-d-lim",
  extranod: "agrocete__grap-extranod",
  k30: "agrocete__grap-30k",
  al: "agrocete__grap-al", // GRAP Al + ("NOD AL+" nos materiais de Sorgo/Milho)
  nitro: "agrocete__grap-nitro",
  fluid104: "agrocete__grap-104-fluid",
};

export const MANAGEMENT_PRESETS = {
  Soja: {
    stages: [
      {
        key: "plantio",
        label: "Plantio (TS/Sulco)",
        items: [
          { productId: P.stPro, dose: 0.2, note: "Sulco: 200 mL/ha. TS: 2,0 mL/kg de semente." },
          { productId: P.nodL, dose: 2, note: "Sulco oficial: 2 a 10 doses/ha. TS: 2 doses/ha." },
          { productId: P.nodPhos, dose: 2, note: "Sulco oficial: 2 doses/ha. TS: 1 dose/ha." },
          { productId: P.biostat, dose: 0.125, note: "125 g/ha (sulco). TS: 1,0 g/kg de semente." },
          { productId: P.beestric, dose: 0.1, note: "100 g/ha (sulco). TS: 0,5 g/kg de semente." },
        ],
      },
      {
        key: "v3-v5",
        label: "V3–V5",
        items: [
          { productId: P.beestric, dose: 0.075, note: "Faixa oficial: 0,075 a 0,5 kg/ha." },
          { productId: P.fieldPro, dose: 0.2 },
          { productId: P.organoTop, dose: 1.0 },
          { productId: P.amyno15, dose: 1.0 },
          { productId: P.grad, dose: 0.25 },
          { productId: P.superGun, dose: 0.037, note: "Adjuvante — em todas as aplicações foliares (50 mL/100 L de água)." },
          { productId: P.dLim, dose: 0.1, note: "Adjuvante — em todas as aplicações foliares (50 mL/100 L de água)." },
        ],
      },
      {
        key: "r1-r3",
        label: "R1–R3",
        items: [
          { productId: P.breedPro, dose: 0.5 },
          { productId: P.organoTop, dose: 1.0 },
          { productId: P.evicS, dose: 1.5 },
          { productId: P.beessect, dose: 0.4, note: "Faixa oficial: 0,4 a 1,2 L/ha." },
          { productId: P.superGun, dose: 0.037, note: "Adjuvante — em todas as aplicações foliares (50 mL/100 L de água)." },
          { productId: P.dLim, dose: 0.1, note: "Adjuvante — em todas as aplicações foliares (50 mL/100 L de água)." },
        ],
      },
      {
        key: "r4-r5",
        label: "R4–R5",
        items: [
          { productId: P.breedPro, dose: 0.2 },
          { productId: P.evicS, dose: 1.5, note: "Faixa oficial: 1,5 a 2,0 L/ha." },
        ],
      },
    ],
    tiers: [
      { level: "Básico", stageKeys: ["plantio"] },
      { level: "Médio", stageKeys: ["plantio", "v3-v5"] },
      { level: "Completo", stageKeys: ["plantio", "v3-v5", "r1-r3", "r4-r5"] },
    ],
  },

  Milho: {
    stages: [
      {
        key: "plantio",
        label: "Plantio (TS/Sulco)",
        items: [
          { productId: P.stPro, dose: 0.2, note: "Sulco: 200 mL/ha. TS: 4 mL/kg de sementes." },
          { productId: P.nodPhos, dose: 0.2, note: "Sulco oficial: 200 a 400 mL/ha. TS: 100 a 200 mL/25 kg de sementes." },
          { productId: P.biostat, dose: 0.1, note: "Sulco oficial: 100 a 200 g/ha. TS: 100 a 125 g/100 kg de sementes." },
          { productId: P.beestric, dose: 0.1, note: "100 g/ha (sulco). TS: 40 a 60 g/100 kg de sementes." },
        ],
      },
      {
        key: "v3-v6",
        label: "V3–V5/V6",
        items: [
          { productId: P.organoTop, dose: 1.0 },
          { productId: P.amyno15, dose: 1.0 },
          { productId: P.evicS, dose: 2.0 },
          { productId: P.fieldPro, dose: 0.3 },
          { productId: P.superGun, dose: 0.037, note: "Adjuvante — em todas as aplicações foliares (50 mL/100 L de água)." },
          { productId: P.dLim, dose: 0.1, note: "Adjuvante — em todas as aplicações foliares (50 mL/100 L de água)." },
        ],
      },
      {
        key: "v7-vt",
        label: "V7–V10 / VT",
        items: [
          { productId: P.beessect, dose: 0.4, note: "Faixa oficial: 0,4 a 1,2 L/ha." },
          { productId: P.organoTop, dose: 1.0 },
          { productId: P.evicS, dose: 2.0 },
          { productId: P.breedPro, dose: 0.5 },
          { productId: P.superGun, dose: 0.037, note: "Adjuvante — em todas as aplicações foliares (50 mL/100 L de água)." },
          { productId: P.dLim, dose: 0.1, note: "Adjuvante — em todas as aplicações foliares (50 mL/100 L de água)." },
        ],
      },
    ],
    tiers: [
      { level: "Básico", stageKeys: ["plantio"] },
      { level: "Médio", stageKeys: ["plantio", "v3-v6"] },
      { level: "Completo", stageKeys: ["plantio", "v3-v6", "v7-vt"] },
    ],
  },

  Algodão: {
    stages: [
      {
        key: "ts",
        label: "TS",
        items: [
          { productId: P.stPro, dose: 0.3, note: "Sulco: 300 mL/ha. TS: 6,0 mL/kg de semente." },
          { productId: P.nodPhos, dose: 0.2, note: "Sulco: 200 mL/ha. TS: 2 doses." },
          { productId: P.extranod, dose: 0.033, note: "1 dose (33 mL) por dose de inoculante utilizada — ajustar conforme volume de inoculante." },
        ],
      },
      {
        key: "b1",
        label: "B1",
        items: [
          { productId: P.breedPro, dose: 0.5 },
          { productId: P.fieldPro, dose: 0.3 },
          { productId: P.amyno15, dose: 1.0 },
          { productId: P.organoTop, dose: 1.5 },
          { productId: P.superGun, dose: 0.037, note: "Adjuvante — em todas as aplicações foliares (50 mL/100 L de água)." },
          { productId: P.dLim, dose: 0.1, note: "Adjuvante — em todas as aplicações foliares (50 mL/100 L de água)." },
        ],
      },
      {
        key: "b6",
        label: "B6",
        items: [
          { productId: P.breedPro, dose: 0.5 },
          { productId: P.fieldPro, dose: 0.3 },
          { productId: P.amyno15, dose: 1.0 },
          { productId: P.organoTop, dose: 1.5 },
          { productId: P.superGun, dose: 0.037, note: "Adjuvante — em todas as aplicações foliares (50 mL/100 L de água)." },
          { productId: P.dLim, dose: 0.1, note: "Adjuvante — em todas as aplicações foliares (50 mL/100 L de água)." },
        ],
      },
      {
        key: "f2",
        label: "F2",
        items: [
          { productId: P.breedPro, dose: 0.5 },
          { productId: P.fieldPro, dose: 0.3 },
          { productId: P.amyno15, dose: 1.0 },
          { productId: P.organoTop, dose: 1.5 },
          { productId: P.superGun, dose: 0.037, note: "Adjuvante — em todas as aplicações foliares (50 mL/100 L de água)." },
          { productId: P.dLim, dose: 0.1, note: "Adjuvante — em todas as aplicações foliares (50 mL/100 L de água)." },
        ],
      },
      {
        key: "f6",
        label: "F6",
        items: [
          { productId: P.breedPro, dose: 0.5 },
          { productId: P.fieldPro, dose: 0.3 },
          { productId: P.amyno15, dose: 1.0 },
          { productId: P.organoTop, dose: 1.5 },
          { productId: P.superGun, dose: 0.037, note: "Adjuvante — em todas as aplicações foliares (50 mL/100 L de água)." },
          { productId: P.dLim, dose: 0.1, note: "Adjuvante — em todas as aplicações foliares (50 mL/100 L de água)." },
        ],
      },
      {
        key: "c1",
        label: "C1",
        items: [
          { productId: P.evicS, dose: 1.0 },
          { productId: P.k30, dose: 3.0 },
        ],
      },
    ],
    tiers: [
      { level: "Básico", stageKeys: ["ts", "b1"] },
      { level: "Médio", stageKeys: ["ts", "b1", "f2", "c1"] },
      { level: "Completo", stageKeys: ["ts", "b1", "b6", "f2", "f6", "c1"] },
    ],
  },

  // SORGO — do material oficial "POSICIONAMENTO SORGO" (PDF enviado pelo
  // usuário, página 1). Cultura nova no app.
  Sorgo: {
    source: "POSICIONAMENTO SORGO — material oficial Agrocete (PDF enviado pelo usuário).",
    stages: [
      {
        key: "plantio",
        label: "Plantio (TS/Sulco)",
        items: [
          { productId: P.stPro, dose: 0.4, note: "Sulco: 400 mL/ha. TS: 4 mL/kg de semente." },
          { productId: P.al, dose: 2, note: "NOD AL+ — Sulco: 2 a 4 doses. TS: 1 a 2 dose." },
          { productId: P.nodPhos, dose: 0.2, note: "Sulco: 200 mL/ha. TS: 2 mL/kg de semente." },
          { productId: P.extranod, dose: 0.033, note: "1 dose por dose de inoculante utilizada." },
        ],
      },
      {
        key: "v3-v4",
        label: "V3–V4",
        items: [
          { productId: P.amyno15, dose: 1.0 },
          { productId: P.superGun, dose: 0.037, note: "Adjuvante — em todas as aplicações foliares (50 mL/100 L de água)." },
          { productId: P.dLim, dose: 0.1, note: "Adjuvante — em todas as aplicações foliares (50 mL/100 L de água)." },
        ],
      },
      {
        key: "emborrachamento",
        label: "Emborrachamento (VT)",
        items: [
          { productId: P.organoTop, dose: 2.0 },
          { productId: P.superGun, dose: 0.037, note: "Adjuvante — em todas as aplicações foliares (50 mL/100 L de água)." },
          { productId: P.dLim, dose: 0.1, note: "Adjuvante — em todas as aplicações foliares (50 mL/100 L de água)." },
        ],
      },
      {
        key: "florescimento",
        label: "Florescimento (R1)",
        items: [
          { productId: P.k30, dose: 2.0 },
          { productId: P.nitro, dose: 2.0 },
          { productId: P.superGun, dose: 0.037, note: "Adjuvante — em todas as aplicações foliares (50 mL/100 L de água)." },
          { productId: P.dLim, dose: 0.1, note: "Adjuvante — em todas as aplicações foliares (50 mL/100 L de água)." },
        ],
      },
      {
        key: "enchimento",
        label: "Enchimento (grão leitoso)",
        items: [
          { productId: P.k30, dose: 2.0 },
          { productId: P.nitro, dose: 2.0 },
          { productId: P.superGun, dose: 0.037, note: "Adjuvante — em todas as aplicações foliares (50 mL/100 L de água)." },
          { productId: P.dLim, dose: 0.1, note: "Adjuvante — em todas as aplicações foliares (50 mL/100 L de água)." },
        ],
      },
      {
        key: "evic-inseticida",
        label: "Junto com inseticidas",
        items: [{ productId: P.evicS, dose: 1.0, note: "EVIC-S + inseticidas: 1 L/ha." }],
      },
    ],
    tiers: [
      { level: "Básico", stageKeys: ["plantio", "v3-v4"] },
      { level: "Médio", stageKeys: ["plantio", "v3-v4", "emborrachamento", "florescimento"] },
      { level: "Completo", stageKeys: ["plantio", "v3-v4", "emborrachamento", "florescimento", "enchimento", "evic-inseticida"] },
    ],
  },

  // MILHO (posicionamento 2024) — página 2 do mesmo PDF "POSICIONAMENTO
  // SORGO". Difere do manejo "Milho" já cadastrado (que veio do material
  // MILHO Manejo Atualizado 2024): este posiciona Nitro + Grap 104 Fluid em
  // V3–V4 e V7–V10. Os dois foram mantidos, cada um com sua fonte, para a
  // equipe decidir qual usar — não dá pra saber qual é o mais recente só
  // pelos arquivos.
  "Milho (posicionamento 2024)": {
    source: "POSICIONAMENTO SORGO, página 2 (MILHO) — material oficial Agrocete (PDF enviado pelo usuário).",
    stages: [
      {
        key: "plantio",
        label: "Plantio (TS/Sulco)",
        items: [
          { productId: P.stPro, dose: 0.2, note: "Sulco: 200 mL/ha. TS: 4 mL/kg de semente." },
          { productId: P.al, dose: 2, note: "NOD AL+ — Sulco: 2 a 4 doses. TS: 1 a 2 dose." },
          { productId: P.nodPhos, dose: 0.2, note: "Sulco: 200 mL/ha. TS: 2 mL/kg de semente." },
          { productId: P.extranod, dose: 0.033, note: "1 dose por dose de inoculante utilizada." },
        ],
      },
      {
        key: "v3-v4",
        label: "V3–V4",
        items: [
          { productId: P.nitro, dose: 2.0 },
          { productId: P.amyno15, dose: 1.0 },
          { productId: P.fluid104, dose: 0.3 },
          { productId: P.superGun, dose: 0.037, note: "Adjuvante — em todas as aplicações foliares (50 mL/100 L de água)." },
          { productId: P.dLim, dose: 0.1, note: "Adjuvante — em todas as aplicações foliares (50 mL/100 L de água)." },
        ],
      },
      {
        key: "v7-v10",
        label: "V7–V10",
        items: [
          { productId: P.k30, dose: 2.0 },
          { productId: P.nitro, dose: 2.0 },
          { productId: P.amyno15, dose: 1.0 },
          { productId: P.fluid104, dose: 0.3 },
          { productId: P.superGun, dose: 0.037, note: "Adjuvante — em todas as aplicações foliares (50 mL/100 L de água)." },
          { productId: P.dLim, dose: 0.1, note: "Adjuvante — em todas as aplicações foliares (50 mL/100 L de água)." },
        ],
      },
      {
        key: "vt",
        label: "VT",
        items: [
          { productId: P.organoTop, dose: 2.0 },
          { productId: P.k30, dose: 2.0 },
          { productId: P.superGun, dose: 0.037, note: "Adjuvante — em todas as aplicações foliares (50 mL/100 L de água)." },
          { productId: P.dLim, dose: 0.1, note: "Adjuvante — em todas as aplicações foliares (50 mL/100 L de água)." },
        ],
      },
      {
        key: "evic-inseticida",
        label: "Junto com inseticidas",
        items: [{ productId: P.evicS, dose: 1.0, note: "EVIC-S + inseticidas: 1 L/ha." }],
      },
    ],
    tiers: [
      { level: "Básico", stageKeys: ["plantio", "v3-v4"] },
      { level: "Médio", stageKeys: ["plantio", "v3-v4", "v7-v10"] },
      { level: "Completo", stageKeys: ["plantio", "v3-v4", "v7-v10", "vt", "evic-inseticida"] },
    ],
  },
};

// Monta a seleção (soma dose por produto entre os estágios do nível
// escolhido — um produto usado em 2 estágios incluídos entra com a dose
// total da safra) e a lista de notas de dose pra exibir junto.
export function buildPresetSelection(crop, level) {
  const cropData = MANAGEMENT_PRESETS[crop];
  const tier = cropData?.tiers.find((t) => t.level === level);
  if (!cropData || !tier) return { selection: {}, notes: [] };

  const selection = {};
  const notes = [];
  const stagesByKey = new Map(cropData.stages.map((s) => [s.key, s]));

  tier.stageKeys.forEach((key) => {
    const stage = stagesByKey.get(key);
    if (!stage) return;
    stage.items.forEach((item) => {
      const prev = selection[item.productId];
      selection[item.productId] = {
        dose: prev ? Math.round((prev.dose + item.dose) * 1000) / 1000 : item.dose,
        price: prev?.price ?? 0,
      };
      if (item.note) notes.push({ productId: item.productId, stage: stage.label, note: item.note });
    });
  });

  return { selection, notes };
}
