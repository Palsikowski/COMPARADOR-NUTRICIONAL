// Interações entre nutrientes — sinergias e antagonismos.
//
// ORIGEM: material de Daniele Lorenzon (@daniglorenzon), publicado em
// 28/07/2026, transcrito das quatro tabelas do carrossel. É **referência geral
// de fisiologia e química de solo**, não avaliação de nenhum produto e não
// medição feita pela Agrocete. A plataforma usa isso para cruzar com a
// composição declarada de cada produto e apontar quais pares aparecem juntos —
// o que continua sendo uma leitura de fisiologia, não uma recomendação de
// mistura nem previsão de resultado em campo.
//
// Nada aqui entra em cálculo: não altera NCI, custo, dose nem comparativo. É
// informação de leitura, e a tela diz de onde veio.
//
// Convenção de símbolo: a tabela de origem usa "P" e "K" (elemento); o catálogo
// usa P2O5 e K2O (óxido, convenção de rótulo). O campo `keys` traz as chaves do
// catálogo para o cruzamento; `a`/`b` guardam o símbolo como o material escreve.

export const INTERACTION_KINDS = {
  SINERGICA: { id: "sinergica", label: "Sinérgica", tone: "ok", help: "Um favorece a absorção, o transporte ou o uso do outro." },
  ANTAGONICA: { id: "antagonica", label: "Antagônica", tone: "warn", help: "Um pode reduzir a absorção ou a disponibilidade do outro." },
  COMPLEXA: { id: "complexa", label: "Complexa / depende da condição", tone: "info", help: "O efeito muda conforme pH, teor no solo ou estado nutricional da planta." },
};

export const INTERACTION_SOURCE = {
  author: "Daniele Lorenzon (@daniglorenzon)",
  date: "28/07/2026",
  note:
    "Transcrito das tabelas do material publicado pela autora. Referência geral de fisiologia — não é avaliação de produto, medição da Agrocete nem recomendação de mistura em calda.",
};

// `a`/`b`: símbolo como no material. `keys`: como o catálogo nomeia, para o
// cruzamento com a composição declarada.
export const NUTRIENT_INTERACTIONS = [
  // ---- tabela 2/6 ----
  { a: "N", b: "P", keys: ["N", "P2O5"], kind: "SINERGICA", tipo: "Sinérgica / regulatória", efeito: "O N adequado favorece crescimento radicular, metabolismo e aquisição de P; P também influencia assimilação e utilização de N.", onde: "Absorção + metabolismo + sinalização" },
  { a: "N", b: "S", keys: ["N", "S"], kind: "SINERGICA", tipo: "Sinérgica", efeito: "N e S são necessários conjuntamente para síntese de proteínas.", onde: "Metabolismo + assimilação" },
  { a: "N", b: "K", keys: ["N", "K2O"], kind: "SINERGICA", tipo: "Sinérgica", efeito: "Adequado suprimento de K favorece utilização do N.", onde: "Absorção + metabolismo" },
  { a: "N", b: "Zn", keys: ["N", "Zn"], kind: "SINERGICA", tipo: "Sinérgica / regulatória", efeito: "O estado de N pode alterar aquisição e metabolismo de Zn.", onde: "Absorção + metabolismo" },
  { a: "P", b: "Zn", keys: ["P2O5", "Zn"], kind: "ANTAGONICA", tipo: "Antagônica", efeito: "Alta disponibilidade de P pode reduzir concentração e utilização de Zn.", onde: "Solo + absorção + translocação" },

  // ---- tabela 3/6 ----
  { a: "P", b: "Fe", keys: ["P2O5", "Fe"], kind: "ANTAGONICA", tipo: "Antagônica / complexa", efeito: "Fe pode reduzir disponibilidade de P por adsorção/precipitação; P elevado pode interferir na aquisição e distribuição de Fe.", onde: "Solo + absorção + planta" },
  { a: "P", b: "Ca", keys: ["P2O5", "Ca"], kind: "COMPLEXA", tipo: "Dependente do pH", efeito: "Em condições favoráveis, Ca pode formar compostos de P de menor solubilidade.", onde: "Principalmente solo" },
  { a: "P", b: "Al", keys: ["P2O5", "Al"], kind: "ANTAGONICA", tipo: "Antagônica no solo", efeito: "Em solos ácidos, Al pode adsorver ou precipitar P.", onde: "Solo" },
  { a: "P", b: "Mg", keys: ["P2O5", "Mg"], kind: "SINERGICA", tipo: "Complementar / metabólica", efeito: "Mg é essencial para a estabilização e utilização de ATP.", onde: "Metabolismo" },
  { a: "K", b: "Ca", keys: ["K2O", "Ca"], kind: "ANTAGONICA", tipo: "Antagônica / competição", efeito: "Altas concentrações de K podem reduzir a absorção de Ca em determinadas condições.", onde: "Absorção" },

  // ---- tabela 4/6 ----
  { a: "Ca", b: "Mg", keys: ["Ca", "Mg"], kind: "ANTAGONICA", tipo: "Antagônica / competição", efeito: "Ca²⁺ e Mg²⁺ podem competir por sítios de troca no solo e por processos de absorção radicular.", onde: "Solo + absorção" },
  { a: "Mg", b: "K", keys: ["Mg", "K2O"], kind: "ANTAGONICA", tipo: "Antagônica / competição", efeito: "Elevada disponibilidade de K pode reduzir aquisição de Mg.", onde: "Absorção" },
  { a: "S", b: "Fe", keys: ["S", "Fe"], kind: "COMPLEXA", tipo: "Interação complexa", efeito: "S participa da formação de compostos Fe-S e influencia aquisição, transporte e homeostase de Fe.", onde: "Absorção + metabolismo + sinalização" },
  { a: "S", b: "P", keys: ["S", "P2O5"], kind: "COMPLEXA", tipo: "Interação regulatória", efeito: "Vias de sinalização e respostas à deficiência de P e S apresentam comunicação metabólica.", onde: "Sinalização + metabolismo" },

  // ---- tabela 5/6 ----
  { a: "Fe", b: "Zn", keys: ["Fe", "Zn"], kind: "ANTAGONICA", tipo: "Antagônica / competição", efeito: "Alterações na disponibilidade de um podem modificar absorção.", onde: "Absorção + homeostase" },
  { a: "Fe", b: "Cu", keys: ["Fe", "Cu"], kind: "ANTAGONICA", tipo: "Antagônica / regulatória", efeito: "Cu e Fe apresentam interação na absorção, transporte e distribuição.", onde: "Absorção + transporte" },
  { a: "Fe", b: "Mn", keys: ["Fe", "Mn"], kind: "ANTAGONICA", tipo: "Antagônica / competição", efeito: "Excesso de Mn pode interferir na aquisição de Fe.", onde: "Solo + absorção" },
  { a: "Zn", b: "Cu", keys: ["Zn", "Cu"], kind: "ANTAGONICA", tipo: "Antagônica / competição", efeito: "Concentrações elevadas de um podem interferir na absorção.", onde: "Absorção + planta" },
  { a: "Mo", b: "N", keys: ["Mo", "N"], kind: "SINERGICA", tipo: "Sinérgica / funcional", efeito: "Fundamental para fixação biológica e assimilação de N.", onde: "Metabolismo" },
  { a: "B", b: "Ca", keys: ["B", "Ca"], kind: "SINERGICA", tipo: "Sinérgica / estrutural", efeito: "Ambos estão relacionados à integridade e desenvolvimento de tecidos.", onde: "Parede celular + crescimento" },
  { a: "Cl", b: "K", keys: ["Cl", "K2O"], kind: "SINERGICA", tipo: "Funcional / osmótica", efeito: "Cl participa do balanço osmótico e elétrico, interagindo com K no controle hídrico e estomático.", onde: "Planta" },
];

function present(product) {
  const set = new Set();
  const add = (obj) =>
    Object.entries(obj || {}).forEach(([k, v]) => {
      if (Number(v) > 0) set.add(k);
    });
  add(product?.nutrients);
  add(product?.nutrientsPercent);
  return set;
}

/**
 * Interações entre os nutrientes que ESTE produto declara.
 *
 * Só entra o par cujos dois lados estão na composição — nada de listar
 * antagonismo com nutriente que o produto não tem, que seria alarme falso.
 * Al fica de fora na prática: nenhum produto do catálogo declara alumínio, ele
 * existe na tabela por ser fator de solo.
 */
export function interactionsWithin(product) {
  const has = present(product);
  return NUTRIENT_INTERACTIONS.filter(({ keys }) => keys.every((k) => has.has(k)));
}

/**
 * Interações entre produtos DIFERENTES: o par em que cada lado vem de um
 * produto distinto da seleção. É o caso que interessa na hora de montar calda
 * ou comparar dois produtos que seriam usados juntos.
 *
 * Pares que já aparecem dentro de um mesmo produto ficam de fora daqui — eles
 * são mostrados na ficha do próprio produto, e repetir viraria ruído.
 */
export function interactionsBetween(products) {
  if (!products || products.length < 2) return [];
  const sets = products.map((p) => ({ product: p, has: present(p) }));
  const dentroDeUm = new Set(
    sets.flatMap(({ product }) => interactionsWithin(product).map((i) => i.keys.join("|")))
  );

  const out = [];
  for (const inter of NUTRIENT_INTERACTIONS) {
    if (dentroDeUm.has(inter.keys.join("|"))) continue;
    const [k1, k2] = inter.keys;
    const de = sets.filter((s) => s.has.has(k1));
    const para = sets.filter((s) => s.has.has(k2));
    // precisa haver dois produtos DIFERENTES cobrindo os dois lados
    const par = de.flatMap((x) => para.filter((y) => y.product.id !== x.product.id).map((y) => [x.product, y.product]))[0];
    if (par) out.push({ ...inter, from: par[0], to: par[1] });
  }
  return out;
}

export function kindOf(inter) {
  return INTERACTION_KINDS[inter.kind] || INTERACTION_KINDS.COMPLEXA;
}
