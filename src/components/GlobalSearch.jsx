import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, X, Package, Building2, Sprout, Beaker, CornerDownLeft } from "lucide-react";
import { searchAll, AGROCETE } from "../lib/catalog.js";
import { NUTRIENT_LABEL } from "../lib/nutrientLabels.js";
import { concentrationUnit, fmtNum } from "../lib/economics.js";

// Busca global, aberta de qualquer tela pela lupa da barra ou por Ctrl/⌘+K.
//
// Por que existe: a busca unificada só morava na home. Quem estava no catálogo
// e queria outra coisa tinha de voltar ao início primeiro — e quem nunca usou
// o app não tem como saber em qual das oito telas a resposta mora. Uma porta
// de entrada que funciona de qualquer lugar vale mais que qualquer menu.
//
// É a MESMA busca da home (searchAll), não uma segunda implementação: duas
// buscas com regras diferentes ensinariam a pessoa a não confiar em nenhuma.
export default function GlobalSearch({ open, onClose, onProduct, onBrand, onTerm }) {
  const [q, setQ] = useState("");
  const [i, setI] = useState(0);
  const inputRef = useRef(null);

  const r = useMemo(() => searchAll(q, { nutrientMeta: NUTRIENT_LABEL, limit: 6 }), [q]);

  // Lista achatada para o teclado poder andar por tudo numa ordem só.
  const itens = useMemo(() => {
    const out = [];
    r.products.forEach((p) => out.push({ tipo: "produto", chave: p.id, p }));
    r.brands.forEach((b) => out.push({ tipo: "empresa", chave: "b-" + b, b }));
    r.nutrients.forEach((k) => out.push({ tipo: "nutriente", chave: "n-" + k, k }));
    (r.cultures || []).forEach((c) => out.push({ tipo: "cultura", chave: "c-" + c, c }));
    (r.stages || []).forEach((s) => out.push({ tipo: "estádio", chave: "e-" + s.culture + s.key, s }));
    return out;
  }, [r]);

  useEffect(() => setI(0), [q]);

  useEffect(() => {
    if (!open) return undefined;
    setQ("");
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    function onKey(e) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowDown") {
        e.preventDefault();
        setI((v) => Math.min(v + 1, itens.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setI((v) => Math.max(v - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (itens[i]) escolher(itens[i]);
        else if (q.trim().length >= 2) {
          onTerm(q.trim());
          onClose();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, itens, i, q]);

  function escolher(it) {
    if (it.tipo === "produto") onProduct(it.p);
    else if (it.tipo === "empresa") onBrand(it.b);
    else if (it.tipo === "nutriente") onTerm(NUTRIENT_LABEL[it.k] || it.k);
    else if (it.tipo === "cultura") onTerm(it.c);
    else if (it.tipo === "estádio") onTerm(it.s.label);
    onClose();
  }

  if (!open) return null;

  return (
    <div className="gsearch-backdrop" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="gsearch" role="dialog" aria-modal="true" aria-label="Buscar em todo o app">
        <div className="gsearch-field">
          <Search size={18} style={{ color: "var(--text-3)", flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Produto, empresa, nutriente, cultura ou estádio..."
            aria-label="Buscar em todo o app"
          />
          <button className="btn btn-ghost" onClick={onClose} aria-label="Fechar busca" style={{ padding: 6 }}>
            <X size={16} />
          </button>
        </div>

        <div className="gsearch-body">
          {q.trim().length < 2 ? (
            <p className="muted" style={{ fontSize: 13, margin: "14px 4px", lineHeight: 1.6 }}>
              Digite ao menos duas letras. A busca cobre o catálogo inteiro, as empresas, os nutrientes e as
              culturas — de qualquer tela do app.
            </p>
          ) : itens.length === 0 ? (
            <p className="muted" style={{ fontSize: 13, margin: "14px 4px", lineHeight: 1.6 }}>
              Nada encontrado para <strong>{q}</strong>. Tente o nome do produto, da empresa ou de um nutriente.
            </p>
          ) : (
            <ul className="gsearch-list">
              {itens.map((it, idx) => (
                <li key={it.chave}>
                  <button
                    className="gsearch-item"
                    data-sel={idx === i ? "true" : undefined}
                    onMouseEnter={() => setI(idx)}
                    onClick={() => escolher(it)}
                  >
                    <span className="gsearch-ico">
                      {it.tipo === "produto" && <Package size={15} />}
                      {it.tipo === "empresa" && <Building2 size={15} />}
                      {it.tipo === "nutriente" && <Beaker size={15} />}
                      {(it.tipo === "cultura" || it.tipo === "estádio") && <Sprout size={15} />}
                    </span>
                    <span style={{ minWidth: 0, flex: 1, textAlign: "left" }}>
                      <span className="gsearch-title">
                        {it.tipo === "produto" && it.p.name}
                        {it.tipo === "empresa" && it.b}
                        {it.tipo === "nutriente" && (NUTRIENT_LABEL[it.k] || it.k)}
                        {it.tipo === "cultura" && it.c}
                        {it.tipo === "estádio" && `${it.s.culture} · ${it.s.label}`}
                      </span>
                      <span className="gsearch-sub">
                        {it.tipo === "produto"
                          ? `${it.p.brand}${it.p.category ? ` · ${it.p.category}` : ""}${
                              it.p.hasNutrients
                                ? ` · ${Object.entries(it.p.nutrients)
                                    .filter(([, v]) => Number(v) > 0)
                                    .sort((a, b) => b[1] - a[1])
                                    .slice(0, 2)
                                    .map(([k, v]) => `${k} ${fmtNum(v)} ${concentrationUnit(it.p)}`)
                                    .join(" · ")}`
                                : ""
                            }`
                          : it.tipo === "empresa"
                          ? it.b === AGROCETE
                            ? "Nossa linha — abrir o portfólio"
                            : "Abrir o portfólio da empresa"
                          : it.tipo === "nutriente"
                          ? "Filtrar o catálogo por este nutriente"
                          : "Ver produtos posicionados"}
                      </span>
                    </span>
                    {idx === i && <CornerDownLeft size={14} style={{ color: "var(--text-3)", flexShrink: 0 }} />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="gsearch-foot">
          <span><kbd>↑</kbd><kbd>↓</kbd> navegar</span>
          <span><kbd>Enter</kbd> abrir</span>
          <span><kbd>Esc</kbd> fechar</span>
        </div>
      </div>
    </div>
  );
}
