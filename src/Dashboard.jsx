import React, { useState, useMemo, useEffect } from "react";
import {
  Leaf,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Pencil,
  X,
  Download,
  Layers,
  Building2,
  Lightbulb,
  AlertTriangle,
  TrendingUp,
  Sun,
  Moon,
  Gauge,
  ArrowRightLeft,
  Lock,
  Wifi,
  WifiOff,
  User,
} from "lucide-react";
import { PRODUCTS } from "./data/products.js";
import { EQUIVALENCES, EQUIVALENCE_FOOTNOTES } from "./data/equivalences.js";
import { COMPETITOR_BRANDS } from "./data/brands.js";
import "./dashboard.css";
import CurrentManagement from "./dashboard/CurrentManagement.jsx";
import TemplatesPanel from "./dashboard/TemplatesPanel.jsx";
import BottomSheet from "./dashboard/BottomSheet.jsx";
import QuickEditDrawer from "./dashboard/QuickEditDrawer.jsx";
import ManagementPresetsPanel from "./dashboard/ManagementPresetsPanel.jsx";
import SuggestionPanel from "./dashboard/SuggestionPanel.jsx";
import { suggestAgroceteProducts, uncoveredKeys } from "./dashboard/suggestAgrocete.js";
import { computeCostEfficiency, computeInsights, CostEfficiencyPanel, CompareBar, nutrientDelta, NutrientDelta } from "./dashboard/CostEfficiency.jsx";
import SearchAutocomplete from "./dashboard/SearchAutocomplete.jsx";
import { NutrientPillRow } from "./dashboard/NutrientPill.jsx";
import { nutrientColor } from "./dashboard/nutrientColors.js";
import { buildCategoryGroups, categoryGroupId } from "./dashboard/categoryGroups.js";

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

// Chips de filtro rápido por nutriente mais buscado (preenchem a busca).
const NUTRIENT_CHIP_KEYS = ["N", "P2O5", "K2O", "Ca", "Mg", "S", "B", "Zn", "Cu", "Mn"];

// Chips de categoria funcional (filtram de verdade pelo campo `category`,
// juntando as várias grafias que a planilha usa pra mesma coisa).
const CATEGORY_GROUPS = buildCategoryGroups(PRODUCTS);

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

function vibrate(ms) {
  try {
    if (navigator.vibrate) navigator.vibrate(ms);
  } catch {
    // navegador sem suporte — ignora silenciosamente
  }
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
  const [templates, setTemplates] = useState(() => loadPersistedState()?.templates ?? []);
  const [doseOverrides, setDoseOverrides] = useState(() => loadPersistedState()?.doseOverrides ?? {}); // id -> { dose, locked }
  const [mode, setMode] = useState("categoria"); // 'categoria' | 'marca'
  const [search, setSearch] = useState("");
  const [openEquivCategory, setOpenEquivCategory] = useState(null);
  const [openBrand, setOpenBrand] = useState(AGROCETE);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProd, setNewProd] = useState({ name: "", unit: "L/ha", dose: 1, price: 0, nutrients: {} });
  const [fineStep, setFineStep] = useState(false); // passo 0,1 (fino) vs 1,0 (grosso) nos steppers de dose
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [quickBrandOnly, setQuickBrandOnly] = useState(false); // chip "Somente Agrocete"
  const [activeChip, setActiveChip] = useState("all");
  const [editingProductId, setEditingProductId] = useState(null); // produto aberto no drawer de dose/preço
  const [presetInfo, setPresetInfo] = useState(null); // { label, notes } do último manejo pronto carregado
  const [transformInfo, setTransformInfo] = useState(null); // { count, uncovered } do último "Transformar em manejo Agrocete"
  const [brandFilter, setBrandFilter] = useState(""); // "" = todas as marcas
  const [categoryFilter, setCategoryFilter] = useState(null); // id de grupo em categoryGroups.js
  const [clientName, setClientName] = useState(() => loadPersistedState()?.clientName ?? ""); // fazenda/cliente que vai no PDF
  const [isOnline, setIsOnline] = useState(() => (typeof navigator === "undefined" ? true : navigator.onLine));

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ selected, customProducts, templates, doseOverrides, clientName }));
    } catch {
      // localStorage indisponível — ignora, estado só não persiste
    }
  }, [selected, customProducts, templates, doseOverrides, clientName]);

  // Status de conexão: o app roda 100% offline (todo o catálogo é local), mas
  // o consultor no campo precisa VER isso pra confiar — sem o indicador, uma
  // tela sem sinal parece app quebrado.
  useEffect(() => {
    function goOnline() {
      setIsOnline(true);
    }
    function goOffline() {
      setIsOnline(false);
    }
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  const allProducts = useMemo(() => [...PRODUCTS, ...customProducts], [customProducts]);
  const productsById = useMemo(() => new Map(allProducts.map((p) => [p.id, p])), [allProducts]);

  function toggleProduct(product) {
    vibrate(10);
    setSelected((prev) => {
      const next = { ...prev };
      if (next[product.id]) {
        delete next[product.id];
      } else {
        const overrideDose = doseOverrides[product.id]?.dose;
        next[product.id] = { dose: overrideDose ?? product.defaultDose ?? 0, price: product.defaultPrice ?? 0 };
      }
      return next;
    });
  }

  // Trava/destrava a dose atual de um produto como padrão persistido neste
  // aparelho (localStorage) — útil sobretudo pros produtos sem dose de
  // referência cadastrada, pra não ter que redigitar toda vez que for
  // selecionado de novo.
  function toggleDoseLock(productId, currentDose) {
    setDoseOverrides((prev) => {
      const cur = prev[productId];
      if (cur?.locked) {
        return { ...prev, [productId]: { ...cur, locked: false } };
      }
      return { ...prev, [productId]: { dose: parseFloat(currentDose) || 0, locked: true } };
    });
    vibrate(15);
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

  function saveTemplate(name) {
    setTemplates((prev) => [...prev, { id: genId("tpl"), name, selected, createdAt: Date.now() }]);
  }

  function loadTemplate(tpl) {
    setSelected(tpl.selected);
  }

  function deleteTemplate(id) {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  }

  function renameTemplate(id, newName) {
    setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, name: newName } : t)));
  }

  function loadPreset(selection, notes, label) {
    setSelected(selection);
    setPresetInfo({ label, notes });
    vibrate(15);
  }

  function addSuggested(s) {
    setSelected((prev) => ({ ...prev, [s.productId]: { dose: s.dose, price: s.price } }));
    vibrate(10);
  }

  function addAllSuggested(list) {
    setSelected((prev) => {
      const next = { ...prev };
      list.forEach((s) => {
        next[s.productId] = { dose: s.dose, price: s.price };
      });
      return next;
    });
    vibrate(15);
  }

  // "Transformar em manejo Agrocete": descarta o lado Agrocete atual (se
  // houver) e monta do zero, a partir do total de nutrientes do manejo
  // concorrente inteiro (qualquer combinação de marcas), a melhor
  // aproximação com produtos Agrocete reais — pra já ter uma base pronta
  // e só ajustar depois, sem precisar montar o comparativo manualmente.
  // Sempre dá um retorno visível (mesmo quando não acha nada pra
  // sugerir), pra nunca parecer que o botão não fez nada.
  function transformToAgrocete() {
    const fakeTotals = { comp: totals.comp, agro: { nutrients: {}, cost: 0, count: 0 } };
    const { suggestions, remaining, deficit } = suggestAgroceteProducts({ totals: fakeTotals, allNutrientKeys, allProducts, selected: {} });
    setSelected((prev) => {
      const next = {};
      Object.entries(prev).forEach(([id, sel]) => {
        const p = productsById.get(id);
        if (p && p.brand !== AGROCETE) next[id] = sel;
      });
      suggestions.forEach((s) => {
        next[s.productId] = { dose: s.dose, price: s.price };
      });
      return next;
    });
    const uncovered = uncoveredKeys(remaining, deficit).map((k) => NUTRIENT_META[k]?.label ?? k);
    setTransformInfo({ count: suggestions.length, uncovered });
    vibrate(20);
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

  const costEfficiency = useMemo(() => computeCostEfficiency(totals, allNutrientKeys), [totals, allNutrientKeys]);
  const insights = useMemo(() => computeInsights(costEfficiency, NUTRIENT_META), [costEfficiency]);

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

  // --- produtos por marca, filtrados por busca (nome, composição, categoria ou nutriente) ---
  const searchNorm = search.trim().toLowerCase();

  // Filtro combinado: busca textual E marca E grupo de categoria — os três
  // são cumulativos (ex: "Zinco" + marca YARA + Nutrição).
  function matchesFilters(p) {
    if (brandFilter && p.brand !== brandFilter) return false;
    if (categoryFilter && categoryGroupId(p.category) !== categoryFilter) return false;
    return matchesSearch(p);
  }

  function matchesSearch(p) {
    if (!searchNorm) return true;
    if (p.name.toLowerCase().includes(searchNorm)) return true;
    if (p.composition && p.composition.toLowerCase().includes(searchNorm)) return true;
    if (p.category && p.category.toLowerCase().includes(searchNorm)) return true;
    if (p.hasNutrients) {
      for (const key of Object.keys(p.nutrients)) {
        const label = (NUTRIENT_META[key]?.label ?? key).toLowerCase();
        if (key.toLowerCase().includes(searchNorm) || label.includes(searchNorm)) return true;
      }
    }
    return false;
  }

  const productsByBrand = useMemo(() => {
    const groups = {};
    allProducts.forEach((p) => {
      if (!groups[p.brand]) groups[p.brand] = [];
      groups[p.brand].push(p);
    });
    return groups;
  }, [allProducts]);

  const allBrands = quickBrandOnly ? [AGROCETE] : brandFilter ? [brandFilter] : [AGROCETE, ...COMPETITOR_BRANDS];
  const selectedCount = Object.keys(selected).length;
  const lockedCount = useMemo(() => Object.values(doseOverrides).filter((d) => d?.locked).length, [doseOverrides]);
  const anyFilterActive = !!(searchNorm || brandFilter || categoryFilter || quickBrandOnly);

  // --- chips de filtro rápido ---
  function selectAllChip() {
    setActiveChip("all");
    setSearch("");
    setQuickBrandOnly(false);
    setBrandFilter("");
    setCategoryFilter(null);
  }
  function selectAgroceteChip() {
    setActiveChip("agrocete");
    setSearch("");
    setQuickBrandOnly(true);
    setBrandFilter("");
    setCategoryFilter(null);
    setMode("marca");
    setOpenBrand(AGROCETE);
  }
  function selectNutrientChip(key) {
    setActiveChip(`nutrient:${key}`);
    setQuickBrandOnly(false);
    setCategoryFilter(null);
    setSearch(NUTRIENT_META[key]?.label ?? key);
    setMode("marca");
  }
  // Filtro por grupo de categoria (Nutrição, Solo, Trat. de sementes,
  // Biológicos, Adjuvantes) — diferente do chip de nutriente, esse não mexe na
  // busca: filtra de verdade pelo campo `category`, então dá pra combinar com
  // uma busca textual por cima.
  function selectCategoryGroupChip(groupId) {
    const next = categoryFilter === groupId ? null : groupId;
    setCategoryFilter(next);
    setActiveChip(next ? `catgroup:${next}` : "all");
    setQuickBrandOnly(false);
    setMode("marca");
  }
  function handleSearchChange(value) {
    setSearch(value);
    setActiveChip(null);
  }
  function handleBrandFilterChange(brand) {
    setBrandFilter(brand);
    setQuickBrandOnly(false);
    if (brand) {
      setMode("marca");
      setOpenBrand(brand);
    }
  }

  const editingProduct = editingProductId ? productsById.get(editingProductId) : null;

  async function exportPDF() {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    let y = 15;

    doc.setFontSize(16);
    doc.text("Comparativo de Portfólio — Agrocete x Mercado", 14, y);
    y += 7;
    const client = clientName.trim();
    if (client) {
      doc.setFontSize(12);
      doc.text(doc.splitTextToSize(client, 180), 14, y);
      y += 6;
    }
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

    if (insights.length > 0) {
      if (y > 255) {
        doc.addPage();
        y = 15;
      }
      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      doc.text("Custo-benefício por nutriente — insights", 14, y);
      doc.setFont(undefined, "normal");
      y += 7;
      doc.setFontSize(9);
      insights.forEach((ins) => {
        const lines = doc.splitTextToSize(`- ${ins.text}`, 180);
        if (y + lines.length * 5 > 280) {
          doc.addPage();
          y = 15;
        }
        doc.text(lines, 14, y);
        y += lines.length * 5 + 1;
      });
      y += 5;
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

    // Nome do arquivo com o cliente (sem acento/símbolo, pra não quebrar em
    // Windows/Android) — assim várias propostas não viram "(1)", "(2)".
    const slug = client
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase()
      .slice(0, 40);
    doc.save(slug ? `comparativo-agrocete-${slug}.pdf` : "comparativo-portfolio-agrocete.pdf");
  }

  const hasBothSides = totals.agro.count > 0 && totals.comp.count > 0;

  return (
    <div
      className={highContrast ? "high-contrast" : undefined}
      style={{
        minHeight: "100vh",
        background: highContrast ? "#000000" : "#0F1720",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#FFFFFF",
      }}
    >
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
            <div className="muted" style={{ fontSize: 11 }}>Comparador de Portfólio x Mercado</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <StatusPill label="Produtos" value={fmtNum(PRODUCTS.length)} />
          <StatusPill label="Marcas" value={COMPETITOR_BRANDS.length} />
          <StatusPill
            label={lockedCount === 1 ? "Dose travada" : "Doses travadas"}
            value={lockedCount}
            color={lockedCount > 0 ? "#F5A524" : undefined}
            icon={lockedCount > 0 ? <Lock size={11} /> : null}
            title={
              lockedCount > 0
                ? `${lockedCount} dose${lockedCount > 1 ? "s" : ""} fixada${lockedCount > 1 ? "s" : ""} como padrão neste aparelho`
                : "Nenhuma dose travada ainda"
            }
          />
          <span
            title={
              isOnline
                ? "Com internet — o app funciona igual sem sinal, todo o catálogo está no aparelho"
                : "Sem internet — o app continua funcionando normalmente, o catálogo inteiro está salvo no aparelho"
            }
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontSize: 11,
              fontWeight: 700,
              padding: "4px 9px",
              borderRadius: 999,
              background: isOnline ? "#1FBF8F14" : "#F5A52422",
              border: `1px solid ${isOnline ? "#1FBF8F44" : "#F5A52466"}`,
              color: isOnline ? "#1FBF8F" : "#F5A524",
              whiteSpace: "nowrap",
            }}
          >
            {isOnline ? <Wifi size={11} /> : <WifiOff size={11} />}
            {isOnline ? "Online" : "Offline — funciona normal"}
          </span>
          <button
            onClick={() => setHighContrast(!highContrast)}
            className="tap-scale"
            title={highContrast ? "Desativar alto contraste" : "Ativar alto contraste (sol forte)"}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: `1px solid ${highContrast ? AGROCETE_COLOR : "#24313D"}`,
              background: highContrast ? `${AGROCETE_COLOR}22` : "#17212B",
              color: highContrast ? AGROCETE_COLOR : "#8CA0AF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            {highContrast ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1360, margin: "0 auto", padding: "20px 16px 140px" }}>
      <div className="dash-grid">
      <div>
        {/* PASSO 1 — ACHAR O PRODUTO */}
        <StepLabel n={1} title="Ache o produto concorrente" />

        <div style={{ marginBottom: 10 }}>
          <SearchAutocomplete
            value={search}
            onChange={handleSearchChange}
            products={allProducts}
            selected={selected}
            onPick={toggleProduct}
            brandColor={brandColor}
            agroceteBrand={AGROCETE}
            placeholder="Buscar produto, marca, composição ou nutriente..."
          />
        </div>

        {/* FILTRO POR MARCA */}
        <div style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center" }}>
          <select
            value={brandFilter}
            onChange={(e) => handleBrandFilterChange(e.target.value)}
            aria-label="Filtrar por marca"
            style={{
              flex: 1,
              minWidth: 0,
              minHeight: 44,
              padding: "10px 12px",
              borderRadius: 10,
              border: `1px solid ${brandFilter ? `${brandColor(brandFilter)}88` : "#24313D"}`,
              background: "#17212B",
              color: brandFilter ? brandColor(brandFilter) : "#8CA0AF",
              fontSize: 13,
              fontWeight: brandFilter ? 700 : 400,
              fontFamily: "inherit",
              cursor: "pointer",
              boxSizing: "border-box",
            }}
          >
            <option value="">Todas as marcas ({COMPETITOR_BRANDS.length + 1})</option>
            <option value={AGROCETE}>AGROCETE (nossos produtos)</option>
            {COMPETITOR_BRANDS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          {anyFilterActive && (
            <button
              onClick={selectAllChip}
              className="tap-scale"
              title="Limpar busca, marca e categoria"
              style={{
                minHeight: 44,
                padding: "0 14px",
                borderRadius: 10,
                border: "1px solid #24313D",
                background: "#17212B",
                color: "#8CA0AF",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              Limpar
            </button>
          )}
        </div>

        {/* CHIPS DE CATEGORIA (filtro de verdade pelo campo category) */}
        <div className="filter-chip-row" style={{ marginBottom: 8 }}>
          {CATEGORY_GROUPS.map((g) => (
            <FilterChip
              key={g.id}
              label={`${g.label} (${g.count})`}
              active={categoryFilter === g.id}
              onClick={() => selectCategoryGroupChip(g.id)}
              color="#38BDF8"
            />
          ))}
        </div>

        {/* CHIPS DE NUTRIENTE / ATALHOS */}
        <div className="filter-chip-row" style={{ marginBottom: 14 }}>
          <FilterChip label="Todos" active={activeChip === "all"} onClick={selectAllChip} />
          <FilterChip label="Somente Agrocete" active={activeChip === "agrocete"} onClick={selectAgroceteChip} color={AGROCETE_COLOR} />
          {NUTRIENT_CHIP_KEYS.map((key) => (
            <FilterChip
              key={key}
              label={NUTRIENT_META[key]?.label ?? key}
              active={activeChip === `nutrient:${key}`}
              onClick={() => selectNutrientChip(key)}
              color={nutrientColor(key)}
            />
          ))}
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
                    className="tap-scale"
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
                  <div className={`accordion-body${isOpen ? " open" : ""}`}>
                    <div style={{ padding: "0 14px 14px", display: "flex", flexDirection: "column", gap: 12 }}>
                      {filteredRows.map((row, i) => (
                        <EquivRow key={i} row={row} productsById={productsById} selected={selected} onToggle={toggleProduct} />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
            <p className="muted-soft" style={{ fontSize: 11, marginTop: 8 }}>
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
                const products = (productsByBrand[brand] || []).filter(matchesFilters);
                const brandSelectedCount = (productsByBrand[brand] || []).filter((p) => selected[p.id]).length;
                // Com qualquer filtro ativo, marca sem resultado some da lista
                // (senão vira uma parede de acordeões vazios em 57 marcas).
                if (anyFilterActive && products.length === 0) return null;
                const color = brandColor(brand);
                return (
                  <div key={brand} style={{ background: "#17212B", borderRadius: 12, border: "1px solid #24313D", overflow: "hidden" }}>
                    <button
                      onClick={() => setOpenBrand(isOpen ? null : brand)}
                      className="tap-scale"
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
                        <span className="muted-soft" style={{ fontSize: 11 }}>
                          {anyFilterActive
                            ? `${products.length} de ${(productsByBrand[brand] || []).length}`
                            : `${(productsByBrand[brand] || []).length} produtos`}
                        </span>
                        {brandSelectedCount > 0 && (
                          <span style={{ fontSize: 11, background: "#233241", padding: "2px 7px", borderRadius: 999, fontWeight: 600 }}>
                            {brandSelectedCount} ativo{brandSelectedCount > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    {/* Montagem condicional (não a transição suave via CSS) de propósito: uma marca pode
                        ter 60+ produtos, então só renderiza a lista quando o painel está aberto. */}
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
                            onOpenEditor={() => setEditingProductId(product.id)}
                            doseLocked={!!doseOverrides[product.id]?.locked}
                          />
                        ))}
                        {products.length === 0 && <p className="muted-soft" style={{ fontSize: 12 }}>Nenhum produto encontrado para essa busca.</p>}
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

      </div>

      <aside className="dash-sidebar">
        <ManagementPresetsPanel onLoad={loadPreset} />

        {presetInfo && (
          <div style={{ background: "#F5A52414", border: "1px solid #F5A52444", borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 11 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: presetInfo.notes.length > 0 ? 8 : 0 }}>
              <strong style={{ fontSize: 12 }}>{presetInfo.label} carregado</strong>
              <button onClick={() => setPresetInfo(null)} className="tap-scale" style={{ background: "transparent", border: "none", color: "#F5A524", cursor: "pointer", padding: 2 }} aria-label="Dispensar">
                <X size={13} />
              </button>
            </div>
            {presetInfo.notes.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {presetInfo.notes.map((n, i) => {
                  const prod = productsById.get(n.productId);
                  return (
                    <div key={i} className="muted-soft">
                      <strong style={{ color: "#C7D2D9" }}>{prod?.name ?? n.productId}</strong> ({n.stage}): {n.note}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <StepLabel n={2} title="Ajuste a dose e trave se quiser" />
        <CurrentManagement selected={selected} productsById={productsById} brandColor={brandColor} onToggle={toggleProduct} onEdit={(p) => setEditingProductId(p.id)} />

        {totals.comp.count > 0 && (
          <button
            onClick={transformToAgrocete}
            className="tap-scale"
            title="Descarta o lado Agrocete atual e monta um novo, a partir dos nutrientes do manejo concorrente selecionado (qualquer marca)."
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "12px",
              borderRadius: 10,
              border: `1.5px solid ${AGROCETE_COLOR}`,
              background: `${AGROCETE_COLOR}1A`,
              color: AGROCETE_COLOR,
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              marginBottom: transformInfo ? 8 : 16,
            }}
          >
            <ArrowRightLeft size={15} /> Transformar em manejo Agrocete
          </button>
        )}

        {transformInfo && (
          <div
            style={{
              background: transformInfo.count > 0 ? "#1FBF8F14" : "#F5A52414",
              border: `1px solid ${transformInfo.count > 0 ? "#1FBF8F44" : "#F5A52444"}`,
              borderRadius: 10,
              padding: 12,
              marginBottom: 16,
              fontSize: 11,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: transformInfo.uncovered.length > 0 ? 6 : 0 }}>
              <strong style={{ fontSize: 12, color: transformInfo.count > 0 ? AGROCETE_COLOR : "#F5A524" }}>
                {transformInfo.count > 0 ? `${transformInfo.count} produto${transformInfo.count > 1 ? "s" : ""} Agrocete adicionado${transformInfo.count > 1 ? "s" : ""}` : "Nenhum produto Agrocete encontrado"}
              </strong>
              <button onClick={() => setTransformInfo(null)} className="tap-scale" style={{ background: "transparent", border: "none", color: "#8CA0AF", cursor: "pointer", padding: 2 }} aria-label="Dispensar">
                <X size={13} />
              </button>
            </div>
            {transformInfo.uncovered.length > 0 && (
              <p className="muted-soft" style={{ margin: 0 }}>
                Cobertura ainda incompleta para: <strong style={{ color: "#C7D2D9" }}>{transformInfo.uncovered.join(", ")}</strong> — pode ser que nenhum produto do catálogo concentre o suficiente, ou que valha a pena complementar manualmente.
              </p>
            )}
          </div>
        )}

        <TemplatesPanel
          templates={templates}
          selectedCount={selectedCount}
          onSave={saveTemplate}
          onLoad={loadTemplate}
          onDelete={deleteTemplate}
          onRename={renameTemplate}
        />

        {/* COMPARATIVO */}
        {allNutrientKeys.length > 0 && (
          <section id="comparativo" style={{ scrollMarginTop: 16 }}>
            <StepLabel n={3} title="Compare com a Agrocete" />
            <SectionHeading icon={<TrendingUp size={16} />} title="Comparativo de nutrientes (g/ha)" />
            <div style={{ background: "#17212B", borderRadius: 12, border: "1px solid #24313D", padding: 14, marginBottom: 12 }}>
              <div style={{ display: "flex", gap: 14, fontSize: 11, marginBottom: 12 }}>
                <LegendDot color="#6B7A88" label="Concorrentes" />
                <LegendDot color={AGROCETE_COLOR} label="Agrocete" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {allNutrientKeys.map((key) => {
                  const compVal = totals.comp.nutrients[key] || 0;
                  const agroVal = totals.agro.nutrients[key] || 0;
                  const delta = nutrientDelta(agroVal, compVal);
                  return (
                    <div key={key}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, marginBottom: 4, gap: 8, flexWrap: "wrap" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
                          <span style={{ width: 9, height: 9, borderRadius: 3, background: nutrientColor(key), display: "inline-block", flexShrink: 0 }} />
                          {NUTRIENT_META[key]?.label ?? key}
                          <NutrientDelta delta={delta} />
                        </span>
                        <span className="muted">
                          {fmtNum(compVal)} g vs {fmtNum(agroVal)} g
                        </span>
                      </div>
                      <CompareBar agroVal={agroVal} compVal={compVal} height={12} />
                    </div>
                  );
                })}
              </div>
            </div>

            <SuggestionPanel
              totals={totals}
              allNutrientKeys={allNutrientKeys}
              allProducts={allProducts}
              selected={selected}
              productsById={productsById}
              nutrientMeta={NUTRIENT_META}
              onAdd={addSuggested}
              onAddAll={addAllSuggested}
            />

            <SectionHeading icon={<Gauge size={16} />} title="Custo-benefício por nutriente" />
            <CostEfficiencyPanel costEfficiency={costEfficiency} insights={insights} nutrientMeta={NUTRIENT_META} />

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
                      {headToHead.agroP.name} <span className="muted">vs</span> {headToHead.compP.name} ({headToHead.compP.brand})
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

            {/* CLIENTE / FAZENDA — vai no cabeçalho do PDF e no nome do arquivo */}
            <label style={{ display: "block", marginTop: 16 }}>
              <span className="muted" style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
                <User size={12} /> Cliente / fazenda (aparece no PDF)
              </span>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ex: Fazenda Santa Helena — João Pereira"
                style={{
                  width: "100%",
                  minHeight: 44,
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #24313D",
                  background: "#17212B",
                  color: "#E8EDF1",
                  fontSize: 13,
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
              />
            </label>

            <button
              onClick={exportPDF}
              className="tap-scale"
              style={{
                marginTop: 10,
                width: "100%",
                padding: "14px",
                minHeight: 48,
                borderRadius: 10,
                border: "none",
                background: AGROCETE_COLOR,
                color: "#0B1319",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
              }}
            >
              <Download size={16} /> Exportar comparativo em PDF
            </button>
          </section>
        )}

        {allNutrientKeys.length === 0 && (
          <div className="muted" style={{ textAlign: "center", fontSize: 13, padding: "30px 10px" }}>
            Selecione produtos no catálogo (por categoria ou por marca) para ver o comparativo de nutrientes e custo lado a lado.
          </div>
        )}
      </aside>
      </div>
      </main>

      <div className="mobile-only">
        <BottomSheet
          totals={totals}
          nutrientMeta={NUTRIENT_META}
          expanded={sheetExpanded}
          setExpanded={setSheetExpanded}
          hasBothSides={hasBothSides}
          onExportPDF={exportPDF}
        />
      </div>

      {editingProduct && (
        <QuickEditDrawer
          product={editingProduct}
          color={brandColor(editingProduct.brand)}
          doseValue={selected[editingProduct.id]?.dose}
          priceValue={selected[editingProduct.id]?.price}
          onUpdate={(field, value) => updateSelected(editingProduct.id, field, value)}
          onClose={() => setEditingProductId(null)}
          fineStep={fineStep}
          onToggleFineStep={() => setFineStep((v) => !v)}
          locked={!!doseOverrides[editingProduct.id]?.locked}
          onToggleLock={(currentDose) => toggleDoseLock(editingProduct.id, currentDose)}
        />
      )}
    </div>
  );
}

// Estatística compacta da barra superior (produtos, marcas, doses travadas).
function StatusPill({ label, value, color, icon, title }) {
  return (
    <span
      title={title}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 11,
        padding: "4px 9px",
        borderRadius: 999,
        background: color ? `${color}1A` : "#17212B",
        border: `1px solid ${color ? `${color}55` : "#24313D"}`,
        color: color || "#96A8B5",
        whiteSpace: "nowrap",
      }}
    >
      {icon}
      <strong style={{ fontWeight: 700, color: color || "#E8EDF1" }}>{value}</strong>
      {label}
    </span>
  );
}

// Numerador do fluxo em 3 passos (achar produto → dose/trava → comparativo),
// pra deixar explícito o caminho que o consultor percorre.
function StepLabel({ n, title }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
      <span
        style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "#1FBF8F22",
          border: "1px solid #1FBF8F66",
          color: "#1FBF8F",
          fontSize: 11,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {n}
      </span>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "#9AACB8" }}>{title}</span>
    </div>
  );
}

function ModeTab({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className="tap-scale"
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

function FilterChip({ label, active, onClick, color = "#1FBF8F" }) {
  return (
    <button
      onClick={onClick}
      className="tap-scale"
      style={{
        flexShrink: 0,
        whiteSpace: "nowrap",
        padding: "6px 12px",
        borderRadius: 999,
        border: `1px solid ${active ? color : "#24313D"}`,
        background: active ? `${color}22` : "#17212B",
        color: active ? color : "#9AACB8",
        fontSize: 12,
        fontWeight: active ? 700 : 500,
        cursor: "pointer",
      }}
    >
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
      <span className="muted">{label}</span>
    </div>
  );
}

function CostCard({ label, value, color }) {
  return (
    <div style={{ flex: 1, background: "#17212B", border: `1.5px solid ${color}44`, borderRadius: 10, padding: 12 }}>
      <div className="muted" style={{ fontSize: 11 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color, marginTop: 2 }}>R$ {value.toFixed(2)}</div>
    </div>
  );
}

// Card compacto: sem lista selecionada é 1 linha (nome + garantias + botão
// +), quando selecionado ganha só uma segunda linha com dose rápida (+/-) e
// preço — a edição completa (slider, passo fino) mora no QuickEditDrawer,
// pra não empilhar formulário dentro da rolagem do catálogo.
function ProductCard({ product, color, isSelected, onToggle, onUpdate, doseValue, priceValue, onRemove, onOpenEditor, doseLocked }) {
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = React.useRef(0);

  function onTouchStart(e) {
    if (isSelected) return;
    startX.current = e.touches[0].clientX;
    setDragging(true);
  }
  function onTouchMove(e) {
    if (isSelected || !dragging) return;
    const delta = e.touches[0].clientX - startX.current;
    if (delta > 0) setDx(delta);
  }
  function onTouchEnd() {
    if (isSelected) return;
    setDragging(false);
    if (dx > 72) onToggle();
    setDx(0);
  }

  function quickBump(dir) {
    const step = 1;
    const next = Math.max(0, Math.round(((parseFloat(doseValue) || 0) + dir * step) * 100) / 100);
    onUpdate("dose", String(next));
  }

  return (
    <div style={{ position: "relative", overflow: !isSelected ? "hidden" : "visible", borderRadius: 10 }}>
      {!isSelected && (
        <div className="swipe-add-hint">
          <Plus size={16} color="#0B1319" />
        </div>
      )}
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          position: "relative",
          border: `1.5px solid ${isSelected ? color : "#24313D"}`,
          borderRadius: 10,
          padding: "9px 10px",
          background: isSelected ? color : "#0F1720",
          transform: `translateX(${dx}px)`,
          transition: dragging ? "none" : "transform 0.2s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start" }}>
          <button
            onClick={onToggle}
            className="tap-scale"
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
              color: isSelected ? "#0B1319" : "#E8EDF1",
              minWidth: 0,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>
                {product.name}{" "}
                {product.category && (
                  <span style={{ fontSize: 10, color: isSelected ? "#0B131999" : "#8298A6", fontWeight: 400 }}> · {product.category}</span>
                )}
              </div>
              {/* Pills coloridas por nutriente: cor fixa por elemento, então dá
                  pra bater o olho e ver "tem N, tem Zn" sem ler. Quando o
                  produto não tem dado nutricional, cai no texto de composição. */}
              {product.hasNutrients ? (
                <NutrientPillRow
                  nutrients={product.nutrients}
                  unit={nutrientUnitSuffix(product)}
                  meta={NUTRIENT_META}
                  max={5}
                  compact
                  onBrandBg={isSelected}
                />
              ) : (
                <div
                  style={{
                    fontSize: 12,
                    color: isSelected ? "#0B1319CC" : "#9AACB8",
                    marginTop: 2,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {product.composition || product.description || "Sem dados nutricionais cadastrados"}
                </div>
              )}
            </div>
            <span
              style={{
                flexShrink: 0,
                marginLeft: 10,
                width: 40,
                height: 40,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: isSelected ? "#0B1319" : "#1B2530",
                color: isSelected ? color : "#9AACB8",
              }}
            >
              {isSelected ? <X size={17} /> : <Plus size={17} />}
            </span>
          </button>
          {onRemove && (
            <button
              onClick={onRemove}
              className="tap-scale"
              style={{ background: "transparent", border: "none", cursor: "pointer", color: isSelected ? "#0B1319" : "#F87171", padding: 4, marginLeft: 4 }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {isSelected && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <button type="button" onClick={() => quickBump(-1)} className="tap-scale" style={quickStepBtnStyle} aria-label="Diminuir dose">
                <Minus size={15} />
              </button>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#0B1319", minWidth: 46, textAlign: "center" }}>
                {doseValue}
                {product.unit ? product.unit.split("/")[0] : ""}
              </span>
              <button type="button" onClick={() => quickBump(1)} className="tap-scale" style={quickStepBtnStyle} aria-label="Aumentar dose">
                <Plus size={15} />
              </button>
            </div>
            {doseLocked && (
              <span
                title="Dose travada como padrão desse produto neste aparelho"
                style={{ display: "inline-flex", alignItems: "center", gap: 3, background: "#0B1319", color: "#F5A524", borderRadius: 999, padding: "3px 7px", fontSize: 10, fontWeight: 700, flexShrink: 0 }}
              >
                <Lock size={10} /> travada
              </span>
            )}
            <span style={{ fontSize: 11, color: "#0B1319CC" }}>R$ {fmtNum(parseFloat(priceValue) || 0)}</span>
            <button
              type="button"
              onClick={onOpenEditor}
              className="tap-scale"
              style={{ marginLeft: "auto", background: "#0B1319", border: "none", borderRadius: 9, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", color, cursor: "pointer", flexShrink: 0 }}
              aria-label="Editar dose e preço"
              title="Editar dose, preço e travar dose"
            >
              <Pencil size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Alvo de toque grande o bastante pra usar de luva/no trator (~40px, dentro da
// recomendação de 48px contando o espaçamento em volta).
const quickStepBtnStyle = {
  width: 38,
  height: 38,
  borderRadius: 9,
  border: "1px solid #0B131944",
  background: "#0B131922",
  color: "#0B1319",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  flexShrink: 0,
};

function EquivChip({ label, brandLabel, color, isSelected, onClick, disabled }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={disabled ? undefined : "tap-scale"}
      title={disabled ? "Sem dados nutricionais cadastrados para este produto" : undefined}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "5px 10px",
        borderRadius: 999,
        border: `1px solid ${isSelected ? color : "#24313D"}`,
        background: isSelected ? color : disabled ? "transparent" : "#0F1720",
        color: disabled ? "#4A5866" : isSelected ? "#0B1319" : "#C7D2D9",
        fontWeight: isSelected ? 700 : 400,
        fontSize: 11,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.7 : 1,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: disabled ? "#4A5866" : isSelected ? "#0B1319" : color, display: "inline-block" }} />
      {brandLabel && <span style={{ fontWeight: 700, fontSize: 9, textTransform: "uppercase" }}>{brandLabel}</span>}
      {label}
    </button>
  );
}

function EquivRow({ row, productsById, selected, onToggle }) {
  const agroProduct = row.agroceteProductId ? productsById.get(row.agroceteProductId) : null;
  return (
    <div style={{ borderTop: "1px solid #1E2A35", paddingTop: 10 }}>
      <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>{row.composition}</div>
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
