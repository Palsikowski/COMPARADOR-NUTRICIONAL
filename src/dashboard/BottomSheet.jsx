import React, { useRef, useState } from "react";
import { ChevronUp, ChevronDown, Download } from "lucide-react";

const KEY_MACROS = ["N", "P2O5", "K2O", "Ca", "Mg"];

function fmtNum(n) {
  return Number(n).toLocaleString("pt-BR", { maximumFractionDigits: 2 });
}

// Bottom sheet fixo (estilo Google Maps): mostra um resumo sempre visível
// e pode ser arrastado (ou tocado) para expandir em tela cheia com o
// resumo completo de macros + custo.
export default function BottomSheet({ totals, nutrientMeta, expanded, setExpanded, hasBothSides, onExportPDF }) {
  const dragStartY = useRef(null);
  const [dragDelta, setDragDelta] = useState(0);

  function onTouchStart(e) {
    dragStartY.current = e.touches[0].clientY;
  }
  function onTouchMove(e) {
    if (dragStartY.current == null) return;
    setDragDelta(e.touches[0].clientY - dragStartY.current);
  }
  function onTouchEnd() {
    if (dragDelta < -40 && !expanded) setExpanded(true);
    else if (dragDelta > 40 && expanded) setExpanded(false);
    dragStartY.current = null;
    setDragDelta(0);
  }

  const costDiff = totals.comp.cost - totals.agro.cost;
  const hasCost = totals.comp.cost > 0 || totals.agro.cost > 0;

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 40,
        background: "#0B1319",
        borderTop: "1px solid #24313D",
        borderRadius: "16px 16px 0 0",
        boxShadow: "0 -6px 24px rgba(0,0,0,0.4)",
        maxHeight: expanded ? "78vh" : 92,
        overflowY: expanded ? "auto" : "hidden",
        transition: dragStartY.current ? "none" : "max-height 0.28s ease",
      }}
    >
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={() => setExpanded(!expanded)}
        className={hasBothSides && !expanded ? "pulse tap-scale" : "tap-scale"}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          cursor: "pointer",
          borderRadius: "16px 16px 0 0",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span className="muted" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            {hasBothSides ? "Comparar manejo" : "Resumo do manejo"}
          </span>
          <span style={{ fontSize: 13, fontWeight: 700 }}>
            {hasCost ? (
              costDiff >= 0 ? (
                <span style={{ color: "#22C55E" }}>Agrocete R$ {Math.abs(costDiff).toFixed(2)} mais barato</span>
              ) : (
                <span style={{ color: "#F5A524" }}>Agrocete R$ {Math.abs(costDiff).toFixed(2)} mais caro</span>
              )
            ) : (
              <span className="muted">Selecione produtos para comparar</span>
            )}
          </span>
        </div>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "#17212B", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {expanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </div>
      </div>

      {expanded && (
        <div style={{ padding: "0 16px 24px" }}>
          <div style={{ display: "flex", gap: 14, fontSize: 11, marginBottom: 12 }}>
            <LegendDot color="#6B7A88" label="Concorrentes" />
            <LegendDot color="#1FBF8F" label="Agrocete" />
          </div>
          {KEY_MACROS.filter((k) => (totals.agro.nutrients[k] || 0) > 0 || (totals.comp.nutrients[k] || 0) > 0).map((k) => (
            <MiniRow key={k} label={nutrientMeta[k]?.label ?? k} agroVal={totals.agro.nutrients[k] || 0} compVal={totals.comp.nutrients[k] || 0} />
          ))}
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <div style={{ flex: 1, background: "#17212B", border: "1.5px solid #6B7A8844", borderRadius: 10, padding: 10 }}>
              <div className="muted" style={{ fontSize: 10 }}>Custo concorrentes</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>R$ {totals.comp.cost.toFixed(2)}</div>
            </div>
            <div style={{ flex: 1, background: "#17212B", border: "1.5px solid #1FBF8F44", borderRadius: 10, padding: 10 }}>
              <div className="muted" style={{ fontSize: 10 }}>Custo Agrocete</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#1FBF8F" }}>R$ {totals.agro.cost.toFixed(2)}</div>
            </div>
          </div>
          <button
            onClick={onExportPDF}
            className="tap-scale"
            style={{
              marginTop: 14,
              width: "100%",
              padding: "11px",
              borderRadius: 10,
              border: "none",
              background: "#1FBF8F",
              color: "#0B1319",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
            }}
          >
            <Download size={15} /> Exportar comparativo em PDF
          </button>
          <a
            href="#comparativo"
            onClick={() => setExpanded(false)}
            className="muted"
            style={{ display: "block", textAlign: "center", marginTop: 10, fontSize: 12 }}
          >
            Ver comparativo completo abaixo ↓
          </a>
        </div>
      )}
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block" }} />
      <span className="muted">{label}</span>
    </div>
  );
}

function MiniRow({ label, agroVal, compVal }) {
  const total = agroVal + compVal;
  const agroPct = total > 0 ? (agroVal / total) * 100 : 50;
  return (
    <div style={{ marginBottom: 9 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
        <span style={{ fontWeight: 600 }}>{label}</span>
        <span className="muted">
          {fmtNum(compVal)} g vs {fmtNum(agroVal)} g
        </span>
      </div>
      <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", background: "#0F1720" }}>
        <div style={{ width: `${agroPct}%`, background: "#1FBF8F", transition: "width 0.3s" }} />
        <div style={{ width: `${100 - agroPct}%`, background: "#6B7A88", transition: "width 0.3s" }} />
      </div>
    </div>
  );
}
