import React from "react";
import { fmtBRL, fmtNum } from "../lib/economics.js";

// Card de custo por hectare com a conta aberta embaixo. A conta visível é
// proposital: número de custo sem a memória de cálculo não sustenta decisão
// nem discussão com o cliente.
export default function CostPerHectare({ econ, product, areaHa, accent = "var(--brand)", compact = false }) {
  if (!econ.hasDose || !econ.hasPrice) {
    const faltando = [];
    if (!econ.hasDose) faltando.push("dose");
    if (!econ.hasPrice) faltando.push("preço");
    return (
      <div
        style={{
          padding: compact ? 12 : 16,
          borderRadius: "var(--radius-sm)",
          background: "var(--warn-soft)",
          border: "1px solid var(--warn)33",
        }}
      >
        <div className="muted-soft" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Custo por hectare
        </div>
        <div style={{ color: "var(--warn)", fontWeight: 700, fontSize: 14, marginTop: 6 }}>
          Informe {faltando.join(" e ")} para calcular
        </div>
        <div className="muted" style={{ fontSize: 11.5, marginTop: 4 }}>
          Sem {faltando.join(" e ")} não existe custo — o campo fica em branco em vez de mostrar R$ 0,00.
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: compact ? 12 : 16,
        borderRadius: "var(--radius-sm)",
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="muted-soft" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        Custo por hectare
      </div>
      <div className="tnum" style={{ fontSize: compact ? 24 : 30, fontWeight: 700, color: accent, marginTop: 4, lineHeight: 1.1 }}>
        {fmtBRL(econ.costPerHa)}
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-3)" }}>/ha</span>
      </div>
      <div className="muted tnum" style={{ fontSize: 12, marginTop: 6 }}>
        {fmtNum(econ.dose)} {econ.doseUnit}/ha × {fmtBRL(econ.price)}/{econ.doseUnit}
      </div>
      <div
        className="tnum"
        style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--border)", fontSize: 13, fontWeight: 600 }}
      >
        {fmtNum(areaHa, 0)} ha = {fmtBRL(econ.costTotal)}
      </div>
    </div>
  );
}
