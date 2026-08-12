import React from "react";
import { fmtNum } from "../lib/economics.js";

// Barra de comparação de duas grandezas. Cor fixa por lado (A azul, B verde),
// nunca "verde = vencedor" — quem lê precisa saber de quem é a barra, não
// quem o app achou melhor.
export default function CompareBars({ label, unit, a, b, labelA, labelB, lowerIsBetter = false, note }) {
  const av = Number(a) || 0;
  const bv = Number(b) || 0;
  const max = Math.max(av, bv);
  const pctA = max > 0 ? (av / max) * 100 : 0;
  const pctB = max > 0 ? (bv / max) * 100 : 0;
  const hasBoth = av > 0 && bv > 0;

  // "Melhor" aqui é só uma leitura direcional declarada pelo chamador
  // (ex: menor custo/ha), não um julgamento sobre o produto.
  const aLeads = hasBoth && (lowerIsBetter ? av < bv : av > bv);
  const bLeads = hasBoth && (lowerIsBetter ? bv < av : bv > av);

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8, gap: 10 }}>
        <span style={{ fontSize: 13.5, fontWeight: 600 }}>{label}</span>
        {note && (
          <span className="muted-soft" style={{ fontSize: 11 }}>
            {note}
          </span>
        )}
      </div>
      <Row color="var(--side-a)" name={labelA} value={av} pct={pctA} unit={unit} leads={aLeads} />
      <Row color="var(--side-b)" name={labelB} value={bv} pct={pctB} unit={unit} leads={bLeads} />
    </div>
  );
}

function Row({ color, name, value, pct, unit, leads }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
      <span
        className="muted"
        style={{ width: 92, flexShrink: 0, fontSize: 11.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
        title={name}
      >
        {name}
      </span>
      <span style={{ flex: 1, height: 22, background: "var(--surface-2)", borderRadius: 6, overflow: "hidden", minWidth: 0 }}>
        <span
          style={{
            display: "block",
            height: "100%",
            width: `${Math.max(pct, value > 0 ? 3 : 0)}%`,
            background: color,
            borderRadius: 6,
            transition: "width var(--speed) ease",
          }}
        />
      </span>
      <span
        className="tnum"
        style={{ width: 118, flexShrink: 0, textAlign: "right", fontSize: 12.5, fontWeight: leads ? 700 : 500 }}
      >
        {value > 0 ? `${fmtNum(value)}${unit ? ` ${unit}` : ""}` : "—"}
      </span>
    </div>
  );
}
