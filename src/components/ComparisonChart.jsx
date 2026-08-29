import React, { useState } from "react";
import { Table2, BarChart3 } from "lucide-react";
import { fmtNum } from "../lib/economics.js";
import { NUTRIENT_LABEL } from "../lib/nutrientLabels.js";
import { chartValues } from "../lib/brandTiles.js";

// Gráfico comparativo de composição entre produtos selecionados.
//
// Forma: barra horizontal agrupada — um bloco por nutriente, uma barra por
// produto dentro do bloco. A comparação que interessa é "quanto cada produto
// entrega de cada nutriente", e barra é o que o olho compara melhor. Nome de
// nutriente é longo, por isso deitada.
//
// Cor: a série é o PRODUTO (identidade), então paleta categórica de 4 slots,
// validada para daltonismo em claro e escuro. Quatro é o teto: acima disso as
// matizes deixam de ser distinguíveis com segurança, então a tela limita a
// seleção em vez de gerar cor nova.
//
// A paleta clara fica abaixo de 3:1 de contraste em dois slots, o que obriga
// "relevo": por isso todo valor é rotulado direto na barra E existe a visão de
// tabela — a leitura nunca depende só da cor.
export const SERIES_LIGHT = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100"];
export const SERIES_DARK = ["#3987e5", "#d95926", "#199e70", "#c98500"];
export const MAX_SERIES = SERIES_LIGHT.length;

export function seriesColors(dark) {
  return dark ? SERIES_DARK : SERIES_LIGHT;
}

// Duas densidades do MESMO desenho, não dois gráficos.
//
// `compact` é a tela de estudo: cabe num card, ao lado de outras coisas.
// `stage` é o modo apresentação: projetado, a 3 metros de distância. O que
// muda entre eles não é só "tudo maior" — muda para onde vai o número:
//
//   compact → valor na ponta da barra (denso, o olho está perto)
//   stage   → valor numa coluna fixa à direita
//
// Na ponta, o rótulo se move junto com a barra e 16 números viram serrilha
// projetada. Numa coluna fixa eles alinham, ficam legíveis de longe e ainda
// assim pertencem sem ambiguidade à sua linha — cada linha é uma barra só.
//
// `chip` é a segunda diferença do palco: um quadradinho da cor do produto em
// CADA linha, colado à linha de base. Sem ele, a linha de um nutriente que o
// produto não declara fica órfã — um traço solto na coluna da direita, sem
// nada que diga de quem é. Projetado, ninguém conta a ordem das barras contra
// a legenda; o chip devolve a identidade linha a linha.
//
// `titleH` decide onde fica o nome do nutriente. Centrado à esquerda do bloco
// (compact) ele economiza altura, mas com três produtos ele cai exatamente na
// altura da barra do meio e passa a parecer o rótulo DAQUELA barra. No palco,
// onde o bloco é grande e a leitura é de longe, o nome vira cabeçalho do bloco:
// some a ambiguidade e sobra largura para o gráfico.
const SIZES = {
  compact: { W: 640, ROW: 26, BAR: 18, GAP: 2, LABEL: 104, VALUE: 78, LABEL_FS: 12.5, VALUE_FS: 11.5, PAD: 14, R: 4, valueAt: "tip", chip: 0, titleH: 0, floor: 520 },
  stage: { W: 1000, ROW: 34, BAR: 20, GAP: 4, LABEL: 26, VALUE: 110, LABEL_FS: 21, VALUE_FS: 17, PAD: 22, R: 4, valueAt: "gutter", chip: 12, titleH: 32, floor: 680 },
  // Palco estreito (celular). Não é o palco "reduzido": num viewBox, encolher a
  // largura encolhe o texto junto, então a versão de celular tem a MESMA
  // estrutura numa caixa mais curta e com o texto proporcionalmente maior — é
  // o que faz o valor continuar legível sem rolagem horizontal.
  stageNarrow: { W: 560, ROW: 40, BAR: 24, GAP: 4, LABEL: 32, VALUE: 108, LABEL_FS: 23, VALUE_FS: 20, PAD: 24, R: 5, valueAt: "gutter", chip: 14, titleH: 36, floor: 0 },
};

// Barra com a ponta arredondada e a base reta: o canto redondo marca onde o
// valor termina, e arredondar também o pé faria a barra parecer descolada da
// linha de base — que é de onde toda barra cresce.
function barPath(x, y, w, h, r) {
  if (w <= 0) return "";
  const rr = Math.min(r, w, h / 2);
  if (rr <= 0) return `M${x},${y}h${w}v${h}h${-w}z`;
  return `M${x},${y}h${w - rr}a${rr},${rr} 0 0 1 ${rr},${rr}v${h - 2 * rr}a${rr},${rr} 0 0 1 ${-rr},${rr}h${-(w - rr)}z`;
}

/**
 * Só as barras — sem título, sem alternador de visão, sem rodapé.
 *
 * Separado do `ComparisonChart` porque o modo apresentação monta a própria
 * moldura (legenda no cabeçalho do slide, unidade no eyebrow) e precisa do
 * mesmo desenho por baixo. Duas cópias do gráfico é como as duas telas
 * começam a discordar sobre o mesmo dado.
 */
export function CompositionBars({ panel, colorOf, size = "compact", scaleTo, nutrientTitles = true }) {
  const S = SIZES[size] || SIZES.compact;
  const { unit, products, nutrients } = panel;
  // `scaleTo` existe para o slide de um nutriente só, onde a escala do painel
  // inteiro reduziria um micronutriente a um traço. Fora daí a escala é sempre
  // a do painel, senão a mesma barra teria dois tamanhos na mesma sessão.
  const max = Number(scaleTo) > 0 ? Number(scaleTo) : panel.max;
  // O slide de destaque já anuncia o nutriente no eyebrow e no texto; repetir
  // o nome como cabeçalho do bloco só gastaria altura.
  const titleH = nutrientTitles ? S.titleH : 0;

  const blockH = titleH + products.length * S.ROW + S.PAD;
  const height = nutrients.length * blockH + 8;
  const plotW = S.W - S.LABEL - S.VALUE;

  // Rede de segurança do palco: mesmo com o fatiamento por linhas, uma seleção
  // incomum não pode empurrar o gráfico para fora do slide. Como o desenho é
  // um viewBox, limitar a altura encolhe tudo junto em vez de cortar o pé.
  return (
    <svg
      width="100%"
      viewBox={`0 0 ${S.W} ${height}`}
      style={{ display: "block", minWidth: S.floor || undefined, maxHeight: S.valueAt === "gutter" ? "54vh" : undefined }}
      role="img"
      aria-label={`Composição comparada em ${unit} de ${products.map((p) => p.name).join(", ")}`}
    >
      {/* Linha de base: única régua do gráfico. Com todo valor rotulado, uma
          grade completa seria tinta que não carrega dado. */}
      <line x1={S.LABEL} x2={S.LABEL} y1={4} y2={height - 8} stroke="var(--border)" strokeWidth="1" />

      {nutrients.map((nut, ni) => {
        const top = ni * blockH + 4;
        return (
          <g key={nut}>
            {!nutrientTitles ? null : titleH > 0 ? (
              <text x={0} y={top + S.LABEL_FS} fontSize={S.LABEL_FS} fontWeight={600} fill="var(--text)">
                {NUTRIENT_LABEL[nut] || nut}
              </text>
            ) : (
              <text
                x={S.LABEL - 12}
                y={top + (products.length * S.ROW) / 2 + S.LABEL_FS / 3}
                textAnchor="end"
                fontSize={S.LABEL_FS}
                fill="var(--text-2)"
              >
                {NUTRIENT_LABEL[nut] || nut}
              </text>
            )}
            {products.map((p, pi) => {
              const v = Number(chartValues(p)?.values?.[nut]) || 0;
              const w = max > 0 ? (v / max) * plotW : 0;
              const drawn = Math.max(w, v > 0 ? 3 : 0);
              const y = top + titleH + pi * S.ROW + (S.ROW - S.BAR) / 2;
              const label = v > 0 ? fmtNum(v) : "—";
              return (
                <g key={p.id}>
                  {S.chip > 0 && (
                    <rect
                      x={S.LABEL - S.chip - 10}
                      y={y + (S.BAR - S.chip) / 2}
                      width={S.chip}
                      height={S.chip}
                      rx={3}
                      fill={colorOf.get(p.id)}
                    />
                  )}
                  <path d={barPath(S.LABEL, y + S.GAP / 2, drawn, S.BAR - S.GAP, S.R)} fill={colorOf.get(p.id)}>
                    <title>{`${p.name} · ${NUTRIENT_LABEL[nut] || nut}: ${v > 0 ? `${fmtNum(v)} ${unit}` : "não declarado"}`}</title>
                  </path>
                  {/* Rótulo direto em toda barra: é o "relevo" exigido pela
                      paleta clara, e o que faz a leitura não depender da cor. */}
                  {S.valueAt === "gutter" ? (
                    <text
                      x={S.W - 10}
                      y={y + S.BAR / 2 + S.VALUE_FS / 3}
                      textAnchor="end"
                      fontSize={S.VALUE_FS}
                      fontWeight={600}
                      style={{ fontVariantNumeric: "tabular-nums" }}
                      fill={v > 0 ? "var(--text)" : "var(--text-3)"}
                    >
                      {label}
                    </text>
                  ) : (
                    <text
                      x={S.LABEL + drawn + 7}
                      y={y + S.BAR / 2 + S.VALUE_FS / 3}
                      fontSize={S.VALUE_FS}
                      fill={v > 0 ? "var(--text-2)" : "var(--text-3)"}
                    >
                      {label}
                    </text>
                  )}
                </g>
              );
            })}
            {ni < nutrients.length - 1 && (
              <line
                x1={S.chip > 0 ? 0 : S.LABEL}
                x2={S.W - 8}
                y1={top + titleH + products.length * S.ROW + S.PAD / 2 - 1}
                y2={top + titleH + products.length * S.ROW + S.PAD / 2 - 1}
                stroke="var(--border)"
                strokeWidth="1"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}

// Legenda das séries. Sai do gráfico para poder viver também no cabeçalho de
// um slide, onde precisa ficar fixa enquanto os nutrientes passam.
export function SeriesLegend({ products, colorOf, size = 12.5, gap = 14 }) {
  if (products.length < 2) return null;
  return (
    <div style={{ display: "flex", gap, flexWrap: "wrap", alignItems: "center" }}>
      {products.map((p) => (
        <span key={p.id} style={{ display: "inline-flex", alignItems: "center", gap: gap / 2.3, fontSize: size }}>
          <span
            style={{
              width: size * 0.85,
              height: size * 0.85,
              borderRadius: Math.max(2, size * 0.22),
              background: colorOf.get(p.id),
              flexShrink: 0,
            }}
          />
          <span style={{ color: "var(--text-2)", whiteSpace: "nowrap" }}>{p.name}</span>
        </span>
      ))}
    </div>
  );
}

export default function ComparisonChart({ panel, colorOf, title }) {
  const [view, setView] = useState("grafico");
  const { unit, products } = panel;

  return (
    <figure style={{ margin: 0 }}>
      <figcaption style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{title}</div>
          <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>
            Concentração declarada em <strong>{unit}</strong> · {products.length}{" "}
            {products.length === 1 ? "produto" : "produtos"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <ViewBtn active={view === "grafico"} onClick={() => setView("grafico")} icon={BarChart3} label="Gráfico" />
          <ViewBtn active={view === "tabela"} onClick={() => setView("tabela")} icon={Table2} label="Tabela" />
        </div>
      </figcaption>

      {/* Legenda sempre presente com 2+ séries: identidade nunca fica só na cor. */}
      {products.length > 1 && (
        <div style={{ marginBottom: 10 }}>
          <SeriesLegend products={products} colorOf={colorOf} />
        </div>
      )}

      {view === "tabela" ? (
        <TableView panel={panel} colorOf={colorOf} />
      ) : (
        <div style={{ overflowX: "auto" }}>
          <CompositionBars panel={panel} colorOf={colorOf} size="compact" />
        </div>
      )}

      <p className="muted" style={{ fontSize: 11.5, margin: "10px 0 0", lineHeight: 1.5 }}>
        Traço (—) significa <strong>nutriente não declarado</strong> na composição do produto, que é diferente de zero.
        As barras comparam concentração no produto, não entrega por hectare — para isso é preciso a dose, na
        Calculadora Custo/ha.
      </p>
    </figure>
  );
}

function ViewBtn({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className="btn btn-ghost"
      style={{
        padding: "5px 10px",
        fontSize: 12.5,
        background: active ? "var(--brand-soft)" : "transparent",
        color: active ? "var(--brand)" : "var(--text-3)",
      }}
    >
      <Icon size={14} /> {label}
    </button>
  );
}

function TableView({ panel, colorOf }) {
  const { unit, products, nutrients } = panel;
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <caption className="muted" style={{ captionSide: "bottom", textAlign: "left", fontSize: 11.5, paddingTop: 8 }}>
          Mesmos dados do gráfico, em {unit}.
        </caption>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "7px 8px", borderBottom: "1px solid var(--border)", fontWeight: 600 }}>Nutriente</th>
            {products.map((p) => (
              <th key={p.id} style={{ textAlign: "right", padding: "7px 8px", borderBottom: "1px solid var(--border)", fontWeight: 600 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 2, background: colorOf.get(p.id) }} />
                  {p.name}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {nutrients.map((nut) => (
            <tr key={nut}>
              <td style={{ padding: "7px 8px", borderBottom: "1px solid var(--border)", color: "var(--text-2)" }}>
                {NUTRIENT_LABEL[nut] || nut}
              </td>
              {products.map((p) => {
                const v = Number(chartValues(p)?.values?.[nut]) || 0;
                return (
                  <td key={p.id} className="tnum" style={{ textAlign: "right", padding: "7px 8px", borderBottom: "1px solid var(--border)", color: v > 0 ? "var(--text)" : "var(--text-3)" }}>
                    {v > 0 ? fmtNum(v) : "—"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
