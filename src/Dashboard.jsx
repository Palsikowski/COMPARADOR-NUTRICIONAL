import React, { useState, useMemo, useEffect } from "react";
import {
  Leaf,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Download,
  Search,
  Layers,
  Building2,
  Lightbulb,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { PRODUCTS } from "./data/products.js";
import { EQUIVALENCES, EQUIVALENCE_FOOTNOTES } from "./data/equivalences.js";
import { COMPETITOR_BRANDS } from "./data/brands.js";

const NUTRIENT_META = {
  N: { label: "Nitrogênio", group: "macro" },
  P2O5: { label: "Fósforo (P2O5)", group: "macro" },
  K2O: { label: "Potássio (K2O)", group: "macro" },
  Ca: { label: "Cálcio", group: "macro" },
  Mg: { label: "Magnésio", group: "secundario" },
  S: { label: "Enxofre", group: "secundario" },
  B: { label: "Boro", group: "micro" },
  Cu: { label: "Cobre", group: "micro" },
  Mn: { label: "Manganês", group: "micro" },
  Zn: { label: "Zinco", group: "micro" },
  Fe: { label: "Ferro", group: "micro" },
  Mo: { label: "Molibdênio", group: "micro" },
  Ni: { label: "Níquel", group: "micro" },
  Co: { label: "Cobalto", group: "micro" },
  C_Org: { label: "Carbono Orgânico", group: "outro" },
};
const GROUP_ORDER = { macro: 0, secundario: 1, micro: 2, outro: 3 };

const AGROCETE = "AGROCETE";
const AGROCETE_COLOR = "#1FBF8F";
const BRAND_PALETTE = ["#F5A524", "#6366F1", "#F43F5E", "#38BDF8", "#A78BFA", "#FB923C", "#4ADE80", "#F472B6", "#60A5FA", "#FACC15", "#FB7185"];
function brandColor(brand) {
  if (brand === AGROCETE) return AGROCETE_COLOR;
  const idx = COMPETITOR_BRANDS.indexOf(brand);
  return BRAND_PALETTE[idx >= 0 ? idx % BRAND_PALETTE.length : 0];
}

const STORAGE_KEY = "agro-dashboard-state-v1";

function loadPersistedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function genId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function nutrientUnitSuffix(product) {
  return product.unit === "kg/ha" ? "g/kg" : "g/L";
}

function fmtNum(n) {
  return Number(n).toLocaleString("pt-BR", { maximumFractionDigits: 2 });
}

export default function Dashboard() {
  const [selected, setSelected] = useState(() => loadPersistedState()?.selected ?? {}); // id -> { dose, price }
  const [customProducts, setCustomProducts] = useState(() => loadPersistedState()?.customProducts ?? []);
  const [mode, setMode] = useState("categoria"); // 'categoria' | 'marca'
  const [search, setSearch] = useState("");
  const [openEquivCategory, setOpenEquivCategory] = useState(null);
  const [openBrand, setOpenBrand] = useState(AGROCETE);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProd, setNewProd] = useState({ name: "", unit: "L/ha", dose: 1, price: 0, nutrients: {} });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ selected, customProducts }));
    } catch {
      // localStorage indisponível — ignora, estado só não persiste
    }
  }, [selected, customProducts]);

  const allProducts = useMemo(() => [...PRODUCTS, ...customProducts], [customProducts]);
  const productsById = useMemo(() => new Map(allProducts.map((p) => [p.id, p])), [allProducts]);

  function toggleProduct(product) {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[product.id]) {
        delete next[product.id];
      } else {
        next[product.id] = { dose: product.defaultDose ?? 0, price: product.defaultPrice ?? 0 };
      }
      return next;
    });
  }

  function updateSelected(id, field, value) {
    setSelected((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  }

  function addCustomProduct() {
    if (!newProd.name.trim()) return;
    const cleanNutrients = {};
    Object.entries(newProd.nutrients).forEach(([k, v]) => {
      const num = parseFloat(v);
      if (!isNaN(num) && num > 0) cleanNutrients[k] = num;
    });
    const id = genId("custom");
    setCustomProducts((prev) => [
      ...prev,
      {
        id,
        brand: AGROCETE,
        category: "Cadastrado manualmente",
        name: newProd.name,
        unit: newProd.unit,
        hasNutrients: Object.keys(cleanNutrients).length > 0,
        nutrients: cleanNutrients,
        defaultDose: parseFloat(newProd.dose) || 0,
        defaultPrice: parseFloat(newProd.price) || 0,
        custom: true,
      },
    ]);
    setNewProd({ name: "", unit: "L/ha", dose: 1, price: 0, nutrients: {} });
    setShowAddForm(false);
  }

  function removeCustomProduct(id) {
    setCustomProducts((prev) => prev.filter((p) => p.id !== id));
    setSelected((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  // --- totais ---
  const totals = useMemo(() => {
    const agro = { nutrients: {}, cost: 0, count: 0 };
    const comp = { nutrients: {}, cost: 0, count: 0 };
    Object.entries(selected).forEach(([id, sel]) => {
      const product = productsById.get(id);
      if (!product) return;
      const dose = parseFloat(sel.dose) || 0;
      const price = parseFloat(sel.price) || 0;
      const bucket = product.brand === AGROCETE ? agro : comp;
      bucket.cost += dose * price;
      bucket.count += 1;
      Object.entries(product.nutrients || {}).forEach(([el, gPerUnit]) => {
        bucket.nutrients[el] = (bucket.nutrients[el] || 0) + gPerUnit * dose;
      });
    });
    return { agro, comp };
  }, [selected, productsById]);

  const allNutrientKeys = useMemo(() => {
    const keys = new Set([...Object.keys(totals.agro.nutrients), ...Object.keys(totals.comp.nutrients)]);
    return Array.from(keys).sort((a, b) => {
      const ga = NUTRIENT_META[a]?.group ?? "outro";
      const gb = NUTRIENT_META[b]?.group ?? "outro";
      return GROUP_ORDER[ga] - GROUP_ORDER[gb];
    });
  }, [totals]);

  const maxValue = useMemo(() => {
    let max = 0;
    allNutrientKeys.forEach((k) => {
      max = Math.max(max, totals.agro.nutrients[k] || 0, totals.comp.nutrients[k] || 0);
    });
    return max || 1;
  }, [allNutrientKeys, totals]);

  // --- KPIs ---
  const kpis = useMemo(() => {
    const agroCount = PRODUCTS.filter((p) => p.brand === AGROCETE).length;
    const nutrientCount = PRODUCTS.filter((p) => p.hasNutrients).length;
    return {
      agroCount,
      brandCount: COMPETITOR_BRANDS.length,
      nutrientCount,
      equivCount: EQUIVALENCES.length,
    };
  }, []);

  // --- posicionamento técnico ---
  const selectedAgroWithNotes = useMemo(
    () =>
      Object.keys(selected)
        .map((id) => productsById.get(id))
        .filter((p) => p && p.brand === AGROCETE && (p.observations || p.warning)),
    [selected, productsById]
  );

  const headToHead = useMemo(() => {
    const agroIds = Object.keys(selected).filter((id) => productsById.get(id)?.brand === AGROCETE);
    const compIds = Object.keys(selected).filter((id) => {
      const p = productsById.get(id);
      return p && p.brand !== AGROCETE;
    });
    if (agroIds.length !== 1 || compIds.length !== 1) return null;
    const agroP = productsById.get(agroIds[0]);
    const compP = productsById.get(compIds[0]);
    if (!agroP.hasNutrients || !compP.hasNutrients) return null;
    const shared = Object.keys(agroP.nutrients).filter((k) => compP.nutrients[k] != null);
    if (shared.length === 0) return null;
    return {
      agroP,
      compP,
      rows: shared.map((k) => {
        const a = agroP.nutrients[k];
        const c = compP.nutrients[k];
        const diffPct = c === 0 ? null : ((a - c) / c) * 100;
        return { key: k, a, c, diffPct };
      }),
    };
  }, [selected, productsById]);

  // --- equivalências agrupadas por categoria ---
  const equivByCategory = useMemo(() => {
    const groups = {};
    EQUIVALENCES.forEach((row) => {
      const cat = row.category || "Outros";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(row);
    });
    return groups;
  }, []);

  // --- produtos por marca, filtrados por busca ---
  const searchNorm = search.trim().toLowerCase();
  function matchesSearch(p) {
    if (!searchNorm) return true;
    return (
      p.name.toLowerCase().includes(searchNorm) ||
      (p.composition && p.composition.toLowerCase().includes(searchNorm)) ||
      (p.category && p.category.toLowerCase().includes(searchNorm))
    );
  }

  const productsByBrand = useMemo(() => {
    const groups = {};
    allProducts.forEach((p) => {
      if (!groups[p.brand]) groups[p.brand] = [];
      groups[p.brand].push(p);
    });
    return groups;
  }, [allProducts]);

  const allBrands = [AGROCETE, ...COMPETITOR_BRANDS];
  const selectedCount = Object.keys(selected).length;

  async function exportPDF() {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    let y = 15;

    doc.setFontSize(16);
    doc.text("Comparativo de Portfólio — Agrocete x Mercado", 14, y);
    y += 7;
    doc.setFontSize(10);
    doc.setTextColor(110);
    doc.text(`Gerado em ${new Date().toLocaleDateString("pt-BR")}`, 14, y);
    doc.setTextColor(0);
    y += 10;

    doc.setFontSize(12);
    doc.text("Produtos selecionados", 14, y);
    y += 6;
    doc.setFontSize(9);
    if (selectedCount === 0) {
      doc.text("Nenhum produto selecionado.", 16, y);
      y += 5;
    } else {
      Object.entries(selected).forEach(([id, sel]) => {
        const product = productsById.get(id);
        if (!product) return;
        doc.text(
          `- [${product.brand}] ${product.name} — dose ${sel.dose} ${product.unit || ""}, preço R$ ${(parseFloat(sel.price) || 0).toFixed(2)}`,
          16,
          y
        );
        y += 5;
        if (y > 280) {
          doc.addPage();
          y = 15;
        }
      });
    }

    y += 6;
    doc.setFontSize(12);
    doc.text("Comparativo de nutrientes (g/ha)", 14, y);
    y += 7;
    doc.setFontSize(9);
    doc.setFont(undefined, "bold");
    doc.text("Nutriente", 14, y);
    doc.text("Concorrentes", 90, y);
    doc.text("Agrocete", 140, y);
    doc.setFont(undefined, "normal");
    y += 5;
    allNutrientKeys.forEach((key) => {
      if (y > 275) {
        doc.addPage();
        y = 15;
      }
      doc.text(NUTRIENT_META[key]?.label ?? key, 14, y);
      doc.text(`${fmtNum(totals.comp.nutrients[key] || 0)} g`, 90, y);
      doc.text(`${fmtNum(totals.agro.nutrients[key] || 0)} g`, 140, y);
      y += 5;
    });

    if (y > 260) {
      doc.addPage();
      y = 15;
    }
    y += 6;
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text("Custo total", 14, y);
    doc.setFont(undefined, "normal");
    y += 7;
    doc.setFontSize(10);
    doc.text(`Concorrentes: R$ ${totals.comp.cost.toFixed(2)}`, 14, y);
    y += 6;
    doc.text(`Agrocete: R$ ${totals.agro.cost.toFixed(2)}`, 14, y);
    y += 8;

    if (totals.comp.cost > 0 && totals.agro.cost > 0) {
      const diff = Math.abs(totals.agro.cost - totals.comp.cost).toFixed(2);
      const msg =
        totals.agro.cost <= totals.comp.cost
          ? `Manejo Agrocete é R$ ${diff} mais barato que o concorrente selecionado.`
          : `Manejo Agrocete é R$ ${diff} mais caro que o concorrente selecionado — avalie a diferença de nutrientes acima.`;
      doc.text(doc.splitTextToSize(msg, 180), 14, y);
      y += 12;
    }

    if (selectedAgroWithNotes.length > 0) {
      if (y > 250) {
        doc.addPage();
        y = 15;
      }
      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      doc.text("Posicionamento técnico", 14, y);
      doc.setFont(undefined, "normal");
      y += 7;
      doc.setFontSize(9);
      selectedAgroWithNotes.forEach((p) => {
        const text = [p.observations, p.warning].filter(Boolean).join(" | ");
        const lines = doc.splitTextToSize(`${p.name}: ${text}`, 180);
        if (y + lines.length * 5 > 280) {
          doc.addPage();
          y = 15;
        }
        doc.text(lines, 14, y);
        y += lines.length * 5 + 2;
      });
    }

    doc.save("comparativo-portfolio-agrocete.pdf");
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0F1720", fontFamily: "'Inter', system-ui, sans-serif", color: "#E8EDF1" }}>
      {/* NAVBAR */}
      <header
        style={{
          background: "#0B1319",
          borderBottom: "1px solid #1E2A35",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: AGROCETE_COLOR, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Leaf size={18} color="#0B1319" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.1 }}>Painel Agrocete</div>
            <div style={{ fontSize: 11, color: "#8CA0AF" }}>Comparador de Portfólio x Mercado</div>
          </div>
        </div>
        <div style={{ fontSize: 12, color: "#8CA0AF" }}>
          {PRODUCTS.length} produtos catalogados · {COMPETITOR_BRANDS.length} marcas concorrentes
        </div>
      </header>

      <main style={{ maxWidth: 980, margin: "0 auto", padding: "20px 16px 120px" }}>
        {/* KPI ROW */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 22 }}>
          <KpiCard color="#F5A524" label="Produtos Agrocete" value={kpis.agroCount} />
          <KpiCard color="#14B8A6" label="Marcas mapeadas" value={kpis.brandCount} />
          <KpiCard color="#6366F1" label="Com dados nutricionais" value={kpis.nutrientCount} />
          <KpiCard color="#F43F5E" label="Linhas de equivalência" value={kpis.equivCount} />
        </div>

        {/* SEARCH */}
        <div style={{ position: "relative", marginBottom: 14 }}>
          <Search size={15} color="#8CA0AF" style={{ position: "absolute", left: 12, top: 11 }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar produto, composição ou categoria..."
            style={{
              width: "100%",
              padding: "10px 12px 10px 34px",
              borderRadius: 10,
              border: "1px solid #24313D",
              background: "#17212B",
              color: "#E8EDF1",
              fontSize: 13,
              boxSizing: "border-box",
              fontFamily: "inherit",
            }}
          />
        </div>

        {/* MODE TABS */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <ModeTab active={mode === "categoria"} onClick={() => setMode("categoria")} icon={<Layers size={14} />} label="Por categoria" />
          <ModeTab active={mode === "marca"} onClick={() => setMode("marca")} icon={<Building2 size={14} />} label="Por marca" />
        </div>

        {mode === "categoria" && (
          <section>
            {Object.entries(equivByCategory).map(([cat, rows]) => {
              const isOpen = openEquivCategory === cat;
              const filteredRows = rows.filter(
                (r) =>
                  !searchNorm ||
                  r.composition?.toLowerCase().includes(searchNorm) ||
                  r.agroceteName?.toLowerCase().includes(searchNorm) ||
                  r.competitors.some((c) => c.name.toLowerCase().includes(searchNorm))
              );
              if (searchNorm && filteredRows.length === 0) return null;
              return (
                <div key={cat} style={{ background: "#17212B", borderRadius: 12, border: "1px solid #24313D", overflow: "hidden", marginBottom: 10 }}>
                  <button
                    onClick={() => setOpenEquivCategory(isOpen ? null : cat)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "13px 14px",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      color: "#E8EDF1",
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: "0.03em", textTransform: "uppercase" }}>{cat}</span>
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  {isOpen && (
                    <div style={{ padding: "0 14px 14px", display: "flex", flexDirection: "column", gap: 12 }}>
                      {filteredRows.map((row, i) => (
                        <EquivRow key={i} row={row} productsById={productsById} selected={selected} onToggle={toggleProduct} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <p style={{ fontSize: 11, color: "#5C6B78", marginTop: 8 }}>
              {EQUIVALENCE_FOOTNOTES.map((f, i) => (
                <span key={i} style={{ display: "block", marginBottom: 3 }}>
                  {f}
                </span>
              ))}
            </p>
          </section>
        )}

        {mode === "marca" && (
          <section>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {allBrands.map((brand) => {
                const isOpen = openBrand === brand;
                const products = (productsByBrand[brand] || []).filter(matchesSearch);
                const brandSelectedCount = (productsByBrand[brand] || []).filter((p) => selected[p.id]).length;
                if (searchNorm && products.length === 0) return null;
                const color = brandColor(brand);
                return (
                  <div key={brand} style={{ background: "#17212B", borderRadius: 12, border: "1px solid #24313D", overflow: "hidden" }}>
                    <button
                      onClick={() => setOpenBrand(isOpen ? null : brand)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "13px 14px",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                        color: "#E8EDF1",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ width: 10, height: 10, borderRadius: "50%", background: color, display: "inline-block" }} />
                        <span style={{ fontWeight: 600, fontSize: 15 }}>{brand === AGROCETE ? "AGROCETE (nossos produtos)" : brand}</span>
                        <span style={{ fontSize: 11, color: "#5C6B78" }}>{(productsByBrand[brand] || []).length} produtos</span>
                        {brandSelectedCount > 0 && (
                          <span style={{ fontSize: 11, background: "#233241", padding: "2px 7px", borderRadius: 999, fontWeight: 600 }}>
                            {brandSelectedCount} ativo{brandSelectedCount > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    {isOpen && (
                      <div style={{ padding: "0 12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
                        {products.map((product) => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            color={color}
                            isSelected={!!selected[product.id]}
                            onToggle={() => toggleProduct(product)}
                            doseValue={selected[product.id]?.dose}
                            priceValue={selected[product.id]?.price}
                            onUpdate={(field, value) => updateSelected(product.id, field, value)}
                            onRemove={product.custom ? () => removeCustomProduct(product.id) : undefined}
                          />
                        ))}
                        {products.length === 0 && <p style={{ fontSize: 12, color: "#5C6B78" }}>Nenhum produto encontrado para essa busca.</p>}
                        {brand === AGROCETE && (
                          <AddCustomProductForm
                            show={showAddForm}
                            setShow={setShowAddForm}
                            newProd={newProd}
                            setNewProd={setNewProd}
                            onSave={addCustomProduct}
                          />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* COMPARATIVO */}
        {allNutrientKeys.length > 0 && (
          <section style={{ marginTop: 28 }}>
            <SectionHeading icon={<TrendingUp size={16} />} title="Comparativo de nutrientes (g/ha)" />
            <div style={{ background: "#17212B", borderRadius: 12, border: "1px solid #24313D", padding: 14 }}>
              <div style={{ display: "flex", gap: 14, fontSize: 11, marginBottom: 12 }}>
                <LegendDot color="#6B7A88" label="Concorrentes" />
                <LegendDot color={AGROCETE_COLOR} label="Agrocete" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {allNutrientKeys.map((key) => {
                  const compVal = totals.comp.nutrients[key] || 0;
                  const agroVal = totals.agro.nutrients[key] || 0;
                  return (
                    <div key={key}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                        <span style={{ fontWeight: 600 }}>{NUTRIENT_META[key]?.label ?? key}</span>
                        <span style={{ color: "#8CA0AF" }}>
                          {fmtNum(compVal)} g vs {fmtNum(agroVal)} g
                        </span>
                      </div>
                      <Bar value={compVal} max={maxValue} color="#6B7A88" />
                      <Bar value={agroVal} max={maxValue} color={AGROCETE_COLOR} style={{ marginTop: 3 }} />
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <CostCard label="Custo concorrentes" value={totals.comp.cost} color="#6B7A88" />
              <CostCard label="Custo Agrocete" value={totals.agro.cost} color={AGROCETE_COLOR} />
            </div>
            {totals.comp.cost > 0 && totals.agro.cost > 0 && (
              <div style={{ marginTop: 10, fontSize: 13, background: "#17212B", border: "1px solid #24313D", borderRadius: 10, padding: 12 }}>
                {totals.agro.cost <= totals.comp.cost ? (
                  <span>
                    Manejo Agrocete é <strong style={{ color: AGROCETE_COLOR }}>R$ {(totals.comp.cost - totals.agro.cost).toFixed(2)} mais barato</strong> que o manejo concorrente selecionado.
                  </span>
                ) : (
                  <span>
                    Manejo Agrocete é <strong style={{ color: "#F5A524" }}>R$ {(totals.agro.cost - totals.comp.cost).toFixed(2)} mais caro</strong> — avalie se a diferença de nutrientes abaixo justifica o custo.
                  </span>
                )}
              </div>
            )}

            {/* POSICIONAMENTO TÉCNICO */}
            {(headToHead || selectedAgroWithNotes.length > 0) && (
              <div style={{ marginTop: 16 }}>
                <SectionHeading icon={<Lightbulb size={16} />} title="Posicionamento técnico" />
                {headToHead && (
                  <div style={{ background: "#17212B", border: `1px solid ${AGROCETE_COLOR}44`, borderRadius: 10, padding: 12, marginBottom: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
                      {headToHead.agroP.name} <span style={{ color: "#8CA0AF" }}>vs</span> {headToHead.compP.name} ({headToHead.compP.brand})
                    </div>
                    {headToHead.rows.map((r) => (
                      <div key={r.key} style={{ fontSize: 12, color: "#C7D2D9", marginBottom: 4 }}>
                        {NUTRIENT_META[r.key]?.label ?? r.key}: Agrocete entrega{" "}
                        <strong style={{ color: AGROCETE_COLOR }}>{fmtNum(r.a)} {nutrientUnitSuffix(headToHead.agroP)}</strong> contra{" "}
                        {fmtNum(r.c)} {nutrientUnitSuffix(headToHead.compP)} do concorrente
                        {r.diffPct != null && (
                          <strong style={{ color: r.diffPct >= 0 ? AGROCETE_COLOR : "#F87171" }}>
                            {" "}
                            ({r.diffPct >= 0 ? "+" : ""}
                            {fmtNum(r.diffPct)}%)
                          </strong>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {selectedAgroWithNotes.map((p) => (
                  <div key={p.id} style={{ background: "#17212B", border: "1px solid #24313D", borderRadius: 10, padding: 12, marginBottom: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{p.name}</div>
                    {p.observations && (
                      <div style={{ fontSize: 12, color: "#C7D2D9", display: "flex", gap: 6, marginBottom: p.warning ? 6 : 0 }}>
                        <Lightbulb size={13} color={AGROCETE_COLOR} style={{ flexShrink: 0, marginTop: 1 }} />
                        <span style={{ whiteSpace: "pre-line" }}>{p.observations}</span>
                      </div>
                    )}
                    {p.warning && (
                      <div style={{ fontSize: 12, color: "#F5A524", display: "flex", gap: 6 }}>
                        <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
                        <span style={{ whiteSpace: "pre-line" }}>{p.warning}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={exportPDF}
              style={{
                marginTop: 16,
                width: "100%",
                padding: "11px",
                borderRadius: 10,
                border: "none",
                background: AGROCETE_COLOR,
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
          </section>
        )}

        {allNutrientKeys.length === 0 && (
          <div style={{ marginTop: 24, textAlign: "center", color: "#5C6B78", fontSize: 13, padding: "30px 10px" }}>
            Selecione produtos acima (por categoria ou por marca) para ver o comparativo de nutrientes e custo.
          </div>
        )}
      </main>
    </div>
  );
}

function KpiCard({ color, label, value }) {
  return (
    <div style={{ background: "#17212B", borderRadius: 12, border: "1px solid #24313D", overflow: "hidden" }}>
      <div style={{ height: 3, background: color }} />
      <div style={{ padding: "12px 14px" }}>
        <div style={{ fontSize: 11, color: "#8CA0AF", marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
      </div>
    </div>
  );
}

function ModeTab({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 14px",
        borderRadius: 8,
        border: `1px solid ${active ? "#1FBF8F" : "#24313D"}`,
        background: active ? "#1FBF8F1A" : "transparent",
        color: active ? "#1FBF8F" : "#8CA0AF",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function SectionHeading({ icon, title }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
      <span style={{ color: "#1FBF8F" }}>{icon}</span>
      <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", margin: 0 }}>{title}</h2>
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block" }} />
      <span style={{ color: "#8CA0AF" }}>{label}</span>
    </div>
  );
}

function Bar({ value, max, color, style }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ background: "#0F1720", borderRadius: 5, height: 7, overflow: "hidden", ...style }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 5, transition: "width 0.3s" }} />
    </div>
  );
}

function CostCard({ label, value, color }) {
  return (
    <div style={{ flex: 1, background: "#17212B", border: `1.5px solid ${color}44`, borderRadius: 10, padding: 12 }}>
      <div style={{ fontSize: 11, color: "#8CA0AF" }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color, marginTop: 2 }}>R$ {value.toFixed(2)}</div>
    </div>
  );
}

function ProductCard({ product, color, isSelected, onToggle, onUpdate, doseValue, priceValue, onRemove }) {
  return (
    <div
      style={{
        border: `1.5px solid ${isSelected ? color : "#24313D"}`,
        borderRadius: 10,
        padding: 10,
        background: isSelected ? `${color}14` : "#0F1720",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        <button
          onClick={onToggle}
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 0,
            textAlign: "left",
            color: "#E8EDF1",
          }}
        >
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>
              {product.name} {product.category && <span style={{ fontSize: 10, color: "#5C6B78", fontWeight: 400 }}> · {product.category}</span>}
            </div>
            <div style={{ fontSize: 12, color: "#8CA0AF", marginTop: 2 }}>
              {product.hasNutrients
                ? Object.entries(product.nutrients)
                    .map(([el, v]) => `${NUTRIENT_META[el]?.label ?? el} ${fmtNum(v)}${nutrientUnitSuffix(product)}`)
                    .join(" · ")
                : product.composition || product.description || "Sem dados nutricionais cadastrados"}
            </div>
          </div>
          <span
            style={{
              flexShrink: 0,
              marginLeft: 10,
              width: 26,
              height: 26,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: isSelected ? color : "#1B2530",
              color: isSelected ? "#0B1319" : "#8CA0AF",
            }}
          >
            {isSelected ? <X size={15} /> : <Plus size={15} />}
          </span>
        </button>
        {onRemove && (
          <button onClick={onRemove} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#F87171", padding: 4, marginLeft: 4 }}>
            <X size={14} />
          </button>
        )}
      </div>

      {isSelected && (
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <label style={{ fontSize: 11, flex: 1, color: "#8CA0AF" }}>
            Dose ({product.unit || "un"})
            <input type="number" step="0.01" value={doseValue} onChange={(e) => onUpdate("dose", e.target.value)} style={inputStyle} />
          </label>
          <label style={{ fontSize: 11, flex: 1, color: "#8CA0AF" }}>
            Preço (R$/{(product.unit || "un").split("/")[0]})
            <input type="number" step="0.01" value={priceValue} onChange={(e) => onUpdate("price", e.target.value)} style={inputStyle} />
          </label>
        </div>
      )}
    </div>
  );
}

function EquivChip({ label, brandLabel, color, isSelected, onClick, disabled }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      title={disabled ? "Sem dados nutricionais cadastrados para este produto" : undefined}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "5px 10px",
        borderRadius: 999,
        border: `1px solid ${isSelected ? color : "#24313D"}`,
        background: isSelected ? `${color}22` : disabled ? "transparent" : "#0F1720",
        color: disabled ? "#4A5866" : isSelected ? color : "#C7D2D9",
        fontSize: 11,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.7 : 1,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: disabled ? "#4A5866" : color, display: "inline-block" }} />
      {brandLabel && <span style={{ fontWeight: 700, fontSize: 9, textTransform: "uppercase" }}>{brandLabel}</span>}
      {label}
    </button>
  );
}

function EquivRow({ row, productsById, selected, onToggle }) {
  const agroProduct = row.agroceteProductId ? productsById.get(row.agroceteProductId) : null;
  return (
    <div style={{ borderTop: "1px solid #1E2A35", paddingTop: 10 }}>
      <div style={{ fontSize: 12, color: "#8CA0AF", marginBottom: 6 }}>{row.composition}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {agroProduct ? (
          <EquivChip
            label={agroProduct.name}
            brandLabel="Agrocete"
            color={AGROCETE_COLOR}
            isSelected={!!selected[agroProduct.id]}
            onClick={() => onToggle(agroProduct)}
          />
        ) : (
          <EquivChip label={row.agroceteName} brandLabel="Agrocete" color={AGROCETE_COLOR} disabled />
        )}
        {row.competitors.map((c, i) => {
          const product = c.productId ? productsById.get(c.productId) : null;
          const color = brandColor(c.brand);
          return product ? (
            <EquivChip key={i} label={c.name} brandLabel={c.brand} color={color} isSelected={!!selected[product.id]} onClick={() => onToggle(product)} />
          ) : (
            <EquivChip key={i} label={c.name} brandLabel={c.brand} color={color} disabled />
          );
        })}
      </div>
    </div>
  );
}

function AddCustomProductForm({ show, setShow, newProd, setNewProd, onSave }) {
  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        style={{
          marginTop: 4,
          width: "100%",
          padding: "10px",
          borderRadius: 10,
          border: "1.5px dashed #1FBF8F",
          background: "transparent",
          color: "#1FBF8F",
          fontWeight: 600,
          fontSize: 13,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}
      >
        <Plus size={15} /> Adicionar produto Agrocete manualmente
      </button>
    );
  }
  return (
    <div style={{ marginTop: 4, background: "#0F1720", border: "1.5px solid #1FBF8F", borderRadius: 10, padding: 12 }}>
      <label style={{ fontSize: 11, color: "#8CA0AF" }}>
        Nome do produto
        <input
          type="text"
          value={newProd.name}
          onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
          style={inputStyle}
          placeholder="Ex: GRAP Novo Produto"
        />
      </label>
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <label style={{ fontSize: 11, flex: 1, color: "#8CA0AF" }}>
          Unidade de dose
          <select value={newProd.unit} onChange={(e) => setNewProd({ ...newProd, unit: e.target.value })} style={inputStyle}>
            <option value="L/ha">L/ha</option>
            <option value="kg/ha">kg/ha</option>
          </select>
        </label>
        <label style={{ fontSize: 11, flex: 1, color: "#8CA0AF" }}>
          Dose padrão
          <input type="number" step="0.01" value={newProd.dose} onChange={(e) => setNewProd({ ...newProd, dose: e.target.value })} style={inputStyle} />
        </label>
        <label style={{ fontSize: 11, flex: 1, color: "#8CA0AF" }}>
          Preço (R$)
          <input type="number" step="0.01" value={newProd.price} onChange={(e) => setNewProd({ ...newProd, price: e.target.value })} style={inputStyle} />
        </label>
      </div>
      <div style={{ marginTop: 10 }}>
        <div style={{ fontSize: 11, marginBottom: 6, fontWeight: 600, color: "#8CA0AF" }}>Garantias (g por unidade de dose)</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
          {Object.entries(NUTRIENT_META).map(([key]) => (
            <label key={key} style={{ fontSize: 10, color: "#8CA0AF" }}>
              {key}
              <input
                type="number"
                step="0.01"
                value={newProd.nutrients[key] || ""}
                onChange={(e) => setNewProd({ ...newProd, nutrients: { ...newProd.nutrients, [key]: e.target.value } })}
                style={{ ...inputStyle, padding: "5px 6px" }}
              />
            </label>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button onClick={onSave} style={{ flex: 1, padding: "9px", borderRadius: 8, border: "none", background: "#1FBF8F", color: "#0B1319", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          Salvar produto
        </button>
        <button onClick={() => setShow(false)} style={{ padding: "9px 14px", borderRadius: 8, border: "1px solid #24313D", background: "transparent", color: "#8CA0AF", fontSize: 13, cursor: "pointer" }}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  marginTop: 3,
  padding: "7px 8px",
  borderRadius: 6,
  border: "1px solid #24313D",
  background: "#17212B",
  color: "#E8EDF1",
  fontSize: 12,
  boxSizing: "border-box",
  fontFamily: "inherit",
};
