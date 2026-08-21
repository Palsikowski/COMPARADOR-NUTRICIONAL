// Sais e matérias-primas — solubilidade e garantia declarada.
//
// ORIGEM: aba "Sais e Materias Primas" da planilha NITRO_Garantias_Comparador
// (enviada pelo usuário), transcrita do Guia Técnico de Soluções — Nutrição e
// Fisiologia, Nitro, Fev 2024 (V6).
//
// São **matérias-primas**, não produtos comerciais: por isso ficam fora do
// catálogo (`products.js`) e não entram em comparativo, custo/ha nem NCI. A
// tabela existe como referência de consulta — o que cada sal carrega de
// nutriente e quanto dele o material declara dissolver por litro de água.
//
// A solubilidade é o número que o guia publica, sem temperatura informada. Não
// dá para tratá-lo como limite de calda: a solubilidade real muda com
// temperatura, pH e com o que mais já está no tanque.
//
// Convenção de símbolo: o guia escreve "P" e "K2O"; o catálogo trabalha com
// P2O5/K2O (convenção de rótulo no Brasil), a mesma leitura já usada nos
// materiais ICL e Gran7. `key` traz a chave do catálogo e `label` o símbolo
// como o guia escreve, para a divergência ficar visível em vez de sumir.

export const RAW_MATERIALS_SOURCE = {
  title: "Guia Técnico de Soluções — Nutrição e Fisiologia",
  publisher: "Nitro",
  date: "Fev 2024 (V6)",
  note:
    "Transcrito da planilha enviada pela equipe. Referência de matéria-prima — não é produto do catálogo, não entra em nenhum cálculo da plataforma e a solubilidade vem sem temperatura de referência.",
};

// solubility: g/L, como o guia publica. guarantees: %m/m declarado.
export const RAW_MATERIALS = [
  {
    name: "MAP Purificado",
    solubility: 280,
    guarantees: [
      { key: "P2O5", label: "P", percent: 60 },
      { key: "N", percent: 11 },
    ],
  },
  {
    name: "Sulfato de Magnésio (mono hidratado)",
    solubility: 357,
    guarantees: [
      { key: "Mg", percent: 16 },
      { key: "S", percent: 21 },
    ],
  },
  {
    name: "Sulfato de Zinco (mono hidratado)",
    solubility: 300,
    guarantees: [
      { key: "Zn", percent: 35 },
      { key: "S", percent: 17 },
    ],
  },
  {
    name: "Sulfato de Cobre (penta hidratado)",
    solubility: 220,
    guarantees: [
      { key: "Cu", percent: 25 },
      { key: "S", percent: 11 },
    ],
  },
  {
    name: "Burak — Ácido Bórico",
    solubility: 47,
    guarantees: [
      { key: "B", percent: 17 },
      { key: "K2O", percent: 1 },
    ],
  },
  {
    name: "Octaborato de Sódio (tetra hidratado)",
    solubility: 100,
    guarantees: [{ key: "B", percent: 21 }],
  },
  {
    name: "Molibdato de Sódio (di hidratado)",
    solubility: 600,
    guarantees: [{ key: "Mo", percent: 39 }],
  },
  {
    name: "Sulfato de Manganês (mono-hidratado)",
    solubility: 420,
    guarantees: [
      { key: "Mn", percent: 31 },
      { key: "S", percent: 18 },
    ],
  },
];
