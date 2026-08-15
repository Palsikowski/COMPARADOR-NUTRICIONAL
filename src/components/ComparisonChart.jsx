import React, { useState } from "react";
import { Table2, BarChart3 } from "lucide-react";
import { fmtNum } from "../lib/economics.js";
import { NUTRIENT_LABEL } from "../lib/nutrientLabels.js";

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

const ROW_H = 26; // altura da faixa de cada barra
const BAR_H = 18; // marca fina: nunca preenche a faixa inteira
const GAP = 2; // respiro na cor do fundo entre barras vizinhas
const LABEL_W = 104;
const VALUE_W = 78;

export default function ComparisonChart({ panel, colors, title }) {
  const [view, setView] = useState("grafico");
  const { unit, products, nutrients, max } = panel;

  const blockH = products.length * ROW_H + 14;
  const height = nutrients.length * blockH + 8;
  const plotW = 640 - LABEL_W - VALUE_W;

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
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 10 }}>
          {products.map((p, i) => (
            <span key={p.id} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5 }}>
              <span style={{ width: 11, height: 11, borderRadius: 3, background: colors[i], flexShrink: 0 }} />
              <span style={{ color: "var(--text-2)" }}>{p.name}</span>
            </span>
          ))}
        </div>
      )}

      {view === "tabela" ? (
        <TableView panel={panel} colors={colors} />
      ) : (
        <div style={{ overflowX: "auto" }}>
          <svg
            width="100%"
            viewBox={`0 0 640 ${height}`}
            style={{ minWidth: 520, display: "block" }}
            role="img"
            aria-label={`Composição comparada em ${unit} de ${products.map((p) => p.name).join(", ")}`}
          >
            {nutrients.map((nut, ni) => {
              const top = ni * blockH + 4;
              return (
                <g key={nut}>
                  <text x={LABEL_W - 10} y={top + (products.length * ROW_H) / 2 + 4} textAnchor="end" fontSize="12.5" fill="var(--text-2)">
                    {NUTRIENT_LABEL[nut] || nut}
                  </text>
                  {products.map((p, pi) => {
                    const v = Number(p.nutrients?.[nut]) || 0;
                    const w = max > 0 ? (v / max) * plotW : 0;
                    const y = top + pi * ROW_H + (ROW_H - BAR_H) / 2;
                    return (
                      <g key={p.id}>
                        <rect
                          x={LABEL_W}
                          y={y + GAP / 2}
                          width={Math.max(w, v > 0 ? 3 : 0)}
                          height={BAR_H - GAP}
                          rx={4}
                          fill={colors[pi]}
                        >
                          <title>{`${p.name} · ${NUTRIENT_LABEL[nut] || nut}: ${v > 0 ? `${fmtNum(v)} ${unit}` : "não declarado"}`}</title>
                        </rect>
                        {/* Rótulo direto em toda barra: é o "relevo" exigido pela
                            paleta clara, e o que faz a leitura não depender da cor. */}
                        <text x={LABEL_W + Math.max(w, 3) + 7} y={y + BAR_H / 2 + 4} fontSize="11.5" fill={v > 0 ? "var(--text-2)" : "var(--text-3)"}>
                          {v > 0 ? fmtNum(v) : "—"}
                        </text>
                      </g>
                    );
                  })}
                  {ni < nutrients.length - 1 && (
                    <line
                      x1={LABEL_W}
                      x2={640 - 8}
                      y1={top + products.length * ROW_H + 6}
                      y2={top + products.length * ROW_H + 6}
                      stroke="var(--border)"
                      strokeWidth="1"
                    />
                  )}
                </g>
              );
            })}
          </svg>
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

function TableView({ panel, colors }) {
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
            {products.map((p, i) => (
              <th key={p.id} style={{ textAlign: "right", padding: "7px 8px", borderBottom: "1px solid var(--border)", fontWeight: 600 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 2, background: colors[i] }} />
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
                const v = Number(p.nutrients?.[nut]) || 0;
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
