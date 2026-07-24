import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";

function fmtNum(n) {
  return Number(n).toLocaleString("pt-BR", { maximumFractionDigits: 2 });
}

// R$/kg de cada nutriente entregue por cada manejo (índice agregado: custo
// total do manejo dividido pelo total daquele nutriente — não é uma alocação
// exata de custo por nutriente de um produto multi-nutriente, é o proxy
// padrão usado no agro pra comparar "custo por kg de nutriente" de um
// programa inteiro).
export function computeCostEfficiency(totals, nutrientKeys) {
  return nutrientKeys.map((key) => {
    const agroG = totals.agro.nutrients[key] || 0;
    const compG = totals.comp.nutrients[key] || 0;
    const agroKg = agroG / 1000;
    const compKg = compG / 1000;
    const agroCostPerKg = totals.agro.cost > 0 && agroKg > 0 ? totals.agro.cost / agroKg : null;
    const compCostPerKg = totals.comp.cost > 0 && compKg > 0 ? totals.comp.cost / compKg : null;
    let diffPct = null;
    if (agroCostPerKg != null && compCostPerKg != null) {
      diffPct = ((compCostPerKg - agroCostPerKg) / compCostPerKg) * 100; // positivo = Agrocete mais barato por kg
    }
    return { key, agroCostPerKg, compCostPerKg, diffPct };
  });
}

export function computeInsights(costEfficiency, nutrientMeta, threshold = 15) {
  return costEfficiency
    .filter((c) => c.diffPct != null && Math.abs(c.diffPct) >= threshold)
    .sort((a, b) => Math.abs(b.diffPct) - Math.abs(a.diffPct))
    .map((c) => {
      const label = nutrientMeta[c.key]?.label ?? c.key;
      const positive = c.diffPct > 0;
      return {
        key: c.key,
        positive,
        text: positive
          ? `Agrocete entrega ${label} ${fmtNum(Math.abs(c.diffPct))}% mais barato por kg que o concorrente selecionado.`
          : `O concorrente selecionado entrega ${label} ${fmtNum(Math.abs(c.diffPct))}% mais barato por kg que a Agrocete.`,
      };
    });
}

export function CostEfficiencyPanel({ costEfficiency, insights, nutrientMeta }) {
  const rows = costEfficiency.filter((c) => c.agroCostPerKg != null || c.compCostPerKg != null);
  if (rows.length === 0) return null;
  return (
    <div style={{ background: "#17212B", borderRadius: 12, border: "1px solid #24313D", padding: 14, marginBottom: 12 }}>
      <div className="muted" style={{ fontSize: 11, marginBottom: 10 }}>
        R$ por kg de nutriente entregue — quanto menor, mais eficiente o manejo naquele nutriente.
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {rows.map((c) => {
          const label = nutrientMeta[c.key]?.label ?? c.key;
          const agroWins = c.diffPct != null && c.diffPct > 0;
          const compWins = c.diffPct != null && c.diffPct < 0;
          return (
            <div key={c.key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
              <span style={{ width: 100, flexShrink: 0, fontWeight: 600 }}>{label}</span>
              <span style={{ flex: 1, color: compWins ? "#22C55E" : "#C7D2D9", fontWeight: compWins ? 700 : 400 }}>
                {c.compCostPerKg != null ? `R$ ${fmtNum(c.compCostPerKg)}/kg` : "—"}
              </span>
              <ArrowRight size={12} color="#4A5866" />
              <span style={{ flex: 1, color: agroWins ? "#22C55E" : "#C7D2D9", fontWeight: agroWins ? 700 : 400 }}>
                {c.agroCostPerKg != null ? `R$ ${fmtNum(c.agroCostPerKg)}/kg` : "—"}
              </span>
            </div>
          );
        })}
      </div>

      {insights.length > 0 && (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
          {insights.map((ins) => (
            <div
              key={ins.key}
              style={{
                display: "flex",
                gap: 7,
                alignItems: "flex-start",
                fontSize: 12,
                background: ins.positive ? "#1FBF8F14" : "#F5A52414",
                border: `1px solid ${ins.positive ? "#1FBF8F44" : "#F5A52444"}`,
                borderRadius: 8,
                padding: "8px 10px",
              }}
            >
              <Sparkles size={13} color={ins.positive ? "#1FBF8F" : "#F5A524"} style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ color: "#E8EDF1" }}>{ins.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Barra única por nutriente: verde fixo = Agrocete, cinza fixo = concorrente
// (identidade por cor, não por quem está na frente) — leitura em menos de 1
// segundo. O lado à frente ganha um contorno sutil.
export function CompareBar({ agroVal, compVal, height = 9 }) {
  const total = agroVal + compVal;
  const agroPct = total > 0 ? (agroVal / total) * 100 : 50;
  const agroAhead = agroVal > compVal;
  const compAhead = compVal > agroVal;
  return (
    <div style={{ display: "flex", height, borderRadius: height / 2, overflow: "hidden", background: "#0F1720" }}>
      <div
        style={{
          width: `${agroPct}%`,
          background: "#1FBF8F",
          boxShadow: agroAhead ? "inset 0 0 0 1px #FFFFFF55" : "none",
          transition: "width 0.3s",
        }}
      />
      <div
        style={{
          width: `${100 - agroPct}%`,
          background: "#6B7A88",
          boxShadow: compAhead ? "inset 0 0 0 1px #FFFFFF55" : "none",
          transition: "width 0.3s",
        }}
      />
    </div>
  );
}

// Selo compacto de vitória/alerta por nutriente — "+23%" verde quando a
// Agrocete entrega mais daquele nutriente, âmbar quando é o concorrente.
export function nutrientBadge(agroVal, compVal) {
  if (agroVal === 0 && compVal === 0) return null;
  if (compVal === 0 && agroVal > 0) return { text: "só Agrocete", positive: true };
  if (agroVal === 0 && compVal > 0) return { text: "só concorrente", positive: false };
  const diffPct = ((agroVal - compVal) / compVal) * 100;
  if (Math.abs(diffPct) < 20) return null;
  return { text: `${diffPct > 0 ? "+" : ""}${fmtNum(diffPct)}%`, positive: diffPct > 0 };
}

export function NutrientBadge({ badge }) {
  if (!badge) return null;
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        padding: "1px 7px",
        borderRadius: 999,
        background: badge.positive ? "#1FBF8F22" : "#F5A52422",
        color: badge.positive ? "#1FBF8F" : "#F5A524",
        border: `1px solid ${badge.positive ? "#1FBF8F55" : "#F5A52455"}`,
      }}
    >
      {badge.positive ? "▲" : "▼"} {badge.text}
    </span>
  );
}
