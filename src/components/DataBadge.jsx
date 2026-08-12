import React, { useState } from "react";
import { provenanceOf } from "../lib/provenance.js";

const TONE_VARS = {
  ok: ["var(--ok)", "var(--ok-soft)"],
  info: ["var(--info)", "var(--info-soft)"],
  warn: ["var(--warn)", "var(--warn-soft)"],
  trial: ["var(--info)", "var(--info-soft)"],
  muted: ["var(--neutral)", "var(--neutral-soft)"],
};

// Selo de procedência do dado. Clicável: abre a explicação do que aquele
// nível significa, pra o usuário saber o peso do número antes de decidir.
export default function DataBadge({ product, level, compact = false }) {
  const [open, setOpen] = useState(false);
  const lv = level || provenanceOf(product);
  const [fg, bg] = TONE_VARS[lv.tone] || TONE_VARS.muted;

  return (
    <span style={{ position: "relative", display: "inline-flex" }}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        onBlur={() => setOpen(false)}
        title={lv.help}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          padding: compact ? "2px 7px" : "3px 9px",
          borderRadius: "var(--radius-pill)",
          border: `1px solid ${fg}33`,
          background: bg,
          color: fg,
          fontSize: compact ? 10 : 11,
          fontWeight: 700,
          cursor: "help",
          font: "inherit",
          fontFamily: "inherit",
          lineHeight: 1.6,
        }}
      >
        <span aria-hidden>{lv.icon}</span>
        {compact ? lv.short : lv.label}
      </button>
      {open && (
        <span
          role="tooltip"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            zIndex: 60,
            width: 260,
            padding: "10px 12px",
            borderRadius: "var(--radius-sm)",
            background: "var(--surface)",
            border: "1px solid var(--border-strong)",
            boxShadow: "var(--shadow-lg)",
            color: "var(--text-2)",
            fontSize: 12,
            fontWeight: 400,
            lineHeight: 1.5,
            textAlign: "left",
          }}
        >
          <strong style={{ color: "var(--text)", display: "block", marginBottom: 3 }}>{lv.label}</strong>
          {lv.help}
          {product?.fonte && (
            <span style={{ display: "block", marginTop: 7, color: "var(--text-3)", fontSize: 11 }}>
              Origem registrada: {product.fonte}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
