import React, { useMemo, useState } from "react";
import { Plus, Trash2, Check, RotateCcw, AlertTriangle } from "lucide-react";
import { nutrientColor } from "../dashboard/nutrientColors.js";
import { saveOverride, clearOverride, originalOf, isEdited } from "../lib/overrides.js";
import { fmtNum } from "../lib/economics.js";

const NUTRIENTS = [
  ["N", "Nitrogênio"], ["P2O5", "Fósforo (P₂O₅)"], ["K2O", "Potássio (K₂O)"], ["Ca", "Cálcio"],
  ["Mg", "Magnésio"], ["S", "Enxofre"], ["B", "Boro"], ["Cu", "Cobre"], ["Mn", "Manganês"],
  ["Zn", "Zinco"], ["Fe", "Ferro"], ["Mo", "Molibdênio"], ["Ni", "Níquel"], ["Co", "Cobalto"],
  ["Cl", "Cloro"], ["C_Org", "Carbono orgânico"],
];
const LABEL = Object.fromEntries(NUTRIENTS);

// Editor manual da composição.
//
// A concentração é digitada na MESMA unidade que o app mostra e usa nas
// contas (g/L pra líquido, g/kg pra sólido) — pedir %m/m obrigaria o usuário
// a converter de cabeça e é onde o erro entra. O %m/m é recalculado sozinho
// quando há densidade.
export default function CompositionEditor({ product, onDone, onCancel }) {
  const [unit, setUnit] = useState(product.unit === "kg/ha" ? "kg/ha" : "L/ha");
  const [density, setDensity] = useState(product.density ?? "");
  const [note, setNote] = useState(product.editedNote || "");
  const [rows, setRows] = useState(() =>
    Object.entries(product.nutrients || {})
      .filter(([, v]) => Number(v) > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => ({ key: k, value: String(v) }))
  );

  const concUnit = unit === "kg/ha" ? "g/kg" : "g/L";
  const original = originalOf(product.id);
  const edited = isEdited(product);

  const used = useMemo(() => new Set(rows.map((r) => r.key)), [rows]);
  const available = NUTRIENTS.filter(([k]) => !used.has(k));

  const duplicated = rows.length !== used.size;
  const invalid = rows.some((r) => !r.key || !(Number(r.value) > 0));
  const needsDensity = unit === "L/ha" && !(Number(density) > 0);

  function setRow(i, patch) {
    setRows((prev) => prev.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  }
  function addRow() {
    const next = available[0];
    if (!next) return;
    setRows((prev) => [...prev, { key: next[0], value: "" }]);
  }
  function removeRow(i) {
    setRows((prev) => prev.filter((_, j) => j !== i));
  }

  function save() {
    const nutrients = {};
    rows.forEach((r) => {
      const n = Number(r.value);
      if (r.key && Number.isFinite(n) && n > 0) nutrients[r.key] = n;
    });
    saveOverride(product.id, { nutrients, unit, density: density === "" ? null : Number(density), note });
    onDone();
  }

  function restore() {
    if (!window.confirm("Descartar suas alterações e voltar aos valores originais do catálogo?")) return;
    clearOverride(product.id);
    onDone();
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 9,
          padding: "11px 13px",
          borderRadius: "var(--radius-sm)",
          background: "var(--info-soft)",
          border: "1px solid color-mix(in srgb, var(--info) 15%, transparent)",
          fontSize: 12.5,
          lineHeight: 1.55,
          marginBottom: 14,
        }}
      >
        <AlertTriangle size={15} style={{ color: "var(--info)", flexShrink: 0, marginTop: 1 }} />
        <span className="muted">
          A edição vale <strong>neste aparelho</strong> e passa a ser usada em todo o app — comparativo, custo por
          nutriente e caderno. O catálogo original não é alterado e dá pra voltar a ele quando quiser.
        </span>
      </div>

      {/* apresentação e densidade definem a unidade da concentração */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <label>
          <span className="muted" style={{ fontSize: 11.5, display: "block", marginBottom: 4 }}>
            Apresentação
          </span>
          <select className="input" style={{ minHeight: 44 }} value={unit} onChange={(e) => setUnit(e.target.value)} aria-label="Apresentação do produto">
            <option value="L/ha">Líquido (g/L)</option>
            <option value="kg/ha">Sólido (g/kg)</option>
          </select>
        </label>
        <label>
          <span className="muted" style={{ fontSize: 11.5, display: "block", marginBottom: 4 }}>
            Densidade (kg/L)
          </span>
          <input
            className="input tnum"
            style={{ minHeight: 44 }}
            type="number"
            step="0.001"
            min="0"
            inputMode="decimal"
            value={density ?? ""}
            onChange={(e) => setDensity(e.target.value)}
            placeholder={unit === "kg/ha" ? "não se aplica" : "ex: 1,25"}
            disabled={unit === "kg/ha"}
            aria-label="Densidade"
          />
        </label>
      </div>

      <div className="muted-soft" style={{ fontSize: 11, marginBottom: 9, lineHeight: 1.5 }}>
        Informe a concentração em <strong>{concUnit}</strong>
        {unit === "L/ha"
          ? " — é a unidade que o app usa nas contas. Com a densidade preenchida, o %m/m é calculado sozinho."
          : " — para sólidos, %m/m = valor ÷ 10."}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {rows.map((r, i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ width: 9, height: 9, borderRadius: 2, background: nutrientColor(r.key), flexShrink: 0 }} />
            <select
              className="input"
              style={{ minHeight: 44, flex: 1, minWidth: 0 }}
              value={r.key}
              onChange={(e) => setRow(i, { key: e.target.value })}
              aria-label={`Nutriente da linha ${i + 1}`}
            >
              {NUTRIENTS.map(([k, label]) => (
                <option key={k} value={k} disabled={used.has(k) && k !== r.key}>
                  {label}
                </option>
              ))}
            </select>
            <input
              className="input tnum"
              style={{ minHeight: 44, width: 110 }}
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              value={r.value}
              onChange={(e) => setRow(i, { value: e.target.value })}
              placeholder={concUnit}
              aria-label={`Concentração de ${LABEL[r.key] || r.key} em ${concUnit}`}
            />
            <button
              className="btn btn-ghost"
              style={{ width: 44, minHeight: 44, padding: 0, flexShrink: 0, color: "var(--danger)" }}
              onClick={() => removeRow(i)}
              aria-label={`Remover ${LABEL[r.key] || r.key}`}
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      {rows.length === 0 && (
        <p className="muted" style={{ fontSize: 12.5, margin: "4px 0 0", lineHeight: 1.5 }}>
          Sem nutrientes. Adicione ao menos um, ou salve assim para registrar que o produto não tem composição
          nutricional declarada.
        </p>
      )}

      <button className="btn btn-ghost" style={{ width: "100%", marginTop: 10 }} onClick={addRow} disabled={available.length === 0}>
        <Plus size={15} /> Adicionar nutriente
      </button>

      <label style={{ display: "block", marginTop: 14 }}>
        <span className="muted" style={{ fontSize: 11.5, display: "block", marginBottom: 4 }}>
          Motivo da alteração (opcional)
        </span>
        <input
          className="input"
          style={{ minHeight: 44 }}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ex: ficha técnica 2026 do fabricante"
          aria-label="Motivo da alteração"
        />
      </label>

      {(invalid || duplicated || needsDensity) && (
        <div
          style={{
            marginTop: 12,
            padding: "10px 12px",
            borderRadius: "var(--radius-sm)",
            background: "var(--warn-soft)",
            border: "1px solid color-mix(in srgb, var(--warn) 22%, transparent)",
            fontSize: 12.5,
            lineHeight: 1.5,
          }}
        >
          {duplicated && <div>Há nutrientes repetidos — cada um pode aparecer uma vez só.</div>}
          {invalid && <div>Toda linha precisa de um valor maior que zero (ou remova a linha).</div>}
          {needsDensity && <div>Produto líquido sem densidade: o %m/m não será calculado, mas o g/L será salvo.</div>}
        </div>
      )}

      {original && edited && (
        <div style={{ marginTop: 12, padding: "10px 12px", background: "var(--surface-2)", borderRadius: "var(--radius-sm)" }}>
          <div className="muted-soft" style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 }}>
            Valores originais do catálogo
          </div>
          <div className="muted tnum" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
            {Object.keys(original.nutrients || {}).length === 0
              ? "Sem composição cadastrada."
              : Object.entries(original.nutrients)
                  .sort((a, b) => b[1] - a[1])
                  .map(([k, v]) => `${LABEL[k] || k} ${fmtNum(v)} ${original.unit === "kg/ha" ? "g/kg" : "g/L"}`)
                  .join(" · ")}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={save} disabled={invalid || duplicated}>
          <Check size={16} /> Salvar composição
        </button>
        <button className="btn btn-ghost" onClick={onCancel}>
          Cancelar
        </button>
      </div>

      {edited && (
        <button className="btn btn-ghost" style={{ width: "100%", marginTop: 8, color: "var(--danger)" }} onClick={restore}>
          <RotateCcw size={15} /> Voltar ao original do catálogo
        </button>
      )}
    </div>
  );
}
