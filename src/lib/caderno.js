// "Caderno de manejo": documento em PDF para apresentar ao cliente, com
// capa, uma seção por etapa e a descrição de cada produto (composição,
// garantias, observações e alertas do cadastro).
//
// Tudo vem do catálogo — nada de texto comercial inventado. Produto sem
// descrição cadastrada aparece dizendo isso, em vez de ganhar um texto
// genérico bonito.

import { PRODUCTS_BY_ID } from "./catalog.js";
import { provenanceOf } from "./provenance.js";
import { concentrationUnit, doseUnit, fmtNum, fmtBRL, costPerHectare } from "./economics.js";

const NUTRIENT_LABEL = {
  N: "Nitrogênio",
  P2O5: "Fósforo (P2O5)",
  K2O: "Potássio (K2O)",
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

// A fonte padrão do jsPDF (WinAnsi) não tem travessão, aspas curvas nem
// alguns símbolos — sem isso "V3–V4" sai como "V3V4" no PDF. Troca por
// equivalentes que existem na fonte.
function pdfSafe(s) {
  return (s || "")
    .toString()
    .replace(/[–—−]/g, "-")
    .replace(/[“”„]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/…/g, "...")
    .replace(/≠/g, "!=")
    .replace(/≈/g, "~")
    .replace(/[▲△]/g, "^")
    .replace(/[▼▽]/g, "v");
}

export async function exportCaderno(mng, { client = "", area = 1, prices = {} } = {}) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  const W = 210;
  const M = 16;
  const maxW = W - M * 2;
  let y = 0;

  function ensure(space) {
    if (y + space > 280) {
      doc.addPage();
      y = 20;
      return true;
    }
    return false;
  }

  function heading(text, size = 13) {
    ensure(14);
    doc.setFont(undefined, "bold");
    doc.setFontSize(size);
    doc.text(pdfSafe(text), M, y);
    doc.setFont(undefined, "normal");
    y += size * 0.55 + 3;
  }

  function para(text, size = 9.5, color = 90) {
    doc.setFontSize(size);
    doc.setTextColor(color);
    const lines = doc.splitTextToSize(pdfSafe(text), maxW);
    lines.forEach((ln) => {
      ensure(6);
      doc.text(ln, M, y);
      y += size * 0.52;
    });
    doc.setTextColor(0);
    y += 2;
  }

  // ---- CAPA ----
  doc.setFillColor(5, 150, 105);
  doc.rect(0, 0, W, 46, "F");
  doc.setTextColor(255);
  doc.setFont(undefined, "bold");
  doc.setFontSize(20);
  doc.text("Caderno de manejo", M, 24);
  doc.setFontSize(11);
  doc.setFont(undefined, "normal");
  doc.text(pdfSafe(mng.name), M, 34);
  doc.setTextColor(0);
  y = 60;

  if (client.trim()) {
    doc.setFontSize(13);
    doc.setFont(undefined, "bold");
    doc.text(pdfSafe(client.trim()), M, y);
    doc.setFont(undefined, "normal");
    y += 8;
  }
  para(`Gerado em ${new Date().toLocaleDateString("pt-BR")} · Área de referência: ${fmtNum(area, 0)} ha`);
  if (mng.source) para(`Fonte: ${mng.source}`);

  const totals = {};
  mng.stages.forEach((s) =>
    s.items.forEach((i) => {
      totals[i.productId] = (totals[i.productId] || 0) + (Number(i.dose) || 0);
    })
  );
  const productIds = Object.keys(totals);

  para(
    `${mng.stages.length} etapa(s) · ${productIds.length} produto(s) no manejo. As doses são as do material de referência; confirme sempre com a bula e com a equipe técnica antes de aplicar.`
  );

  // ---- CUSTO (só quando há preço informado) ----
  const priced = productIds.filter((id) => Number(prices[id]) > 0);
  if (priced.length > 0) {
    y += 4;
    heading("Custo do manejo", 12);
    let totalHa = 0;
    priced.forEach((id) => {
      totalHa += costPerHectare({ dose: totals[id], price: prices[id] });
    });
    para(
      `Custo por hectare (considerando ${priced.length} de ${productIds.length} produtos com preço informado): ${fmtBRL(totalHa)}/ha. Para ${fmtNum(area, 0)} ha: ${fmtBRL(totalHa * area)}.`
    );
    if (priced.length < productIds.length) {
      para(
        `Atenção: ${productIds.length - priced.length} produto(s) sem preço informado não entraram nessa conta.`,
        9,
        150
      );
    }
  }

  // ---- ETAPAS ----
  mng.stages.forEach((stage, idx) => {
    ensure(30);
    y += 6;
    doc.setFillColor(236, 253, 245);
    doc.rect(M - 3, y - 5, maxW + 6, 10, "F");
    doc.setFont(undefined, "bold");
    doc.setFontSize(12);
    doc.setTextColor(4, 120, 87);
    doc.text(pdfSafe(`${idx + 1}. ${stage.label}`), M, y + 2);
    doc.setTextColor(0);
    doc.setFont(undefined, "normal");
    y += 12;

    if (stage.items.length === 0) {
      para("Nenhum produto nesta etapa.", 9, 150);
      return;
    }

    stage.items.forEach((item) => {
      const p = PRODUCTS_BY_ID.get(item.productId);
      if (!p) return;
      ensure(26);

      doc.setFont(undefined, "bold");
      doc.setFontSize(10.5);
      doc.text(pdfSafe(p.name), M, y);
      doc.setFont(undefined, "normal");

      const dose = `${fmtNum(item.dose)} ${doseUnit(p)}/ha`;
      doc.setFontSize(10);
      doc.text(dose, W - M, y, { align: "right" });
      y += 5;

      doc.setFontSize(8.5);
      doc.setTextColor(120);
      doc.text(pdfSafe(`${p.brand}${p.category ? ` · ${p.category}` : ""} · ${provenanceOf(p).label}`), M, y);
      doc.setTextColor(0);
      y += 5;

      // Garantias (o "o que esse produto entrega")
      const nutrients = Object.entries(p.nutrients || {}).filter(([, v]) => Number(v) > 0);
      if (nutrients.length > 0) {
        const unit = concentrationUnit(p);
        const txt = nutrients
          .sort((a, b) => b[1] - a[1])
          .map(([k, v]) => `${NUTRIENT_LABEL[k] || k} ${fmtNum(v)} ${unit}`)
          .join(" · ");
        para(txt, 8.5, 60);
      } else if (p.composition) {
        para(p.composition, 8.5, 60);
      } else {
        para("Sem composição nutricional cadastrada.", 8.5, 150);
      }

      if (item.note) para(`Dose: ${item.note}`, 8.5, 90);
      if (p.observations) para(p.observations, 8.5, 90);
      if (p.warning) para(`Atenção: ${p.warning}`, 8.5, 160);

      y += 2;
    });
  });

  // ---- RESUMO POR PRODUTO ----
  ensure(40);
  y += 8;
  heading("Resumo — total por produto na safra", 12);
  para("Soma das doses de cada produto entre todas as etapas deste manejo.", 8.5, 120);
  productIds.forEach((id) => {
    const p = PRODUCTS_BY_ID.get(id);
    if (!p) return;
    ensure(6);
    doc.setFontSize(9.5);
    doc.text(pdfSafe(p.name), M, y);
    doc.text(`${fmtNum(totals[id])} ${doseUnit(p)}/ha`, W - M, y, { align: "right" });
    y += 5;
  });

  ensure(20);
  y += 6;
  para(
    "Documento gerado pelo Comparador Nutricional a partir do catálogo interno. As doses e observações vêm do material de referência indicado na capa; não substituem a bula nem a recomendação da equipe técnica.",
    8,
    140
  );

  const slug = (client.trim() || mng.name)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 40);
  doc.save(`caderno-manejo-${slug || "agrocete"}.pdf`);
}
