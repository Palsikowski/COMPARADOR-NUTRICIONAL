import React, { useEffect, useMemo, useState } from "react";
import { Sprout, Plus, Copy, Trash2, Pencil, FileText, Lock, X, Check, ChevronDown, ChevronUp } from "lucide-react";
import {
  loadCustom,
  saveCustom,
  allManagements,
  duplicateManagement,
  emptyManagement,
  genId,
  totalsByProduct,
  toSelection,
} from "../lib/managements.js";
import { PRODUCTS_BY_ID } from "../lib/catalog.js";
import { PRODUCTS } from "../data/products.js";
import { doseUnit, fmtNum } from "../lib/economics.js";
import { exportCaderno } from "../lib/caderno.js";
import { provenanceOf } from "../lib/provenance.js";

// MANEJOS AGROCETE: posicionamento rápido por cultura.
// Os manejos oficiais vêm dos materiais da Agrocete e não podem ser alterados;
// editar cria uma cópia sua. Daqui sai o caderno em PDF pra apresentar.
export default function Managements({ onLoadIntoCatalog }) {
  const [custom, setCustom] = useState(() => loadCustom());
  const [openId, setOpenId] = useState(null);
  const [editing, setEditing] = useState(null); // cópia em edição
  const [client, setClient] = useState("");

  useEffect(() => saveCustom(custom), [custom]);

  const list = useMemo(() => allManagements(custom), [custom]);

  function startEdit(mng) {
    if (mng.official) {
      const copy = duplicateManagement(mng);
      setEditing(copy);
    } else {
      setEditing(JSON.parse(JSON.stringify(mng)));
    }
  }

  function saveEditing() {
    setCustom((prev) => {
      const exists = prev.some((m) => m.id === editing.id);
      return exists ? prev.map((m) => (m.id === editing.id ? editing : m)) : [...prev, editing];
    });
    setOpenId(editing.id);
    setEditing(null);
  }

  function removeCustom(id) {
    setCustom((prev) => prev.filter((m) => m.id !== id));
    if (openId === id) setOpenId(null);
  }

  if (editing) {
    return <Editor mng={editing} setMng={setEditing} onSave={saveEditing} onCancel={() => setEditing(null)} />;
  }

  return (
    <div className="shell" style={{ paddingTop: 26, paddingBottom: 80 }}>
      <header style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>Manejos Agrocete</h1>
        <p className="muted" style={{ fontSize: 14.5, margin: "6px 0 0", maxWidth: 720, lineHeight: 1.5 }}>
          Posicionamento por cultura e estádio, direto dos materiais oficiais. Os oficiais não podem ser alterados —
          editar cria uma cópia sua neste aparelho. De qualquer manejo sai um caderno em PDF para apresentar.
        </p>
      </header>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        <button className="btn btn-primary" onClick={() => setEditing(emptyManagement())}>
          <Plus size={15} /> Criar manejo do zero
        </button>
        <label style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 220 }}>
          <span className="muted" style={{ fontSize: 12, whiteSpace: "nowrap" }}>
            Cliente / fazenda
          </span>
          <input
            className="input"
            style={{ minHeight: 44 }}
            value={client}
            onChange={(e) => setClient(e.target.value)}
            placeholder="Aparece na capa do caderno"
            aria-label="Cliente ou fazenda"
          />
        </label>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {list.map((mng) => (
          <ManagementCard
            key={mng.id}
            mng={mng}
            open={openId === mng.id}
            onToggle={() => setOpenId(openId === mng.id ? null : mng.id)}
            onEdit={() => startEdit(mng)}
            onDuplicate={() => {
              const copy = duplicateManagement(mng);
              setCustom((prev) => [...prev, copy]);
              setOpenId(copy.id);
            }}
            onRemove={mng.official ? null : () => removeCustom(mng.id)}
            onCaderno={() => exportCaderno(mng, { client, area: 1 })}
            onLoad={() => onLoadIntoCatalog(toSelection(mng))}
          />
        ))}
      </div>
    </div>
  );
}

function ManagementCard({ mng, open, onToggle, onEdit, onDuplicate, onRemove, onCaderno, onLoad }) {
  const totals = totalsByProduct(mng);
  const count = Object.keys(totals).length;

  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 16px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          font: "inherit",
          color: "var(--text)",
        }}
      >
        <span
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "var(--brand-soft)",
            color: "var(--brand)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Sprout size={17} />
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
            <span style={{ fontSize: 15.5, fontWeight: 700 }}>{mng.name}</span>
            {mng.official ? (
              <span className="chip" style={{ background: "var(--brand-soft)", color: "var(--brand)", borderColor: "transparent", fontSize: 10.5 }}>
                <Lock size={11} /> oficial
              </span>
            ) : (
              <span className="chip" style={{ fontSize: 10.5 }}>seu manejo</span>
            )}
          </span>
          <span className="muted" style={{ display: "block", fontSize: 12.5, marginTop: 2 }}>
            {mng.stages.length} etapa{mng.stages.length > 1 ? "s" : ""} · {count} produto{count > 1 ? "s" : ""}
          </span>
        </span>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {open && (
        <div style={{ padding: "0 16px 16px" }}>
          {mng.source && (
            <p className="muted-soft" style={{ fontSize: 11.5, margin: "0 0 12px", lineHeight: 1.5 }}>
              {mng.source}
            </p>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {mng.stages.map((stage, i) => (
              <div key={stage.id} style={{ background: "var(--surface-2)", borderRadius: "var(--radius-sm)", padding: 12, border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 6,
                      background: "var(--brand)",
                      color: "var(--brand-contrast)",
                      fontSize: 11,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span style={{ fontSize: 13.5, fontWeight: 700 }}>{stage.label}</span>
                </div>
                {stage.items.length === 0 ? (
                  <div className="muted-soft" style={{ fontSize: 12 }}>
                    Nenhum produto nesta etapa.
                  </div>
                ) : (
                  stage.items.map((item, j) => {
                    const p = PRODUCTS_BY_ID.get(item.productId);
                    return (
                      <div key={j} style={{ padding: "6px 0", borderTop: j > 0 ? "1px solid var(--border)" : "none" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 13 }}>
                          <span style={{ fontWeight: 600, minWidth: 0 }}>{p ? p.name : item.productId}</span>
                          <span className="tnum" style={{ flexShrink: 0, fontWeight: 600 }}>
                            {fmtNum(item.dose)} {p ? doseUnit(p) : ""}/ha
                          </span>
                        </div>
                        {item.note && (
                          <div className="muted-soft" style={{ fontSize: 11.5, marginTop: 2, lineHeight: 1.45 }}>
                            {item.note}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
            <button className="btn btn-primary" style={{ minHeight: 44 }} onClick={onCaderno}>
              <FileText size={15} /> Gerar caderno (PDF)
            </button>
            <button className="btn btn-ghost" style={{ minHeight: 44 }} onClick={onLoad}>
              Carregar no catálogo
            </button>
            <button className="btn btn-ghost" style={{ minHeight: 44 }} onClick={onEdit}>
              <Pencil size={14} /> {mng.official ? "Editar (cria cópia)" : "Editar"}
            </button>
            <button className="btn btn-ghost" style={{ minHeight: 44 }} onClick={onDuplicate}>
              <Copy size={14} /> Duplicar
            </button>
            {onRemove && (
              <button
                className="btn btn-ghost"
                style={{ minHeight: 44, color: "var(--danger)" }}
                onClick={() => {
                  if (window.confirm(`Excluir o manejo "${mng.name}"? Isso não pode ser desfeito.`)) onRemove();
                }}
              >
                <Trash2 size={14} /> Excluir
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- EDITOR ----------

function Editor({ mng, setMng, onSave, onCancel }) {
  function setStage(idx, patch) {
    setMng({ ...mng, stages: mng.stages.map((s, i) => (i === idx ? { ...s, ...patch } : s)) });
  }
  function addStage() {
    setMng({ ...mng, stages: [...mng.stages, { id: genId(), label: `Etapa ${mng.stages.length + 1}`, items: [] }] });
  }
  function removeStage(idx) {
    setMng({ ...mng, stages: mng.stages.filter((_, i) => i !== idx) });
  }
  function moveStage(idx, dir) {
    const next = [...mng.stages];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    setMng({ ...mng, stages: next });
  }
  function addItem(stageIdx, product) {
    const stage = mng.stages[stageIdx];
    if (stage.items.some((i) => i.productId === product.id)) return;
    setStage(stageIdx, {
      items: [...stage.items, { productId: product.id, dose: product.defaultDose ?? 0, note: "" }],
    });
  }
  function setItem(stageIdx, itemIdx, patch) {
    const stage = mng.stages[stageIdx];
    setStage(stageIdx, { items: stage.items.map((it, i) => (i === itemIdx ? { ...it, ...patch } : it)) });
  }
  function removeItem(stageIdx, itemIdx) {
    const stage = mng.stages[stageIdx];
    setStage(stageIdx, { items: stage.items.filter((_, i) => i !== itemIdx) });
  }

  const canSave = mng.name.trim().length > 0;

  return (
    <div className="shell" style={{ paddingTop: 26, paddingBottom: 90 }}>
      <header style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 23, fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>Editar manejo</h1>
        {mng.basedOn && (
          <p className="muted" style={{ fontSize: 13, margin: "6px 0 0" }}>
            Cópia baseada em <strong>{mng.basedOn}</strong> — o manejo oficial continua intacto.
          </p>
        )}
      </header>

      <label style={{ display: "block", marginBottom: 16 }}>
        <span className="muted" style={{ fontSize: 12, display: "block", marginBottom: 5 }}>
          Nome do manejo
        </span>
        <input className="input" value={mng.name} onChange={(e) => setMng({ ...mng, name: e.target.value })} aria-label="Nome do manejo" />
      </label>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {mng.stages.map((stage, si) => (
          <section key={stage.id} className="card" style={{ padding: 14 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
              <input
                className="input"
                style={{ minHeight: 44, fontWeight: 600 }}
                value={stage.label}
                onChange={(e) => setStage(si, { label: e.target.value })}
                aria-label={`Nome da etapa ${si + 1}`}
                placeholder="Ex: V3–V5, Florescimento..."
              />
              <button className="btn btn-ghost" style={{ width: 44, minHeight: 44, padding: 0 }} onClick={() => moveStage(si, -1)} aria-label="Mover etapa para cima" disabled={si === 0}>
                <ChevronUp size={16} />
              </button>
              <button className="btn btn-ghost" style={{ width: 44, minHeight: 44, padding: 0 }} onClick={() => moveStage(si, 1)} aria-label="Mover etapa para baixo" disabled={si === mng.stages.length - 1}>
                <ChevronDown size={16} />
              </button>
              <button className="btn btn-ghost" style={{ width: 44, minHeight: 44, padding: 0, color: "var(--danger)" }} onClick={() => removeStage(si)} aria-label="Remover etapa">
                <Trash2 size={15} />
              </button>
            </div>

            {stage.items.map((item, ii) => {
              const p = PRODUCTS_BY_ID.get(item.productId);
              return (
                <div key={ii} style={{ padding: "10px 0", borderTop: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 7 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600, minWidth: 0 }}>{p ? p.name : item.productId}</span>
                    <button className="btn btn-ghost" style={{ width: 40, minHeight: 40, padding: 0, color: "var(--danger)", flexShrink: 0 }} onClick={() => removeItem(si, ii)} aria-label="Remover produto">
                      <X size={15} />
                    </button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "130px 1fr", gap: 8 }}>
                    <label>
                      <span className="muted-soft" style={{ fontSize: 11, display: "block", marginBottom: 3 }}>
                        Dose ({p ? doseUnit(p) : "un"}/ha)
                      </span>
                      <input
                        className="input tnum"
                        style={{ minHeight: 44 }}
                        type="number"
                        step="0.001"
                        min="0"
                        inputMode="decimal"
                        value={item.dose}
                        onChange={(e) => setItem(si, ii, { dose: e.target.value === "" ? "" : Number(e.target.value) })}
                        aria-label={`Dose de ${p ? p.name : "produto"}`}
                      />
                    </label>
                    <label>
                      <span className="muted-soft" style={{ fontSize: 11, display: "block", marginBottom: 3 }}>
                        Observação (aparece no caderno)
                      </span>
                      <input
                        className="input"
                        style={{ minHeight: 44 }}
                        value={item.note || ""}
                        onChange={(e) => setItem(si, ii, { note: e.target.value })}
                        placeholder="Ex: TS 2 mL/kg de semente"
                        aria-label="Observação do produto"
                      />
                    </label>
                  </div>
                </div>
              );
            })}

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10, marginTop: stage.items.length ? 0 : 4 }}>
              <ProductPicker onPick={(p) => addItem(si, p)} />
            </div>
          </section>
        ))}
      </div>

      <button className="btn btn-ghost" style={{ marginTop: 12, width: "100%" }} onClick={addStage}>
        <Plus size={15} /> Adicionar etapa
      </button>

      <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={onSave} disabled={!canSave}>
          <Check size={16} /> Salvar manejo
        </button>
        <button className="btn btn-ghost" onClick={onCancel}>
          Cancelar
        </button>
      </div>
      <p className="muted-soft" style={{ fontSize: 11.5, marginTop: 10, lineHeight: 1.5 }}>
        O manejo fica salvo no navegador deste aparelho — não sincroniza entre pessoas nem dispositivos.
      </p>
    </div>
  );
}

function ProductPicker({ onPick }) {
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (t.length < 2) return [];
    return PRODUCTS.filter((p) => p.name.toLowerCase().includes(t) || p.brand.toLowerCase().includes(t)).slice(0, 6);
  }, [q]);

  return (
    <div>
      <input
        className="input"
        style={{ minHeight: 44 }}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Adicionar produto nesta etapa..."
        aria-label="Adicionar produto"
      />
      {results.length > 0 && (
        <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 4 }}>
          {results.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                onPick(p);
                setQ("");
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                minHeight: 44,
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--surface-2)",
                cursor: "pointer",
                font: "inherit",
                color: "var(--text)",
                textAlign: "left",
              }}
            >
              <span style={{ minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 13, fontWeight: 600 }}>{p.name}</span>
                <span className="muted-soft" style={{ fontSize: 11 }}>
                  {p.brand} · {provenanceOf(p).short}
                </span>
              </span>
              <Plus size={15} style={{ flexShrink: 0, color: "var(--brand)" }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
