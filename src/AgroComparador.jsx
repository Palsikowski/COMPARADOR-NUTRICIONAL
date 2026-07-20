import React, { useState, useMemo, useEffect } from "react";
import { Leaf, Droplet, Plus, X, ChevronDown, ChevronUp, FlaskConical, Download } from "lucide-react";

// ---------------------------------------------------------------------------
// DADOS DE PRODUTOS — extraídos dos catálogos do projeto (garantias de
// nutrientes convertidas para gramas por unidade de dose: g/L para líquidos,
// g/kg para sólidos). Fonte de cada produto indicada no campo `fonte`.
// ---------------------------------------------------------------------------

const NUTRIENT_META = {
  N: { label: "Nitrogênio", group: "macro" },
  P: { label: "Fósforo (P)", group: "macro" },
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
};

const GROUP_COLOR = {
  macro: "#5C8A3A",
  secundario: "#3E6E8E",
  micro: "#B5723A",
};

const COMPANIES = [
  {
    id: "fortgreen",
    name: "Fortgreen",
    color: "#3B6B35",
    products: [
      {
        id: "fg-sd",
        name: "Linha SD",
        unit: "kg/ha",
        defaultDose: 1.0,
        nutrients: { P: 30, Mg: 30, S: 140, Cu: 10, Mn: 95, Zn: 95 },
        fonte: "Guia de Bolso Fortgreen 2024/25",
      },
      {
        id: "fg-frutfik",
        name: "FrutfiK",
        unit: "L/ha",
        defaultDose: 3,
        nutrients: { K2O: 287.7 },
        fonte: "Guia de Bolso Grãos Digital 2022",
      },
    ],
  },
  {
    id: "stoller",
    name: "Stoller",
    color: "#8A5A1E",
    products: [
      {
        id: "st-nb",
        name: "Elementar N+B",
        unit: "L/ha",
        defaultDose: 1,
        nutrients: { N: 67.0, B: 134.0 },
        fonte: "Guia de Bolso Grãos Digital 2022 — Linha elementar",
      },
      {
        id: "st-nmg",
        name: "Elementar N+Mg",
        unit: "L/ha",
        defaultDose: 1,
        nutrients: { N: 66.5, Mg: 106.4 },
        fonte: "Guia de Bolso Grãos Digital 2022 — Linha elementar",
      },
      {
        id: "st-nsmn",
        name: "Elementar N+S+Mn",
        unit: "L/ha",
        defaultDose: 1,
        nutrients: { N: 66.0, S: 52.8, Mn: 92.4 },
        fonte: "Guia de Bolso Grãos Digital 2022 — Linha elementar",
      },
      {
        id: "st-nsfe",
        name: "Elementar N+S+Fe",
        unit: "L/ha",
        defaultDose: 1,
        nutrients: { N: 58.5, S: 24.5, Fe: 46.8 },
        fonte: "Guia de Bolso Grãos Digital 2022 — Linha elementar",
      },
      {
        id: "st-can",
        name: "Solução Ca+N fisiológico",
        unit: "L/ha",
        defaultDose: 2,
        nutrients: { N: 230.4, Ca: 89.6 },
        fonte: "Guia de Bolso Grãos Digital 2022",
      },
    ],
  },
  {
    id: "icl",
    name: "ICL — Kellus",
    color: "#2C5F8A",
    products: [
      {
        id: "icl-mnznp",
        name: "Kellus Mn+Zn+P",
        unit: "kg/ha",
        defaultDose: 0.5,
        nutrients: { Mn: 90, Zn: 30, P: 30 },
        fonte: "Portfólio ICL 2023",
      },
      {
        id: "icl-znmncu",
        name: "Kellus Zn+Mn+Cu",
        unit: "kg/ha",
        defaultDose: 0.5,
        nutrients: { Zn: 80, Mn: 50, Cu: 5 },
        fonte: "Portfólio ICL 2023",
      },
      {
        id: "icl-mn",
        name: "Kellus Mn 12,5%",
        unit: "kg/ha",
        defaultDose: 0.5,
        nutrients: { Mn: 125 },
        fonte: "Portfólio ICL 2023",
      },
      {
        id: "icl-zn",
        name: "Kellus Zn 14,7%",
        unit: "kg/ha",
        defaultDose: 0.5,
        nutrients: { Zn: 147 },
        fonte: "Portfólio ICL 2023",
      },
    ],
  },
  {
    id: "ballagro",
    name: "Ballagro",
    color: "#6B4A8A",
    products: [
      {
        id: "ba-arrel",
        name: "Arrel",
        unit: "L/ha",
        defaultDose: 1,
        nutrients: { Mo: 99, Ni: 13.2, Co: 9.9 },
        fonte: "Folder Digital Ballagro 2023 (convertido de %m/m x densidade)",
      },
      {
        id: "ba-sten",
        name: "Sten",
        unit: "L/ha",
        defaultDose: 1,
        nutrients: { N: 49.35, P2O5: 35.25, K2O: 35.25, S: 7.05, Mo: 56.4, Mn: 28.2, Ni: 14.1 },
        fonte: "Folder Digital Ballagro 2023 (convertido de %m/m x densidade)",
      },
    ],
  },
];

const GRAP_FONTE = "Folheto de Garantias Agrocete — Linha GRAP, maio/2023 (convertido de %m/m x densidade)";

// Catálogo oficial da Linha GRAP (Agrocete). Produtos sem garantia de
// nutrientes no folheto (adjuvantes, inoculantes, limpeza) não entram aqui,
// pois não há o que comparar no gráfico de nutrientes.
const GRAP_CATALOG = [
  { id: "grap-102cab", name: "GRAP 102 CAB", unit: "L/ha", defaultDose: 1, nutrients: { Ca: 135.0, S: 27.0 }, fonte: GRAP_FONTE },
  { id: "grap-104fluid", name: "GRAP 104 FLUID", unit: "L/ha", defaultDose: 1, nutrients: { S: 52.8, Zn: 132.0 }, fonte: GRAP_FONTE },
  { id: "grap-140fluid", name: "GRAP 140 FLUID", unit: "L/ha", defaultDose: 1, nutrients: { S: 100.1, Mn: 171.6 }, fonte: GRAP_FONTE },
  { id: "grap-110je", name: "GRAP 110 JE", unit: "L/ha", defaultDose: 1, nutrients: { B: 14.0, Mo: 140.0 }, fonte: GRAP_FONTE },
  { id: "grap-165je", name: "GRAP 165 JE", unit: "L/ha", defaultDose: 1, nutrients: { B: 24.2, Mo: 241.5 }, fonte: GRAP_FONTE },
  { id: "grap-15mol", name: "GRAP 15 MOL", unit: "L/ha", defaultDose: 1, nutrients: { Mo: 226.5 }, fonte: GRAP_FONTE },
  { id: "grap-30k", name: "GRAP 30K", unit: "L/ha", defaultDose: 1, nutrients: { K2O: 435.0 }, fonte: GRAP_FONTE },
  { id: "grap-boric", name: "GRAP BORIC", unit: "L/ha", defaultDose: 1, nutrients: { B: 130.0 }, fonte: GRAP_FONTE },
  { id: "grap-cafe", name: "GRAP CAFÉ", unit: "L/ha", defaultDose: 1, nutrients: { N: 130.0, S: 32.5, B: 13.0, Mo: 0.65, Zn: 65.0 }, fonte: GRAP_FONTE },
  { id: "grap-cobre", name: "GRAP COBRE", unit: "L/ha", defaultDose: 1, nutrients: { S: 38.9, Cu: 76.7 }, fonte: GRAP_FONTE },
  { id: "grap-evics", name: "GRAP EVIC-S", unit: "L/ha", defaultDose: 1, nutrients: { N: 146.3, S: 332.5 }, fonte: GRAP_FONTE },
  { id: "grap-ferro", name: "GRAP Ferro", unit: "L/ha", defaultDose: 1, nutrients: { S: 30.0, Fe: 54.0 }, fonte: GRAP_FONTE },
  { id: "grap-frutas", name: "GRAP FRUTAS", unit: "L/ha", defaultDose: 1, nutrients: { S: 29.3, B: 5.9, Co: 5.9, Cu: 5.9, Mn: 5.9, Mo: 0.2, Zn: 35.1 }, fonte: GRAP_FONTE },
  { id: "grap-grad", name: "GRAP GRAD", unit: "L/ha", defaultDose: 1, nutrients: { Mg: 89.6 }, fonte: `${GRAP_FONTE} — ácidos carboxílicos` },
  { id: "grap-magnesio", name: "GRAP Magnésio", unit: "L/ha", defaultDose: 1, nutrients: { Mg: 111.4 }, fonte: GRAP_FONTE },
  { id: "grap-mnrrplus", name: "GRAP Manganês rr Plus", unit: "L/ha", defaultDose: 1, nutrients: { S: 50.0, Mn: 87.5 }, fonte: GRAP_FONTE },
  { id: "grap-mont15", name: "GRAP MONT 15", unit: "L/ha", defaultDose: 1, nutrients: { S: 67.5, B: 6.8, Mn: 81.0, Mo: 1.4, Zn: 40.5 }, fonte: GRAP_FONTE },
  { id: "grap-nitro", name: "GRAP NITRO", unit: "L/ha", defaultDose: 1, nutrients: { N: 384.0 }, fonte: `${GRAP_FONTE} — N nítrico e amoniacal` },
  { id: "grap-p306", name: "GRAP P-306", unit: "L/ha", defaultDose: 1, nutrients: { N: 76.8, P2O5: 384.0 }, fonte: `${GRAP_FONTE} — 20% do P2O5 proveniente de ácido fosforoso` },
  { id: "grap-philcobre", name: "GRAP PHIL Cobre", unit: "L/ha", defaultDose: 1, nutrients: { Cu: 38.4 }, fonte: GRAP_FONTE },
  { id: "grap-philk", name: "GRAP PHIL K", unit: "L/ha", defaultDose: 1, nutrients: { K2O: 280.0 }, fonte: GRAP_FONTE },
  { id: "grap-philmn", name: "GRAP PHIL Mn", unit: "L/ha", defaultDose: 1, nutrients: { Mn: 85.8 }, fonte: GRAP_FONTE },
  { id: "grap-topfluidplus", name: "GRAP TOP FLUID Plus", unit: "L/ha", defaultDose: 1, nutrients: { N: 189.0, P2O5: 54.0, K2O: 67.5, Mg: 20.3, B: 1.4, Mn: 20.3, Mo: 0.7, Zn: 27.0 }, fonte: `${GRAP_FONTE} — contém 3% de fosfito` },
  { id: "grap-amyno15", name: "GRAP amyno 15", unit: "L/ha", defaultDose: 1, nutrients: { S: 67.5, B: 6.8, Cu: 6.8, Mn: 81.0, Mo: 1.4, Zn: 40.5 }, fonte: `${GRAP_FONTE} — base ácido glutâmico` },
  { id: "grap-organotop", name: "GRAP organo TOP", unit: "L/ha", defaultDose: 1, nutrients: { N: 65.0, P2O5: 52.0, Mg: 2.6, S: 0.3, B: 0.65, Co: 1.3, Cu: 0.65, Mn: 2.6, Zn: 1.3 }, fonte: `${GRAP_FONTE} — matéria orgânica 25%, carbono orgânico 14%` },
  { id: "grap-stpro", name: "GRAP ST PRO", unit: "L/ha", defaultDose: 1, nutrients: { B: 12.8, Mn: 89.6 }, fonte: `${GRAP_FONTE} — base Ascophyllum nodosum` },
  { id: "grap-fieldpro", name: "GRAP Field PRO", unit: "L/ha", defaultDose: 1, nutrients: { B: 23.0, Mn: 108.0 }, fonte: `${GRAP_FONTE} — base Ascophyllum nodosum` },
  { id: "grap-breedpro", name: "GRAP Breed PRO", unit: "L/ha", defaultDose: 1, nutrients: { B: 60.5, Mn: 24.2 }, fonte: `${GRAP_FONTE} — base Ascophyllum nodosum` },
];

const STORAGE_KEY = "agro-comparador-state-v1";

function loadPersistedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function genId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function AgroComparador() {
  const [openCompany, setOpenCompany] = useState(COMPANIES[0].id);
  const [openGrap, setOpenGrap] = useState(true);
  const [selected, setSelected] = useState(() => loadPersistedState()?.selected ?? {}); // productId -> { dose, price }
  const [agroceteProducts, setAgroceteProducts] = useState(() => loadPersistedState()?.agroceteProducts ?? []); // custom entries
  const [agroSelected, setAgroSelected] = useState(() => loadPersistedState()?.agroSelected ?? {});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProd, setNewProd] = useState({ name: "", unit: "L/ha", dose: 1, price: 0, nutrients: {} });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ selected, agroceteProducts, agroSelected }));
    } catch {
      // localStorage indisponível (modo privado, quota excedida etc.) — ignora, estado só não persiste
    }
  }, [selected, agroceteProducts, agroSelected]);

  const allProducts = useMemo(
    () => COMPANIES.flatMap((c) => c.products.map((p) => ({ ...p, companyId: c.id, companyName: c.name, companyColor: c.color }))),
    []
  );

  const allAgroProducts = useMemo(() => [...GRAP_CATALOG, ...agroceteProducts], [agroceteProducts]);

  function toggleProduct(product) {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[product.id]) {
        delete next[product.id];
      } else {
        next[product.id] = { dose: product.defaultDose, price: 0 };
      }
      return next;
    });
  }

  function updateSelected(id, field, value) {
    setSelected((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  }

  function toggleAgro(product) {
    setAgroSelected((prev) => {
      const next = { ...prev };
      if (next[product.id]) {
        delete next[product.id];
      } else {
        next[product.id] = { dose: product.defaultDose ?? 0, price: product.defaultPrice ?? 0 };
      }
      return next;
    });
  }

  function updateAgroSelected(id, field, value) {
    setAgroSelected((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  }

  function addAgroceteProduct() {
    if (!newProd.name.trim()) return;
    const cleanNutrients = {};
    Object.entries(newProd.nutrients).forEach(([k, v]) => {
      const num = parseFloat(v);
      if (!isNaN(num) && num > 0) cleanNutrients[k] = num;
    });
    const id = genId("agro");
    setAgroceteProducts((prev) => [
      ...prev,
      {
        id,
        name: newProd.name,
        unit: newProd.unit,
        defaultDose: parseFloat(newProd.dose) || 0,
        defaultPrice: parseFloat(newProd.price) || 0,
        nutrients: cleanNutrients,
      },
    ]);
    setNewProd({ name: "", unit: "L/ha", dose: 1, price: 0, nutrients: {} });
    setShowAddForm(false);
  }

  function removeAgroceteProduct(id) {
    setAgroceteProducts((prev) => prev.filter((p) => p.id !== id));
    setAgroSelected((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  // Totais do manejo concorrente
  const competitorTotals = useMemo(() => {
    const totals = {};
    let cost = 0;
    Object.entries(selected).forEach(([id, sel]) => {
      const product = allProducts.find((p) => p.id === id);
      if (!product) return;
      const dose = parseFloat(sel.dose) || 0;
      const price = parseFloat(sel.price) || 0;
      cost += dose * price;
      Object.entries(product.nutrients).forEach(([el, gPerUnit]) => {
        totals[el] = (totals[el] || 0) + gPerUnit * dose;
      });
    });
    return { totals, cost };
  }, [selected, allProducts]);

  // Totais do manejo Agrocete
  const agroTotals = useMemo(() => {
    const totals = {};
    let cost = 0;
    Object.entries(agroSelected).forEach(([id, sel]) => {
      const product = allAgroProducts.find((p) => p.id === id);
      if (!product) return;
      const dose = parseFloat(sel.dose) || 0;
      const price = parseFloat(sel.price) || 0;
      cost += dose * price;
      Object.entries(product.nutrients).forEach(([el, gPerUnit]) => {
        totals[el] = (totals[el] || 0) + gPerUnit * dose;
      });
    });
    return { totals, cost };
  }, [agroSelected, allAgroProducts]);

  const allNutrientKeys = useMemo(() => {
    const keys = new Set([...Object.keys(competitorTotals.totals), ...Object.keys(agroTotals.totals)]);
    return Array.from(keys).sort((a, b) => {
      const order = { macro: 0, secundario: 1, micro: 2 };
      const ga = NUTRIENT_META[a]?.group ?? "micro";
      const gb = NUTRIENT_META[b]?.group ?? "micro";
      return order[ga] - order[gb];
    });
  }, [competitorTotals, agroTotals]);

  const maxValue = useMemo(() => {
    let max = 0;
    allNutrientKeys.forEach((k) => {
      max = Math.max(max, competitorTotals.totals[k] || 0, agroTotals.totals[k] || 0);
    });
    return max || 1;
  }, [allNutrientKeys, competitorTotals, agroTotals]);

  const selectedCount = Object.keys(selected).length;
  const agroSelectedCount = Object.keys(agroSelected).length;
  const grapSelectedCount = GRAP_CATALOG.filter((p) => agroSelected[p.id]).length;

  async function exportPDF() {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    let y = 15;

    doc.setFontSize(16);
    doc.text("Comparativo de Manejo Foliar", 14, y);
    y += 7;
    doc.setFontSize(10);
    doc.setTextColor(110);
    doc.text(`Gerado em ${new Date().toLocaleDateString("pt-BR")}`, 14, y);
    doc.setTextColor(0);
    y += 10;

    doc.setFontSize(12);
    doc.text("Produtos concorrentes selecionados", 14, y);
    y += 6;
    doc.setFontSize(9);
    if (selectedCount === 0) {
      doc.text("Nenhum produto concorrente selecionado.", 16, y);
      y += 5;
    } else {
      Object.entries(selected).forEach(([id, sel]) => {
        const product = allProducts.find((p) => p.id === id);
        if (!product) return;
        doc.text(
          `- ${product.companyName} · ${product.name} — dose ${sel.dose} ${product.unit}, preço R$ ${(parseFloat(sel.price) || 0).toFixed(2)}`,
          16,
          y
        );
        y += 5;
      });
    }

    y += 5;
    doc.setFontSize(12);
    doc.text("Produtos Agrocete selecionados", 14, y);
    y += 6;
    doc.setFontSize(9);
    if (agroSelectedCount === 0) {
      doc.text("Nenhum produto Agrocete selecionado.", 16, y);
      y += 5;
    } else {
      Object.entries(agroSelected).forEach(([id, sel]) => {
        const product = allAgroProducts.find((p) => p.id === id);
        if (!product) return;
        doc.text(
          `- ${product.name} — dose ${sel.dose} ${product.unit}, preço R$ ${(parseFloat(sel.price) || 0).toFixed(2)}`,
          16,
          y
        );
        y += 5;
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
      const compVal = competitorTotals.totals[key] || 0;
      const agroVal = agroTotals.totals[key] || 0;
      doc.text(NUTRIENT_META[key]?.label ?? key, 14, y);
      doc.text(`${compVal.toFixed(1)} g`, 90, y);
      doc.text(`${agroVal.toFixed(1)} g`, 140, y);
      y += 5;
    });

    if (y > 260) {
      doc.addPage();
      y = 15;
    }
    y += 6;
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text("Custo por hectare", 14, y);
    doc.setFont(undefined, "normal");
    y += 7;
    doc.setFontSize(10);
    doc.text(`Concorrentes: R$ ${competitorTotals.cost.toFixed(2)}/ha`, 14, y);
    y += 6;
    doc.text(`Agrocete: R$ ${agroTotals.cost.toFixed(2)}/ha`, 14, y);
    y += 8;

    if (competitorTotals.cost > 0 && agroTotals.cost > 0) {
      const diff = Math.abs(competitorTotals.cost - agroTotals.cost).toFixed(2);
      const msg =
        agroTotals.cost <= competitorTotals.cost
          ? `Manejo Agrocete é R$ ${diff}/ha mais barato que o manejo concorrente selecionado.`
          : `Manejo Agrocete é R$ ${diff}/ha mais caro que o manejo concorrente selecionado — avalie se a diferença de nutrientes acima justifica o custo.`;
      doc.text(doc.splitTextToSize(msg, 180), 14, y);
    }

    doc.save("comparativo-manejo-foliar.pdf");
  }

  return (
    <div style={{ background: "#EDEAE0", minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif", color: "#23301F" }}>
      {/* HEADER */}
      <header style={{ background: "#23301F", color: "#EDEAE0", padding: "20px 20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Leaf size={22} color="#8FBF6B" />
          <span style={{ fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: "#8FBF6B", fontWeight: 600 }}>
            Comparador de Manejo Foliar
          </span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 8, marginBottom: 4, lineHeight: 1.25 }}>
          Monte o manejo, veja a soma de nutrientes e compare com a Agrocete
        </h1>
        <p style={{ fontSize: 13, color: "#B9C4AE", marginTop: 4 }}>
          Selecione produtos concorrentes, ajuste a dose e compare gramas de nutriente por hectare e custo.
        </p>
      </header>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "20px 16px 120px" }}>
        {/* PRODUTOS CONCORRENTES */}
        <section>
          <SectionTitle icon={<FlaskConical size={16} />} title="1 · Produtos concorrentes" subtitle={`${selectedCount} selecionado(s)`} />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {COMPANIES.map((company) => {
              const isOpen = openCompany === company.id;
              const companySelectedCount = company.products.filter((p) => selected[p.id]).length;
              return (
                <AccordionSection
                  key={company.id}
                  color={company.color}
                  name={company.name}
                  count={companySelectedCount}
                  isOpen={isOpen}
                  onToggle={() => setOpenCompany(isOpen ? null : company.id)}
                >
                  {company.products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      color={company.color}
                      isSelected={!!selected[product.id]}
                      onToggle={() => toggleProduct(product)}
                      doseValue={selected[product.id]?.dose}
                      priceValue={selected[product.id]?.price}
                      onUpdate={(field, value) => updateSelected(product.id, field, value)}
                    />
                  ))}
                </AccordionSection>
              );
            })}
          </div>
        </section>

        {/* AGROCETE */}
        <section style={{ marginTop: 26 }}>
          <SectionTitle icon={<Droplet size={16} />} title="2 · Linha Agrocete" subtitle={`${agroSelectedCount} selecionado(s)`} />
          <p style={{ fontSize: 12, color: "#6B6A5F", marginTop: -6, marginBottom: 10 }}>
            Catálogo oficial da Linha GRAP (folheto de garantias maio/2023). Doses padrão são um ponto de partida
            genérico — ajuste conforme a bula/recomendação técnica de cada produto. Cadastre abaixo outros produtos
            Agrocete que não estejam nessa lista.
          </p>

          <div style={{ marginBottom: 10 }}>
            <AccordionSection
              color="#2451B0"
              name="Linha GRAP (catálogo oficial)"
              count={grapSelectedCount}
              isOpen={openGrap}
              onToggle={() => setOpenGrap(!openGrap)}
            >
              {GRAP_CATALOG.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  color="#2451B0"
                  isSelected={!!agroSelected[product.id]}
                  onToggle={() => toggleAgro(product)}
                  doseValue={agroSelected[product.id]?.dose}
                  priceValue={agroSelected[product.id]?.price}
                  onUpdate={(field, value) => updateAgroSelected(product.id, field, value)}
                />
              ))}
            </AccordionSection>
          </div>

          {agroceteProducts.length > 0 && (
            <div style={{ fontSize: 11, fontWeight: 600, color: "#6B6A5F", marginBottom: 6 }}>Cadastrados manualmente</div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {agroceteProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                color="#2451B0"
                isSelected={!!agroSelected[product.id]}
                onToggle={() => toggleAgro(product)}
                doseValue={agroSelected[product.id]?.dose}
                priceValue={agroSelected[product.id]?.price}
                onUpdate={(field, value) => updateAgroSelected(product.id, field, value)}
                onRemove={() => removeAgroceteProduct(product.id)}
              />
            ))}
          </div>

          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              style={{
                marginTop: 10, width: "100%", padding: "10px", borderRadius: 10, border: "1.5px dashed #2451B0",
                background: "transparent", color: "#2451B0", fontWeight: 600, fontSize: 13, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}
            >
              <Plus size={15} /> Adicionar produto Agrocete
            </button>
          ) : (
            <div style={{ marginTop: 10, background: "#FFFFFF", border: "1.5px solid #2451B0", borderRadius: 10, padding: 12 }}>
              <label style={{ fontSize: 11 }}>
                Nome do produto
                <input type="text" value={newProd.name} onChange={(e) => setNewProd({ ...newProd, name: e.target.value })} style={inputStyle} placeholder="Ex: Nutricete Zn" />
              </label>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <label style={{ fontSize: 11, flex: 1 }}>
                  Unidade de dose
                  <select value={newProd.unit} onChange={(e) => setNewProd({ ...newProd, unit: e.target.value })} style={inputStyle}>
                    <option value="L/ha">L/ha</option>
                    <option value="kg/ha">kg/ha</option>
                  </select>
                </label>
                <label style={{ fontSize: 11, flex: 1 }}>
                  Dose padrão
                  <input type="number" step="0.01" value={newProd.dose} onChange={(e) => setNewProd({ ...newProd, dose: e.target.value })} style={inputStyle} />
                </label>
                <label style={{ fontSize: 11, flex: 1 }}>
                  Preço (R$)
                  <input type="number" step="0.01" value={newProd.price} onChange={(e) => setNewProd({ ...newProd, price: e.target.value })} style={inputStyle} />
                </label>
              </div>
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 11, marginBottom: 6, fontWeight: 600 }}>Garantias (g por unidade de dose)</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                  {Object.entries(NUTRIENT_META).map(([key, meta]) => (
                    <label key={key} style={{ fontSize: 10 }}>
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
                <button onClick={addAgroceteProduct} style={{ flex: 1, padding: "9px", borderRadius: 8, border: "none", background: "#2451B0", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                  Salvar produto
                </button>
                <button onClick={() => setShowAddForm(false)} style={{ padding: "9px 14px", borderRadius: 8, border: "1px solid #DEDACB", background: "#fff", fontSize: 13, cursor: "pointer" }}>
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </section>

        {/* COMPARATIVO */}
        {allNutrientKeys.length > 0 && (
          <section style={{ marginTop: 28 }}>
            <SectionTitle icon={<Leaf size={16} />} title="3 · Comparativo de nutrientes (g/ha)" />
            <div style={{ background: "#FFFFFF", borderRadius: 12, border: "1px solid #DEDACB", padding: 14 }}>
              <div style={{ display: "flex", gap: 14, fontSize: 11, marginBottom: 12 }}>
                <LegendDot color="#3B6B35" label="Concorrentes" />
                <LegendDot color="#2451B0" label="Agrocete" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {allNutrientKeys.map((key) => {
                  const compVal = competitorTotals.totals[key] || 0;
                  const agroVal = agroTotals.totals[key] || 0;
                  return (
                    <div key={key}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                        <span style={{ fontWeight: 600 }}>{NUTRIENT_META[key]?.label ?? key}</span>
                        <span style={{ color: "#6B6A5F" }}>
                          {compVal.toFixed(1)} g vs {agroVal.toFixed(1)} g
                        </span>
                      </div>
                      <Bar value={compVal} max={maxValue} color="#3B6B35" />
                      <Bar value={agroVal} max={maxValue} color="#2451B0" style={{ marginTop: 3 }} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CUSTO */}
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <CostCard label="Custo concorrentes" value={competitorTotals.cost} color="#3B6B35" />
              <CostCard label="Custo Agrocete" value={agroTotals.cost} color="#2451B0" />
            </div>
            {competitorTotals.cost > 0 && agroTotals.cost > 0 && (
              <div style={{ marginTop: 10, fontSize: 13, background: "#FFFFFF", border: "1px solid #DEDACB", borderRadius: 10, padding: 12 }}>
                {agroTotals.cost <= competitorTotals.cost ? (
                  <span>
                    Manejo Agrocete é <strong>R$ {(competitorTotals.cost - agroTotals.cost).toFixed(2)}/ha mais barato</strong> que o manejo concorrente selecionado.
                  </span>
                ) : (
                  <span>
                    Manejo Agrocete é <strong>R$ {(agroTotals.cost - competitorTotals.cost).toFixed(2)}/ha mais caro</strong> — avalie se a diferença de nutrientes acima justifica o custo.
                  </span>
                )}
              </div>
            )}

            <button
              onClick={exportPDF}
              style={{
                marginTop: 12,
                width: "100%",
                padding: "11px",
                borderRadius: 10,
                border: "none",
                background: "#23301F",
                color: "#EDEAE0",
                fontWeight: 600,
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
          <div style={{ marginTop: 24, textAlign: "center", color: "#8A8776", fontSize: 13, padding: "30px 10px" }}>
            Selecione produtos acima para ver a somatória de nutrientes e o comparativo.
          </div>
        )}
      </main>
    </div>
  );
}

function SectionTitle({ icon, title, subtitle }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <span style={{ color: "#3B6B35" }}>{icon}</span>
        <h2 style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>{title}</h2>
      </div>
      {subtitle && <span style={{ fontSize: 11, color: "#8A8776" }}>{subtitle}</span>}
    </div>
  );
}

function nutrientSummary(product) {
  const suffix = product.unit.startsWith("kg") ? "g/kg" : "g/L";
  return (
    Object.entries(product.nutrients)
      .map(([el, v]) => `${NUTRIENT_META[el]?.label ?? el} ${v}${suffix}`)
      .join(" · ") || "sem nutrientes"
  );
}

function AccordionSection({ color, name, count, isOpen, onToggle, children }) {
  return (
    <div style={{ background: "#FFFFFF", borderRadius: 12, border: "1px solid #DEDACB", overflow: "hidden" }}>
      <button
        onClick={onToggle}
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
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: color, display: "inline-block" }} />
          <span style={{ fontWeight: 600, fontSize: 15 }}>{name}</span>
          {count > 0 && (
            <span style={{ fontSize: 11, background: "#EDEAE0", padding: "2px 7px", borderRadius: 999, fontWeight: 600 }}>
              {count} ativo{count > 1 ? "s" : ""}
            </span>
          )}
        </div>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {isOpen && <div style={{ padding: "0 12px 12px", display: "flex", flexDirection: "column", gap: 8 }}>{children}</div>}
    </div>
  );
}

function ProductCard({ product, color, isSelected, onToggle, onUpdate, doseValue, priceValue, onRemove }) {
  return (
    <div
      style={{
        border: `1.5px solid ${isSelected ? color : "#E4E1D4"}`,
        borderRadius: 10,
        padding: 10,
        background: isSelected ? `${color}0D` : "#FCFBF7",
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
          }}
        >
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{product.name}</div>
            <div style={{ fontSize: 12, color: "#6B6A5F", marginTop: 2 }}>{nutrientSummary(product)}</div>
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
              background: isSelected ? color : "#EDEAE0",
              color: isSelected ? "#fff" : "#8A8776",
            }}
          >
            {isSelected ? <X size={15} /> : <Plus size={15} />}
          </span>
        </button>
        {onRemove && (
          <button onClick={onRemove} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#A23E2B", padding: 4, marginLeft: 4 }}>
            <X size={14} />
          </button>
        )}
      </div>

      {isSelected && (
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <label style={{ fontSize: 11, flex: 1 }}>
            Dose ({product.unit})
            <input type="number" step="0.01" value={doseValue} onChange={(e) => onUpdate("dose", e.target.value)} style={inputStyle} />
          </label>
          <label style={{ fontSize: 11, flex: 1 }}>
            Preço (R$/{product.unit.split("/")[0]})
            <input type="number" step="0.01" value={priceValue} onChange={(e) => onUpdate("price", e.target.value)} style={inputStyle} />
          </label>
        </div>
      )}
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block" }} />
      <span>{label}</span>
    </div>
  );
}

function Bar({ value, max, color, style }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ background: "#EDEAE0", borderRadius: 5, height: 7, overflow: "hidden", ...style }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 5, transition: "width 0.3s" }} />
    </div>
  );
}

function CostCard({ label, value, color }) {
  return (
    <div style={{ flex: 1, background: "#FFFFFF", border: `1.5px solid ${color}33`, borderRadius: 10, padding: 12 }}>
      <div style={{ fontSize: 11, color: "#6B6A5F" }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color, marginTop: 2 }}>R$ {value.toFixed(2)}</div>
      <div style={{ fontSize: 10, color: "#8A8776" }}>por hectare</div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  marginTop: 3,
  padding: "7px 8px",
  borderRadius: 6,
  border: "1px solid #DEDACB",
  fontSize: 12,
  boxSizing: "border-box",
  fontFamily: "inherit",
};
