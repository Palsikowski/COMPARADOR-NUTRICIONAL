// PDF do portfólio: a tabela inteira em paisagem, para imprimir e levar.
//
// Paisagem porque são seis colunas — em retrato a coluna de garantias fica com
// duas palavras por linha e a tabela perde a função de consulta rápida.
//
// A garantia impressa é a mesma que o app usa nos cálculos, não uma transcrição
// paralela do material: duas versões da mesma garantia divergiriam com o tempo,
// e é este papel que vai para a mão do cliente.

import { PORTFOLIO_SOURCE } from "./portfolio.js";

function pdfSafe(s) {
  return (s || "")
    .toString()
    .replace(/[–—−]/g, "-")
    .replace(/[“”„]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/…/g, "...")
    .replace(/₂/g, "2")
    .replace(/₅/g, "5")
    .replace(/·/g, "-");
}

export async function exportPortfolio({ grupos, culturas }) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "landscape" });
  const W = 297;
  const H = 210;
  const M = 10;
  let y = 0;

  // Larguras fixas: nome, garantias, uma por cultura, tecnologia.
  const wNome = 38;
  const wGar = 78;
  const wCult = 26;
  const wTec = W - M * 2 - wNome - wGar - wCult * culturas.length;
  const cols = [wNome, wGar, ...culturas.map(() => wCult), wTec];
  const xs = cols.reduce((acc, w) => [...acc, acc[acc.length - 1] + w], [M]);

  function header() {
    doc.setFillColor(5, 150, 105);
    doc.rect(0, 0, W, 16, "F");
    doc.setTextColor(255);
    doc.setFont(undefined, "bold");
    doc.setFontSize(12);
    doc.text("Portfólio Agrocete", M, 10.5);
    doc.setFont(undefined, "normal");
    doc.setFontSize(8);
    doc.text(pdfSafe(`Garantias e dose por cultura · gerado em ${new Date().toLocaleDateString("pt-BR")}`), W - M, 10.5, {
      align: "right",
    });
    doc.setTextColor(0);
    y = 24;
  }

  function colHead() {
    doc.setFillColor(243, 244, 246);
    doc.rect(M, y - 4.5, W - M * 2, 6.5, "F");
    doc.setFontSize(7);
    doc.setTextColor(90);
    doc.setFont(undefined, "bold");
    ["Produto", "Garantias", ...culturas, "Composição / tecnologia"].forEach((t, i) => {
      const center = i >= 2 && i < 2 + culturas.length;
      doc.text(pdfSafe(t), center ? xs[i] + cols[i] / 2 : xs[i] + 1.5, y, { align: center ? "center" : "left" });
    });
    doc.setFont(undefined, "normal");
    doc.setTextColor(0);
    y += 4;
  }

  header();

  grupos.forEach((g) => {
    if (y > H - 34) {
      doc.addPage();
      header();
    }
    y += 4;
    doc.setFont(undefined, "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(4, 120, 87);
    doc.text(pdfSafe(g.group), M, y);
    doc.setTextColor(0);
    doc.setFont(undefined, "normal");
    // A faixa do cabeçalho é desenhada a partir de y-4,5; com menos que isso de
    // respiro ela cobre o título do grupo.
    y += 8;
    colHead();

    g.products.forEach((r) => {
      const garantia =
        r.nutrients.length > 0
          ? r.nutrients.map((n) => `${n.label} ${n.value}${n.percent ? ` (${n.percent})` : ""}`).join(" · ")
          : r.composition || "não informado";

      const celulas = [
        doc.splitTextToSize(pdfSafe(r.product.name), cols[0] - 3),
        doc.splitTextToSize(pdfSafe(garantia), cols[1] - 3),
        ...culturas.map((c, i) => {
          const d = r.culturas.find((x) => x.cultura === c);
          // a quebra da célula original separa MODOS de aplicação: preservada
          return d ? d.dose.split("\n").flatMap((l) => doc.splitTextToSize(pdfSafe(l), cols[2 + i] - 3)) : ["-"];
        }),
        doc.splitTextToSize(pdfSafe(r.product.technology || "-"), cols[cols.length - 1] - 3),
      ];
      const linhas = Math.max(...celulas.map((c) => c.length));
      const alt = linhas * 3.1 + 2.4;

      if (y + alt > H - 16) {
        doc.addPage();
        header();
        colHead();
      }

      doc.setFontSize(7);
      celulas.forEach((linhasCel, i) => {
        const center = i >= 2 && i < 2 + culturas.length;
        doc.setTextColor(i === 0 ? 0 : 75);
        if (i === 0) doc.setFont(undefined, "bold");
        linhasCel.forEach((ln, k) => {
          doc.text(ln, center ? xs[i] + cols[i] / 2 : xs[i] + 1.5, y + 2 + k * 3.1, { align: center ? "center" : "left" });
        });
        if (i === 0) doc.setFont(undefined, "normal");
      });
      doc.setTextColor(0);
      y += alt;
      doc.setDrawColor(229, 231, 235);
      doc.line(M, y - 1.2, W - M, y - 1.2);
    });
  });

  if (y > H - 22) {
    doc.addPage();
    header();
  }
  y += 5;
  doc.setFontSize(7);
  doc.setTextColor(140);
  doc
    .splitTextToSize(
      pdfSafe(
        `${PORTFOLIO_SOURCE} As garantias são as mesmas que alimentam os cálculos do Comparador Nutricional - a tabela não é uma cópia à parte. A dose é a faixa do material; confirme na bula e com a equipe técnica antes de aplicar.`
      ),
      W - M * 2
    )
    .forEach((ln) => {
      doc.text(ln, M, y);
      y += 3.2;
    });

  doc.save("portfolio-agrocete.pdf");
}
