import React, { useState } from "react";
import { X, Plus, Check, AlertTriangle, Lightbulb, Leaf, Pencil } from "lucide-react";
import { nutrientColor } from "../dashboard/nutrientColors.js";
import { concentrationUnit, doseUnit, fmtNum } from "../lib/economics.js";
import { provenanceOf } from "../lib/provenance.js";
import { positioningFor } from "../lib/catalog.js";
import DataBadge from "./DataBadge.jsx";
import { Seals } from "./ProductCard.jsx";
import CompositionEditor from "./CompositionEditor.jsx";
import { isEdited } from "../lib/overrides.js";

const NUTRIENT_LABEL = {
  N: "Nitrogênio", P2O5: "Fósforo (P₂O₅)", K2O: "Potássio (K₂O)", Ca: "Cálcio", Mg: "Magnésio",
  S: "Enxofre", B: "Boro", Cu: "Cobre", Mn: "Manganês", Zn: "Zinco", Fe: "Ferro", Mo: "Molibdênio",
  Ni: "Níquel", Co: "Cobalto", C_Org: "Carbono orgânico",
};

// Ficha técnica: tudo que o cadastro tem sobre o produto, com a origem do
// dado à vista. Campo sem informação aparece como "não informado" em vez de
// sumir — a ausência também é informação na hora de cotar.
export default function ProductSheet({ product, selected, onToggle, onClose, onEdited }) {
  const [editing, setEditing] = useState(false);
  if (!product) return null;
  const nutrients = Object.entries(product.nutrients || {})
    .filter(([, v]) => Number(v) > 0)
    .sort((a, b) => b[1] - a[1]);
  const unit = concentrationUnit(product);
  const pos = positioningFor(product.id);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(17,24,39,0.55)",
        zIndex: 80,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={`Ficha técnica de ${product.name}`}
        className="sheet-panel"
        style={{
          width: "100%",
          maxWidth: 560,
          maxHeight: "90vh",
          overflowY: "auto",
          background: "var(--surface)",
          borderRadius: "16px 16px 0 0",
          boxShadow: "var(--shadow-lg)",
          padding: 18,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div className="muted-soft" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" }}>
              {product.brand}
            </div>
            <h2 style={{ fontSize: 19, fontWeight: 700, margin: "3px 0 0", lineHeight: 1.25 }}>{product.name}</h2>
            {product.category && (
              <div className="muted" style={{ fontSize: 12.5, marginTop: 3 }}>
                {product.category}
              </div>
            )}
          </div>
          <button className="btn btn-ghost" style={{ width: 44, minHeight: 44, padding: 0, flexShrink: 0 }} onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
          <DataBadge product={product} compact />
          {isEdited(product) && (
            <span
              className="chip"
              style={{ background: "var(--warn-soft)", color: "var(--warn)", borderColor: "transparent", fontSize: 10.5 }}
              title={product.editedNote ? `Motivo: ${product.editedNote}` : "Composição editada manualmente neste aparelho"}
            >
              <Pencil size={11} /> editado por você
            </span>
          )}
          <Seals product={product} />
        </div>

        <Section
          title="Composição declarada"
          action={
            !editing && (
              <button
                className="btn btn-ghost"
                style={{ minHeight: 36, padding: "0 11px", fontSize: 12 }}
                onClick={() => setEditing(true)}
              >
                <Pencil size={13} /> {isEdited(product) ? "Editar de novo" : "Editar"}
              </button>
            )
          }
        >
          {editing ? (
            <CompositionEditor
              product={product}
              onDone={() => {
                setEditing(false);
                if (onEdited) onEdited();
              }}
              onCancel={() => setEditing(false)}
            />
          ) : nutrients.length === 0 ? (
            <p className="muted" style={{ fontSize: 13, margin: 0, lineHeight: 1.55 }}>
              {product.composition || "Sem composição nutricional cadastrada para este produto."}
            </p>
          ) : (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {nutrients.map(([k, v]) => (
                  <div key={k} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13 }}>
                    <span style={{ width: 9, height: 9, borderRadius: 2, background: nutrientColor(k), flexShrink: 0 }} />
                    <span style={{ flex: 1 }}>{NUTRIENT_LABEL[k] || k}</span>
                    <span className="tnum" style={{ fontWeight: 700 }}>
                      {fmtNum(v)} {unit}
                    </span>
                    {product.nutrientsPercent?.[k] != null && (
                      <span className="muted-soft tnum" style={{ fontSize: 11.5, width: 62, textAlign: "right" }}>
                        {fmtNum(product.nutrientsPercent[k])}% m/m
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <p className="muted-soft" style={{ fontSize: 11, marginTop: 9, lineHeight: 1.5 }}>
                {unit === "g/kg"
                  ? "Produto sólido: concentração em g/kg (percentual × 10)."
                  : `Produto líquido: concentração em g/L (percentual × densidade × 10).${product.density ? ` Densidade ${fmtNum(product.density)} kg/L.` : ""}`}
              </p>
            </>
          )}
        </Section>

        <Section title="Dose de referência">
          {product.defaultDose != null || product.doseRaw ? (
            <>
              {product.defaultDose != null && (
                <div className="tnum" style={{ fontSize: 16, fontWeight: 700 }}>
                  {fmtNum(product.defaultDose)} {doseUnit(product)}/ha
                </div>
              )}
              {product.doseRaw && (
                <p className="muted" style={{ fontSize: 12.5, margin: "4px 0 0", lineHeight: 1.5 }}>
                  Cadastrado: {product.doseRaw}
                </p>
              )}
              <p className="muted-soft" style={{ fontSize: 11, marginTop: 6, lineHeight: 1.5 }}>
                Ponto de partida extraído do material de origem — confirme na bula antes de aplicar.
              </p>
            </>
          ) : (
            <p className="muted" style={{ fontSize: 13, margin: 0, lineHeight: 1.55 }}>
              Sem dose de referência cadastrada. Informe a dose da bula ao montar o manejo.
            </p>
          )}
        </Section>

        {pos.length > 0 && (
          <Section title="Posicionamento oficial">
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {pos.map((p, i) => (
                <div key={i} style={{ padding: "9px 11px", background: "var(--surface-2)", borderRadius: "var(--radius-sm)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 600 }}>
                    <Leaf size={13} style={{ color: "var(--brand)" }} />
                    {p.culture} · {p.stage}
                  </div>
                  <div className="muted tnum" style={{ fontSize: 11.5, marginTop: 3 }}>
                    Dose oficial: {fmtNum(p.dose)} {doseUnit(product)}/ha
                  </div>
                  {p.note && (
                    <div className="muted-soft" style={{ fontSize: 11, marginTop: 3, lineHeight: 1.45 }}>
                      {p.note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {product.observations && (
          <Section title="Observações">
            <div style={{ display: "flex", gap: 8, fontSize: 12.5, lineHeight: 1.55 }}>
              <Lightbulb size={15} style={{ color: "var(--brand)", flexShrink: 0, marginTop: 1 }} />
              <span className="muted" style={{ whiteSpace: "pre-line" }}>
                {product.observations}
              </span>
            </div>
          </Section>
        )}

        {product.warning && (
          <Section title="Atenção">
            <div
              style={{
                display: "flex",
                gap: 8,
                fontSize: 12.5,
                lineHeight: 1.55,
                background: "var(--warn-soft)",
                border: "1px solid color-mix(in srgb, var(--warn) 22%, transparent)",
                borderRadius: "var(--radius-sm)",
                padding: "10px 12px",
              }}
            >
              <AlertTriangle size={15} style={{ color: "var(--warn)", flexShrink: 0, marginTop: 1 }} />
              <span style={{ whiteSpace: "pre-line" }}>{product.warning}</span>
            </div>
          </Section>
        )}

        <Section title="Origem do dado">
          <p className="muted" style={{ fontSize: 12, margin: 0, lineHeight: 1.55 }}>
            {product.fonte || "Fonte não informada."}
          </p>
          {product.source && (
            <p className="muted-soft" style={{ fontSize: 11.5, margin: "5px 0 0", lineHeight: 1.5 }}>
              Registro: {product.source}
            </p>
          )}
        </Section>

        <button
          onClick={onToggle}
          className="btn"
          style={{
            width: "100%",
            marginTop: 16,
            background: selected ? "var(--brand-soft)" : "var(--brand)",
            color: selected ? "var(--brand)" : "var(--brand-contrast)",
            border: selected ? "1px solid var(--brand)" : "1px solid transparent",
          }}
        >
          {selected ? <Check size={16} /> : <Plus size={16} />}
          {selected ? "Selecionado — remover do manejo" : "Adicionar ao manejo"}
        </button>
      </div>
    </div>
  );
}

function Section({ title, children, action }) {
  return (
    <section style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, margin: "0 0 8px" }}>
        <h3 className="muted-soft" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", margin: 0 }}>
          {title}
        </h3>
        {action}
      </div>
      {children}
    </section>
  );
}
