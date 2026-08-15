import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search, X, LayoutGrid, List, Camera, ArrowRight, SlidersHorizontal } from "lucide-react";
import { PRODUCTS } from "../data/products.js";
import { COMPETITOR_BRANDS } from "../data/brands.js";
import { AGROCETE } from "../lib/catalog.js";
import { buildCategoryGroups, categoryGroupId } from "../dashboard/categoryGroups.js";
import { nutrientColor } from "../dashboard/nutrientColors.js";
import { loadSelection, saveSelection, loadDoseOverrides, initialDose } from "../lib/selection.js";
import { ProductGridCard, ProductListRow } from "../components/ProductCard.jsx";
import ProductSheet from "../components/ProductSheet.jsx";

const CATEGORY_GROUPS = buildCategoryGroups(PRODUCTS);
const NUTRIENT_CHIPS = ["N", "P2O5", "K2O", "Ca", "Mg", "S", "B", "Zn", "Mn", "Cu"];
const NUTRIENT_LABEL = {
  N: "N", P2O5: "P", K2O: "K", Ca: "Ca", Mg: "Mg", S: "S", B: "B", Zn: "Zn", Mn: "Mn", Cu: "Cu",
};

function norm(s) {
  return (s || "").toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// Virtualização simples por janela: renderiza só as linhas visíveis (mais uma
// margem acima/abaixo). Sem biblioteca — o catálogo tem 1.518 itens e uma
// grade completa no DOM trava celular.
function useWindowed({ total, perRow, rowHeight, overscan = 4 }) {
  const [range, setRange] = useState({ start: 0, end: 30 });
  const ref = useRef(null);

  const recompute = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const rows = Math.ceil(total / perRow);
    const top = el.getBoundingClientRect().top + window.scrollY;
    const scrollTop = Math.max(0, window.scrollY - top);
    const firstRow = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const visibleRows = Math.ceil(window.innerHeight / rowHeight) + overscan * 2;
    const lastRow = Math.min(rows, firstRow + visibleRows);
    setRange({ start: firstRow * perRow, end: Math.min(total, lastRow * perRow) });
  }, [total, perRow, rowHeight, overscan]);

  useEffect(() => {
    recompute();
    window.addEventListener("scroll", recompute, { passive: true });
    window.addEventListener("resize", recompute);
    return () => {
      window.removeEventListener("scroll", recompute);
      window.removeEventListener("resize", recompute);
    };
  }, [recompute]);

  return { ref, range, recompute };
}

export default function Catalog({ initialSearch = "", initialGroupBy = "categoria", onOpenPhoto, onOpenManejo }) {
  const [search, setSearch] = useState(initialSearch);
  const [brand, setBrand] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [nutrientFilter, setNutrientFilter] = useState(null);
  const [groupBy, setGroupBy] = useState(initialGroupBy); // "categoria" | "marca"
  const [view, setView] = useState(() => (typeof window !== "undefined" && window.innerWidth < 720 ? "list" : "grid"));
  const [selected, setSelected] = useState(() => loadSelection());
  const [sheetProduct, setSheetProduct] = useState(null);
  const doseOverrides = useMemo(() => loadDoseOverrides(), []);

  useEffect(() => saveSelection(selected), [selected]);
  useEffect(() => setSearch(initialSearch), [initialSearch]);

  const q = norm(search).trim();

  const filtered = useMemo(() => {
    const out = [];
    for (const p of PRODUCTS) {
      if (brand && p.brand !== brand) continue;
      if (categoryFilter && categoryGroupId(p.category) !== categoryFilter) continue;
      if (nutrientFilter && !(Number(p.nutrients?.[nutrientFilter]) > 0)) continue;
      if (q) {
        const hit =
          norm(p.name).includes(q) ||
          norm(p.brand).includes(q) ||
          norm(p.composition).includes(q) ||
          norm(p.category).includes(q);
        if (!hit) continue;
      }
      out.push(p);
    }
    // Agrocete primeiro dentro do critério escolhido — é o portfólio que a
    // equipe precisa achar rápido.
    const key = groupBy === "marca" ? (p) => p.brand : (p) => p.category || "";
    return out.sort((a, b) => {
      if (a.brand === AGROCETE && b.brand !== AGROCETE) return -1;
      if (b.brand === AGROCETE && a.brand !== AGROCETE) return 1;
      const ka = key(a);
      const kb = key(b);
      if (ka !== kb) return ka.localeCompare(kb);
      return a.name.localeCompare(b.name);
    });
  }, [q, brand, categoryFilter, nutrientFilter, groupBy]);

  // useColumns tem que ser chamado sempre (regra dos hooks) — o modo lista só
  // ignora o resultado e usa 1 por linha.
  const columns = useColumns();
  const perRow = view === "list" ? 1 : columns;
  const rowHeight = view === "list" ? 78 : 232;
  const { ref, range } = useWindowed({ total: filtered.length, perRow, rowHeight });

  function toggle(p) {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[p.id]) delete next[p.id];
      else next[p.id] = { dose: initialDose(p, doseOverrides), price: 0 };
      return next;
    });
    if (navigator.vibrate) {
      try {
        navigator.vibrate(10);
      } catch {
        /* sem suporte */
      }
    }
  }

  const selectedCount = Object.keys(selected).length;
  const anyFilter = !!(q || brand || categoryFilter || nutrientFilter);
  const visible = filtered.slice(range.start, range.end);
  const totalRows = Math.ceil(filtered.length / perRow);
  const padTop = Math.floor(range.start / perRow) * rowHeight;
  const padBottom = Math.max(0, (totalRows - Math.ceil(range.end / perRow)) * rowHeight);

  return (
    <div>
      {/* FILTROS FIXOS */}
      <div
        style={{
          position: "sticky",
          top: 64,
          zIndex: 20,
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="shell" style={{ paddingTop: 12, paddingBottom: 10 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
              <Search size={16} style={{ position: "absolute", left: 12, top: 16, color: "var(--text-3)", pointerEvents: "none" }} />
              <input
                className="input"
                style={{ paddingLeft: 36, paddingRight: 40 }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar produto, empresa, nutriente ou cultura..."
                aria-label="Buscar no catálogo"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  aria-label="Limpar busca"
                  style={{ position: "absolute", right: 5, top: 5, width: 38, height: 38, border: "none", background: "transparent", color: "var(--text-3)", cursor: "pointer", borderRadius: 8 }}
                >
                  <X size={15} />
                </button>
              )}
            </div>
            <button
              className="btn btn-ghost"
              style={{ width: 48, minHeight: 48, padding: 0, flexShrink: 0 }}
              onClick={onOpenPhoto}
              aria-label="Escanear rótulo com a câmera"
              title="Escanear rótulo"
            >
              <Camera size={17} />
            </button>
            <div style={{ display: "flex", gap: 2, background: "var(--surface-2)", borderRadius: "var(--radius-sm)", padding: 3, flexShrink: 0 }}>
              <ViewBtn active={view === "grid"} onClick={() => setView("grid")} label="Ver em grade">
                <LayoutGrid size={16} />
              </ViewBtn>
              <ViewBtn active={view === "list"} onClick={() => setView("list")} label="Ver em lista compacta">
                <List size={16} />
              </ViewBtn>
            </div>
          </div>

          {/* chips deslizantes */}
          <div className="filter-chip-row" style={{ marginTop: 9 }}>
            <Chip active={!anyFilter} onClick={() => { setSearch(""); setBrand(""); setCategoryFilter(null); setNutrientFilter(null); }}>
              Todos
            </Chip>
            <Chip active={brand === AGROCETE} onClick={() => setBrand(brand === AGROCETE ? "" : AGROCETE)} color="var(--brand)">
              Somente Agrocete
            </Chip>
            {CATEGORY_GROUPS.map((g) => (
              <Chip
                key={g.id}
                active={categoryFilter === g.id}
                onClick={() => setCategoryFilter(categoryFilter === g.id ? null : g.id)}
                color="var(--info)"
              >
                {g.label} ({g.count})
              </Chip>
            ))}
            {NUTRIENT_CHIPS.map((k) => (
              <Chip
                key={k}
                active={nutrientFilter === k}
                onClick={() => setNutrientFilter(nutrientFilter === k ? null : k)}
                color={nutrientColor(k)}
              >
                {NUTRIENT_LABEL[k]}
              </Chip>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 9, flexWrap: "wrap" }}>
            <select
              className="input"
              style={{ minHeight: 40, width: "auto", maxWidth: 220, fontSize: 13, padding: "8px 10px" }}
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              aria-label="Filtrar por empresa"
            >
              <option value="">Todas as empresas ({COMPETITOR_BRANDS.length + 1})</option>
              <option value={AGROCETE}>AGROCETE</option>
              {COMPETITOR_BRANDS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>

            <div style={{ display: "flex", gap: 2, background: "var(--surface-2)", borderRadius: "var(--radius-sm)", padding: 3 }}>
              <ViewBtn active={groupBy === "categoria"} onClick={() => setGroupBy("categoria")} label="Ordenar por categoria" wide>
                <SlidersHorizontal size={14} /> Categorias
              </ViewBtn>
              <ViewBtn active={groupBy === "marca"} onClick={() => setGroupBy("marca")} label="Ordenar por marca" wide>
                Marcas
              </ViewBtn>
            </div>

            <span className="muted tnum" style={{ fontSize: 12.5, marginLeft: "auto" }}>
              {filtered.length.toLocaleString("pt-BR")} produto{filtered.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </div>

      {/* GRADE */}
      <div className="shell" style={{ paddingTop: 16, paddingBottom: selectedCount > 0 ? 96 : 40 }}>
        {filtered.length === 0 ? (
          <div className="card" style={{ padding: "34px 20px", textAlign: "center" }}>
            <Search size={26} style={{ color: "var(--text-3)" }} />
            <div style={{ fontWeight: 600, marginTop: 10, fontSize: 15 }}>Nenhum produto encontrado</div>
            <p className="muted" style={{ fontSize: 13, marginTop: 6, lineHeight: 1.55, maxWidth: 420, marginInline: "auto" }}>
              Tente buscar pelo nome da empresa, por um nutriente ou pela cultura. Você também pode limpar os filtros.
            </p>
            <button className="btn btn-ghost" style={{ marginTop: 14 }} onClick={() => { setSearch(""); setBrand(""); setCategoryFilter(null); setNutrientFilter(null); }}>
              Limpar filtros
            </button>
          </div>
        ) : (
          <div ref={ref}>
            <div style={{ height: padTop }} />
            <div
              className={view === "grid" ? "product-grid" : undefined}
              style={view === "list" ? { display: "flex", flexDirection: "column", gap: 8 } : undefined}
            >
              {visible.map((p) =>
                view === "grid" ? (
                  <ProductGridCard
                    key={p.id}
                    product={p}
                    selected={!!selected[p.id]}
                    onToggle={() => toggle(p)}
                    onOpenSheet={() => setSheetProduct(p)}
                  />
                ) : (
                  <ProductListRow
                    key={p.id}
                    product={p}
                    selected={!!selected[p.id]}
                    onToggle={() => toggle(p)}
                    onOpenSheet={() => setSheetProduct(p)}
                  />
                )
              )}
            </div>
            <div style={{ height: padBottom }} />
          </div>
        )}
      </div>

      {/* BARRA DO MANEJO */}
      {selectedCount > 0 && (
        <div
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 40,
            background: "var(--surface)",
            borderTop: "1px solid var(--border)",
            boxShadow: "0 -4px 16px rgba(17,24,39,0.08)",
          }}
        >
          <div className="shell" style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 20px" }}>
            <span style={{ fontSize: 13.5, fontWeight: 600 }}>
              {selectedCount} produto{selectedCount > 1 ? "s" : ""} no manejo
            </span>
            <button className="btn btn-ghost" style={{ minHeight: 44, marginLeft: "auto" }} onClick={() => setSelected({})}>
              Limpar
            </button>
            <button className="btn btn-primary" style={{ minHeight: 44 }} onClick={onOpenManejo}>
              Ver comparativo <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {sheetProduct && (
        <ProductSheet
          product={sheetProduct}
          selected={!!selected[sheetProduct.id]}
          onToggle={() => toggle(sheetProduct)}
          onClose={() => setSheetProduct(null)}
        />
      )}
    </div>
  );
}

// Colunas conforme a largura — a grade usa CSS, mas a virtualização precisa
// saber quantos cabem por linha pra calcular a altura total.
function useColumns() {
  const [cols, setCols] = useState(() => colsFor(typeof window === "undefined" ? 1200 : window.innerWidth));
  useEffect(() => {
    const onResize = () => setCols(colsFor(window.innerWidth));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return cols;
}

function colsFor(w) {
  if (w >= 1240) return 4;
  if (w >= 940) return 3;
  if (w >= 640) return 2;
  return 1;
}

function Chip({ children, active, onClick, color = "var(--brand)" }) {
  return (
    <button
      onClick={onClick}
      className="chip"
      style={{
        cursor: "pointer",
        flexShrink: 0,
        minHeight: 34,
        background: active ? `color-mix(in srgb, ${color} 13%, transparent)` : "var(--surface)",
        borderColor: active ? color : "var(--border)",
        color: active ? color : "var(--text-2)",
        fontWeight: active ? 700 : 600,
      }}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}

function ViewBtn({ children, active, onClick, label, wide = false }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={active}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        height: 36,
        padding: wide ? "0 11px" : "0 10px",
        borderRadius: 8,
        border: "none",
        background: active ? "var(--surface)" : "transparent",
        boxShadow: active ? "var(--shadow-sm)" : "none",
        color: active ? "var(--brand)" : "var(--text-3)",
        cursor: "pointer",
        font: "inherit",
        fontSize: 12.5,
        fontWeight: 600,
      }}
    >
      {children}
    </button>
  );
}
