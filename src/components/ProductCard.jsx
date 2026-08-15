import React from "react";
import { Plus, Check, FileText } from "lucide-react";
import { nutrientColor, nutrientShort } from "../dashboard/nutrientColors.js";
import { sealsFor, SEAL_STYLES } from "../lib/seals.js";
import { concentrationUnit, fmtNum } from "../lib/economics.js";
import { provenanceOf } from "../lib/provenance.js";

// Composição resumida: os nutrientes mais concentrados primeiro, com a
// unidade explícita (g/L pra líquido, g/kg pra sólido) — sem unidade o número
// não quer dizer nada.
function TopNutrients({ product, max = 4, compact = false }) {
  const unit = concentrationUnit(product);
  const entries = Object.entries(product.nutrients || {})
    .filter(([, v]) => Number(v) > 0)
    .sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) {
    return (
      <div className="muted-soft" style={{ fontSize: compact ? 11.5 : 12, lineHeight: 1.45 }}>
        {product.composition || "Sem composição nutricional cadastrada"}
      </div>
    );
  }

  const shown = entries.slice(0, max);
  const rest = entries.length - shown.length;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
      {shown.map(([k, v]) => {
        const c = nutrientColor(k);
        return (
          <span
            key={k}
            title={`${k}: ${fmtNum(v)} ${unit}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              background: `color-mix(in srgb, ${c} 12%, transparent)`,
              border: `1px solid color-mix(in srgb, ${c} 34%, transparent)`,
              color: c,
              borderRadius: "var(--radius-pill)",
              padding: compact ? "1px 6px" : "2px 7px",
              fontSize: compact ? 10.5 : 11,
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            {nutrientShort(k)}
            <span style={{ fontWeight: 600 }}>
              {fmtNum(v)} {unit}
            </span>
          </span>
        );
      })}
      {rest > 0 && (
        <span className="muted-soft" style={{ fontSize: compact ? 10.5 : 11, fontWeight: 700, alignSelf: "center" }}>
          +{rest}
        </span>
      )}
    </div>
  );
}

function Seals({ product, compact }) {
  const seals = sealsFor(product);
  if (seals.length === 0) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
      {seals.map((s) => {
        const st = SEAL_STYLES[s.tone] || SEAL_STYLES.neutral;
        return (
          <span
            key={s.id}
            style={{
              background: st.bg,
              color: st.fg,
              borderRadius: "var(--radius-pill)",
              padding: compact ? "1px 6px" : "2px 8px",
              fontSize: compact ? 10 : 10.5,
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            {s.label}
          </span>
        );
      })}
    </div>
  );
}

// ---------- CARD (grade) ----------
export function ProductGridCard({ product, selected, onToggle, onOpenSheet }) {
  return (
    <article
      className="card product-card"
      style={{ padding: 14, display: "flex", flexDirection: "column", gap: 9, height: "100%" }}
    >
      <header style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span
            style={{
              background: "var(--surface-2)",
              color: "var(--text-2)",
              borderRadius: "var(--radius-pill)",
              padding: "2px 8px",
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: "0.02em",
              maxWidth: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {product.brand}
          </span>
        </div>
        <h3
          style={{
            fontSize: 15,
            fontWeight: 600,
            margin: 0,
            lineHeight: 1.3,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
          title={product.name}
        >
          {product.name}
        </h3>
        {product.category && (
          <span className="muted-soft" style={{ fontSize: 11, lineHeight: 1.3 }}>
            {product.category}
          </span>
        )}
      </header>

      <div style={{ overflow: "hidden" }}>
        <TopNutrients product={product} max={4} />
      </div>
      <Seals product={product} />

      <div style={{ marginTop: "auto", display: "flex", gap: 7, alignItems: "center" }}>
        <button
          onClick={onToggle}
          className="btn"
          style={{
            flex: 1,
            minHeight: 44,
            fontSize: 12.5,
            background: selected ? "var(--brand-soft)" : "var(--brand)",
            color: selected ? "var(--brand)" : "var(--brand-contrast)",
            border: selected ? "1px solid var(--brand)" : "1px solid transparent",
          }}
          aria-pressed={selected}
        >
          {selected ? <Check size={15} /> : <Plus size={15} />}
          {selected ? "Selecionado" : "Adicionar"}
        </button>
        <button
          onClick={onOpenSheet}
          className="btn btn-ghost"
          style={{ width: 44, minHeight: 44, padding: 0, flexShrink: 0 }}
          aria-label={`Ficha técnica de ${product.name}`}
          title="Ficha técnica"
        >
          <FileText size={16} />
        </button>
      </div>
    </article>
  );
}

// ---------- LINHA (lista compacta) ----------
export function ProductListRow({ product, selected, onToggle, onOpenSheet }) {
  return (
    <article
      className="card product-list-row"
      style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
          <span
            style={{ fontSize: 13.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            title={product.name}
          >
            {product.name}
          </span>
          <span className="muted-soft" style={{ fontSize: 10.5, fontWeight: 700 }}>
            {product.brand}
          </span>
        </div>
        <div style={{ marginTop: 4 }}>
          <TopNutrients product={product} max={3} compact />
        </div>
      </div>
      <button
        onClick={onOpenSheet}
        className="btn btn-ghost"
        style={{ width: 40, minHeight: 40, padding: 0, flexShrink: 0 }}
        aria-label={`Ficha técnica de ${product.name}`}
        title="Ficha técnica"
      >
        <FileText size={15} />
      </button>
      <button
        onClick={onToggle}
        className="btn"
        style={{
          width: 44,
          minHeight: 44,
          padding: 0,
          flexShrink: 0,
          background: selected ? "var(--brand-soft)" : "var(--brand)",
          color: selected ? "var(--brand)" : "var(--brand-contrast)",
          border: selected ? "1px solid var(--brand)" : "1px solid transparent",
        }}
        aria-pressed={selected}
        aria-label={selected ? `Remover ${product.name} do manejo` : `Adicionar ${product.name} ao manejo`}
      >
        {selected ? <Check size={17} /> : <Plus size={17} />}
      </button>
    </article>
  );
}

export { TopNutrients, Seals };
