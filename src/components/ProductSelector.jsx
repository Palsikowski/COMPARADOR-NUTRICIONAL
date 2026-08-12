import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import { PRODUCTS } from "../data/products.js";
import { AGROCETE } from "../lib/catalog.js";
import { isComparable, provenanceOf } from "../lib/provenance.js";
import DataBadge from "./DataBadge.jsx";

function norm(s) {
  return (s || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function score(p, q) {
  const name = norm(p.name);
  let s = -1;
  if (name.startsWith(q)) s = 100;
  else if (name.includes(q)) s = 60;
  else if (norm(p.brand).startsWith(q)) s = 40;
  else if (norm(p.brand).includes(q)) s = 25;
  else if (norm(p.composition).includes(q)) s = 12;
  if (s < 0) return -1;
  if (p.brand === AGROCETE) s += 6;
  if (isComparable(p)) s += 4;
  return s;
}

// Campo de seleção de um produto para a comparação. Mostra marca, categoria e
// o selo de procedência já na lista, pra a escolha ser informada desde o
// início — e marca claramente quem não tem composição cadastrada.
export default function ProductSelector({ value, onChange, label, accent = "var(--brand)", autoFocus = false }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const boxRef = useRef(null);

  const query = norm(q).trim();
  const results = useMemo(() => {
    if (query.length < 2) return [];
    const out = [];
    for (const p of PRODUCTS) {
      const s = score(p, query);
      if (s >= 0) out.push({ p, s });
    }
    return out
      .sort((a, b) => b.s - a.s || a.p.name.localeCompare(b.p.name))
      .slice(0, 10)
      .map((x) => x.p);
  }, [query]);

  useEffect(() => setCursor(0), [query]);

  useEffect(() => {
    function onDoc(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function pick(p) {
    onChange(p);
    setQ("");
    setOpen(false);
  }

  function onKeyDown(e) {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => (c + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => (c - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[cursor]) pick(results[cursor]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  // Produto já escolhido: vira um cartão com o resumo e o botão de trocar.
  if (value) {
    return (
      <div className="card" style={{ padding: 14, borderTop: `3px solid ${accent}` }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
          <div style={{ minWidth: 0 }}>
            <div className="muted-soft" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              {label}
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, marginTop: 3, lineHeight: 1.25 }}>{value.name}</div>
            <div className="muted" style={{ fontSize: 12.5, marginTop: 3 }}>
              {value.brand}
              {value.category ? ` · ${value.category}` : ""}
            </div>
            <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
              <DataBadge product={value} compact />
              {!isComparable(value) && (
                <span
                  className="chip"
                  style={{ background: "var(--warn-soft)", color: "var(--warn)", borderColor: "transparent" }}
                >
                  sem composição cadastrada
                </span>
              )}
            </div>
          </div>
          <button className="btn btn-ghost" style={{ minHeight: 40, padding: "0 12px", fontSize: 13 }} onClick={() => onChange(null)}>
            Trocar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={boxRef} className="card" style={{ padding: 14, borderTop: `3px solid ${accent}`, position: "relative" }}>
      <div className="muted-soft" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ position: "relative" }}>
        <Search size={16} style={{ position: "absolute", left: 12, top: 16, color: "var(--text-3)", pointerEvents: "none" }} />
        <input
          className="input"
          style={{ paddingLeft: 36 }}
          value={q}
          autoFocus={autoFocus}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Pesquisar produto ou empresa..."
          aria-label={label}
        />
        {q && (
          <button
            onClick={() => setQ("")}
            aria-label="Limpar"
            style={{
              position: "absolute",
              right: 6,
              top: 6,
              width: 36,
              height: 36,
              border: "none",
              background: "transparent",
              color: "var(--text-3)",
              cursor: "pointer",
              borderRadius: 8,
            }}
          >
            <X size={15} />
          </button>
        )}
      </div>

      {open && query.length >= 2 && (
        <div
          style={{
            position: "absolute",
            left: 14,
            right: 14,
            top: "calc(100% - 4px)",
            zIndex: 50,
            background: "var(--surface)",
            border: "1px solid var(--border-strong)",
            borderRadius: "var(--radius-sm)",
            boxShadow: "var(--shadow-lg)",
            maxHeight: 320,
            overflowY: "auto",
          }}
        >
          {results.length === 0 ? (
            <div style={{ padding: "16px 14px" }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>Nenhum produto encontrado</div>
              <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                Tente buscar pelo nome da empresa, nutriente ou parte do nome do produto.
              </div>
            </div>
          ) : (
            results.map((p, i) => (
              <button
                key={p.id}
                onMouseEnter={() => setCursor(i)}
                onClick={() => pick(p)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  minHeight: 52,
                  background: i === cursor ? "var(--surface-2)" : "transparent",
                  border: "none",
                  borderBottom: "1px solid var(--border)",
                  cursor: "pointer",
                  textAlign: "left",
                  font: "inherit",
                  color: "var(--text)",
                }}
              >
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 13.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.name}
                  </span>
                  <span className="muted-soft" style={{ fontSize: 11.5 }}>
                    {p.brand}
                    {p.category ? ` · ${p.category}` : ""}
                  </span>
                </span>
                <span
                  className="chip"
                  style={{
                    fontSize: 10,
                    padding: "2px 7px",
                    background: isComparable(p) ? "var(--ok-soft)" : "var(--warn-soft)",
                    color: isComparable(p) ? "var(--ok)" : "var(--warn)",
                    borderColor: "transparent",
                    flexShrink: 0,
                  }}
                >
                  {isComparable(p) ? `${Object.keys(p.nutrients).length} nutrientes` : "sem composição"}
                </span>
              </button>
            ))
          )}
        </div>
      )}
      {query.length > 0 && query.length < 2 && (
        <div className="muted-soft" style={{ fontSize: 11.5, marginTop: 7 }}>
          Digite pelo menos 2 letras.
        </div>
      )}
    </div>
  );
}
