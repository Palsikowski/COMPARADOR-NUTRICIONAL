import React from "react";
import { nutrientColor, nutrientShort } from "./nutrientColors.js";

function fmtNum(n) {
  return Number(n).toLocaleString("pt-BR", { maximumFractionDigits: 2 });
}

// Pill colorida de nutriente: a cor é fixa por nutriente (ver nutrientColors.js),
// então o consultor reconhece "verde = N, azul = P, laranja = K" de relance.
// `value` e `unit` são opcionais — sem eles a pill vira só o rótulo.
// `onBrandBg` = a pill está por cima de um fundo claro (card selecionado, que
// assume a cor da marca). Nesse caso o fundo translúcido some, então usa fundo
// escuro sólido pra cor do nutriente continuar legível.
export default function NutrientPill({ nutrientKey, value, unit, label, compact = false, onBrandBg = false }) {
  const color = nutrientColor(nutrientKey);
  return (
    <span
      title={value != null ? `${label ?? nutrientKey}: ${fmtNum(value)} ${unit ?? ""}`.trim() : label ?? nutrientKey}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: onBrandBg ? "#0B1319" : `${color}1F`,
        border: `1px solid ${onBrandBg ? "#0B131900" : `${color}55`}`,
        color,
        borderRadius: 999,
        padding: compact ? "1px 6px" : "2px 8px",
        fontSize: compact ? 10 : 11,
        fontWeight: 700,
        lineHeight: 1.5,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0 }} />
      {nutrientShort(nutrientKey)}
      {value != null && (
        <span style={{ fontWeight: 600, opacity: 0.95 }}>
          {fmtNum(value)}
          {unit ? ` ${unit}` : ""}
        </span>
      )}
    </span>
  );
}

// Linha de pills a partir do objeto `nutrients` de um produto, ordenada pelo
// valor (mais concentrado primeiro) e cortada em `max` pra não estourar o card.
export function NutrientPillRow({ nutrients, unit, meta, max = 6, compact = false, onBrandBg = false }) {
  const entries = Object.entries(nutrients || {})
    .filter(([, v]) => Number(v) > 0)
    .sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return null;
  const shown = entries.slice(0, max);
  const rest = entries.length - shown.length;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 5 }}>
      {shown.map(([key, val]) => (
        <NutrientPill key={key} nutrientKey={key} value={val} unit={unit} label={meta?.[key]?.label} compact={compact} onBrandBg={onBrandBg} />
      ))}
      {rest > 0 && (
        <span
          className={onBrandBg ? undefined : "muted-soft"}
          style={{ fontSize: compact ? 10 : 11, alignSelf: "center", fontWeight: 700, color: onBrandBg ? "#0B131999" : undefined }}
        >
          +{rest}
        </span>
      )}
    </div>
  );
}
