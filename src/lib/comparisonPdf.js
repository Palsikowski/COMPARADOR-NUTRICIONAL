// PDF do comparativo por empresa — o material que a equipe leva para a reunião.
//
// O gráfico é redesenhado aqui em jsPDF em vez de virar imagem da tela: assim o
// PDF sai vetorial (não borra ao ampliar nem ao imprimir) e não depende do tema
// que estava aberto no navegador. As cores são as da paleta clara, porque papel
// é sempre claro.
//
// Regra que vale igual à da tela: nutriente não declarado sai como traço, nunca
// como zero, e produto sem composição não vira barra — sai listado à parte.

import { fmtNum } from "./economics.js";
import { provenanceOf } from "./provenance.js";
import { nutrientLabel } from "./nutrientLabels.js";

// A fonte padrão do jsPDF (WinAnsi) não tem travessão nem aspas curvas.
function pdfSafe(s) {
  return (s || "")
    .toString()
    .replace(/[–—−]/g, "-")
    .replace(/[“”„]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/…/g, "...")
    .replace(/₂/g, "2")
    .replace(/₅/g, "5")
    .replace(/≠/g, "!=");
}

const HEX = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

export async function exportComparison({ brand, products, panels, withoutData = [], note = "", colors }) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  const W = 210;
  const M = 16;
  const maxW = W - M * 2;
  let y = 0;

  function ensure(space) {
    if (y + space > 278) {
      doc.addPage();
      y = 20;
      return true;
    }
    return false;
  }

  function para(text, size = 9.5, color = 90) {
    doc.setFontSize(size);
    doc.setTextColor(color);
    doc.splitTextToSize(pdfSafe(text), maxW).forEach((ln) => {
      ensure(6);
      doc.text(ln, M, y);
      y += size * 0.52;
    });
    doc.setTextColor(0);
    y += 2;
  }

  // ---- CAPA ----
  doc.setFillColor(5, 150, 105);
  doc.rect(0, 0, W, 42, "F");
  doc.setTextColor(255);
  doc.setFont(undefined, "bold");
  doc.setFontSize(19);
  doc.text(pdfSafe(brand), M, 22);
  doc.setFont(undefined, "normal");
  doc.setFontSize(11);
  doc.text("Comparativo de composição declarada", M, 32);
  doc.setTextColor(0);
  y = 56;

  para(
    `Gerado em ${new Date().toLocaleDateString("pt-BR")} · ${products.length} produto(s) selecionado(s) no Comparador Nutricional.`
  );

  if (note.trim()) {
    y += 2;
    doc.setFont(undefined, "bold");
    doc.setFontSize(10);
    doc.text("Observação da equipe", M, y);
    doc.setFont(undefined, "normal");
    y += 5;
    para(note.trim(), 9.5, 60);
  }

  // ---- UM BLOCO POR UNIDADE ----
  panels.forEach((panel, pi) => {
    ensure(40);
    y += 6;
    doc.setFont(undefined, "bold");
    doc.setFontSize(12);
    doc.text(pdfSafe(panels.length > 1 ? `Produtos em ${panel.unit}` : "Composição declarada"), M, y);
    doc.setFont(undefined, "normal");
    y += 6;
    para(`Concentração em ${panel.unit}. Traço (-) = nutriente não declarado, que é diferente de zero.`, 8.5, 130);

    // Legenda: identidade nunca fica só na cor, nem no papel.
    panel.products.forEach((p, i) => {
      ensure(7);
      const [r, g, b] = HEX(colors[i % colors.length]);
      doc.setFillColor(r, g, b);
      doc.rect(M, y - 3, 3.5, 3.5, "F");
      doc.setFontSize(9);
      doc.text(pdfSafe(p.name), M + 6, y);
      doc.setTextColor(130);
      doc.setFontSize(8);
      doc.text(pdfSafe(provenanceOf(p).label), W - M, y, { align: "right" });
      doc.setTextColor(0);
      y += 5.5;
    });
    y += 3;

    // Se o gráfico virar a página, a legenda fica na folha anterior e as barras
    // ficam sem dono. Uma faixa compacta de cor + nome resolve, na largura toda.
    function legendStrip() {
      doc.setFontSize(7.5);
      let x = M;
      panel.products.forEach((p, i) => {
        const [r, g, b] = HEX(colors[i % colors.length]);
        doc.setFillColor(r, g, b);
        doc.rect(x, y - 2.6, 3, 3, "F");
        doc.setTextColor(110);
        doc.text(pdfSafe(p.name), x + 4.5, y);
        x += 4.5 + doc.getTextWidth(pdfSafe(p.name)) + 6;
      });
      doc.setTextColor(0);
      y += 6;
    }

    // Gráfico: barra por produto dentro de cada nutriente.
    const labelW = 34;
    const valueW = 20;
    const plotW = maxW - labelW - valueW;
    const barH = 3.6;
    const rowH = 4.6;

    panel.nutrients.forEach((nut) => {
      const blockH = panel.products.length * rowH + 4;
      if (ensure(blockH + 2)) legendStrip();
      const top = y;
      doc.setFontSize(8);
      doc.setTextColor(70);
      doc.text(pdfSafe(nutrientLabel(nut)), M + labelW - 4, top + (panel.products.length * rowH) / 2 + 1, {
        align: "right",
        maxWidth: labelW - 5,
      });
      doc.setTextColor(0);

      panel.products.forEach((p, i) => {
        const v = Number(p.nutrients?.[nut]) || 0;
        const w = panel.max > 0 ? (v / panel.max) * plotW : 0;
        const by = top + i * rowH;
        if (v > 0) {
          const [r, g, b] = HEX(colors[i % colors.length]);
          doc.setFillColor(r, g, b);
          doc.roundedRect(M + labelW, by, Math.max(w, 0.8), barH, 0.8, 0.8, "F");
        }
        doc.setFontSize(7.5);
        doc.setTextColor(v > 0 ? 70 : 160);
        doc.text(v > 0 ? fmtNum(v) : "-", M + labelW + Math.max(w, 0.8) + 2, by + barH - 0.6);
        doc.setTextColor(0);
      });

      y = top + blockH;
      doc.setDrawColor(228, 231, 235);
      doc.line(M + labelW, y - 2, W - M, y - 2);
    });

    if (pi === panels.length - 1) y += 2;
  });

  if (panels.length > 1) {
    ensure(18);
    y += 4;
    para(
      "Atenção: a seleção mistura líquidos (g/L) e sólidos (g/kg). São dois gráficos porque as unidades não dividem a mesma escala - comparar as alturas entre um gráfico e o outro não significa nada.",
      8.5,
      150
    );
  }

  // ---- TABELA (o mesmo dado em número) ----
  panels.forEach((panel) => {
    ensure(30);
    y += 6;
    doc.setFont(undefined, "bold");
    doc.setFontSize(11);
    doc.text(pdfSafe(`Tabela - ${panel.unit}`), M, y);
    doc.setFont(undefined, "normal");
    y += 6;

    const colW = (maxW - 40) / panel.products.length;

    // Cabeçalho desenhado por função porque precisa ser repetido quando a
    // tabela vira a página: sem isso a última linha cai sozinha na folha
    // seguinte e ninguém sabe de que produto é cada coluna.
    function tableHead() {
      doc.setFontSize(7.5);
      doc.setTextColor(120);
      panel.products.forEach((p, i) => {
        doc.text(pdfSafe(p.name), M + 40 + colW * i + colW - 1, y, { align: "right", maxWidth: colW - 2 });
      });
      doc.setTextColor(0);
      y += 4;
      doc.setDrawColor(228, 231, 235);
      doc.line(M, y - 2, W - M, y - 2);
    }
    tableHead();

    panel.nutrients.forEach((nut) => {
      if (ensure(8)) tableHead();
      doc.setFontSize(8.5);
      doc.setTextColor(70);
      doc.text(pdfSafe(nutrientLabel(nut)), M, y + 2, { maxWidth: 38 });
      doc.setTextColor(0);
      panel.products.forEach((p, i) => {
        const v = Number(p.nutrients?.[nut]) || 0;
        doc.setTextColor(v > 0 ? 0 : 160);
        doc.text(v > 0 ? fmtNum(v) : "-", M + 40 + colW * i + colW - 1, y + 2, { align: "right" });
        doc.setTextColor(0);
      });
      y += 5.5;
      doc.line(M, y - 2, W - M, y - 2);
    });
  });

  // ---- O QUE FICOU DE FORA ----
  if (withoutData.length > 0) {
    ensure(24);
    y += 8;
    doc.setFont(undefined, "bold");
    doc.setFontSize(11);
    doc.text("Selecionados sem composição cadastrada", M, y);
    doc.setFont(undefined, "normal");
    y += 6;
    withoutData.forEach((p) => {
      ensure(6);
      doc.setFontSize(9);
      doc.text(pdfSafe(`- ${p.name}`), M, y);
      doc.setTextColor(130);
      doc.setFontSize(8);
      doc.text(pdfSafe(provenanceOf(p).label), W - M, y, { align: "right" });
      doc.setTextColor(0);
      y += 5;
    });
    para(
      "Esses produtos não aparecem no gráfico. Não viram barra zerada de propósito: o catálogo não tem a composição deles, e isso é diferente de o produto não entregar o nutriente.",
      8.5,
      150
    );
  }

  ensure(20);
  y += 6;
  para(
    "Documento gerado pelo Comparador Nutricional a partir do catálogo interno. Os valores são a concentração declarada pelo fabricante em cada produto, na unidade indicada - não são entrega por hectare, que depende da dose. Confira sempre na bula antes de recomendar.",
    8,
    140
  );

  const slug = brand
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 40);
  doc.save(`comparativo-${slug || "empresa"}.pdf`);
}
