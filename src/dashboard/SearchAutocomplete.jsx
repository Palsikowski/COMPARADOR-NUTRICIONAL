import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, X, Plus, Check } from "lucide-react";

// Normaliza pra busca tolerante a acento/caixa ("nutrifol" acha "NUTRIFOL",
// "cálcio" acha "calcio").
function norm(s) {
  return (s || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

// Ranking: quem começa com o termo vem antes de quem só contém, e produto
// Agrocete desempata pra cima (é o portfólio que o consultor quer achar).
function scoreProduct(p, q, agroceteBrand) {
  const name = norm(p.name);
  const brand = norm(p.brand);
  let score = -1;
  if (name.startsWith(q)) score = 100;
  else if (name.includes(q)) score = 60;
  else if (brand.startsWith(q)) score = 40;
  else if (brand.includes(q)) score = 25;
  else if (norm(p.composition).includes(q)) score = 15;
  else if (norm(p.category).includes(q)) score = 10;
  if (score < 0) return -1;
  if (p.brand === agroceteBrand) score += 6;
  if (p.hasNutrients) score += 3;
  return score;
}

// Busca com autocompletar: mostra os produtos que casam enquanto digita e
// deixa adicionar direto ao manejo pelo dropdown, sem precisar abrir a marca
// na lista. Navegação por teclado (↑/↓/Enter/Esc) pra quem usa no desktop.
export default function SearchAutocomplete({
  value,
  onChange,
  products,
  selected,
  onPick,
  brandColor,
  agroceteBrand,
  placeholder,
  maxResults = 8,
}) {
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const boxRef = useRef(null);

  const q = norm(value).trim();

  const results = useMemo(() => {
    if (q.length < 2) return [];
    const scored = [];
    for (const p of products) {
      const s = scoreProduct(p, q, agroceteBrand);
      if (s >= 0) scored.push({ p, s });
      // corta cedo em catálogos grandes: 400 candidatos já dão ranking bom
      if (scored.length > 400) break;
    }
    return scored
      .sort((a, b) => b.s - a.s || a.p.name.localeCompare(b.p.name))
      .slice(0, maxResults)
      .map((x) => x.p);
  }, [q, products, agroceteBrand, maxResults]);

  useEffect(() => {
    setCursor(0);
  }, [q]);

  // Fecha ao clicar fora.
  useEffect(() => {
    function onDocClick(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const showList = open && results.length > 0;

  function handleKeyDown(e) {
    if (!showList) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => (c + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => (c - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const p = results[cursor];
      if (p) {
        onPick(p);
        setOpen(false);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={boxRef} style={{ position: "relative" }}>
      <Search size={15} color="#8CA0AF" style={{ position: "absolute", left: 12, top: 13, pointerEvents: "none" }} />
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "12px 38px 12px 34px",
          minHeight: 48,
          borderRadius: 10,
          border: `1px solid ${showList ? "#1FBF8F66" : "#24313D"}`,
          background: "#17212B",
          color: "#E8EDF1",
          fontSize: 14,
          boxSizing: "border-box",
          fontFamily: "inherit",
        }}
      />
      {value && (
        <button
          onClick={() => {
            onChange("");
            setOpen(false);
          }}
          className="tap-scale"
          aria-label="Limpar busca"
          style={{
            position: "absolute",
            right: 6,
            top: 6,
            width: 36,
            height: 36,
            borderRadius: 8,
            border: "none",
            background: "transparent",
            color: "#8CA0AF",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <X size={15} />
        </button>
      )}

      {showList && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            zIndex: 50,
            background: "#101A22",
            border: "1px solid #24313D",
            borderRadius: 10,
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            overflow: "hidden",
            maxHeight: 340,
            overflowY: "auto",
          }}
        >
          {results.map((p, i) => {
            const isSel = !!selected[p.id];
            const color = brandColor(p.brand);
            return (
              <button
                key={p.id}
                onMouseEnter={() => setCursor(i)}
                onClick={() => {
                  onPick(p);
                  setOpen(false);
                }}
                className="tap-scale"
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: "10px 12px",
                  minHeight: 48,
                  background: i === cursor ? "#17212B" : "transparent",
                  border: "none",
                  borderBottom: "1px solid #1A2530",
                  cursor: "pointer",
                  textAlign: "left",
                  color: "#E8EDF1",
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.name}
                  </span>
                  <span className="muted-soft" style={{ fontSize: 10.5 }}>
                    {p.brand}
                    {p.category ? ` · ${p.category}` : ""}
                    {!p.hasNutrients ? " · sem dados nutricionais" : ""}
                  </span>
                </span>
                <span
                  style={{
                    flexShrink: 0,
                    width: 26,
                    height: 26,
                    borderRadius: 7,
                    background: isSel ? `${color}22` : "#17212B",
                    border: `1px solid ${isSel ? color : "#24313D"}`,
                    color: isSel ? color : "#8CA0AF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isSel ? <Check size={13} /> : <Plus size={13} />}
                </span>
              </button>
            );
          })}
          <div className="muted-soft" style={{ fontSize: 10, padding: "7px 12px", background: "#0D151C" }}>
            Toque num produto pra adicionar/remover do manejo · ↑ ↓ e Enter no teclado
          </div>
        </div>
      )}
    </div>
  );
}
