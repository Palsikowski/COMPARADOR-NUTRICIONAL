import React, { useMemo, useState } from "react";
import { ArrowLeftRight, Info, AlertTriangle, Leaf } from "lucide-react";
import ProductSelector from "../components/ProductSelector.jsx";
import CostPerHectare from "../components/CostPerHectare.jsx";
import CompareBars from "../components/CompareBars.jsx";
import DataBadge from "../components/DataBadge.jsx";
import { economicsFor, diff, fmtBRL, fmtNum, concentrationUnit, doseUnit } from "../lib/economics.js";
import { isComparable } from "../lib/provenance.js";
import { positioningFor } from "../lib/catalog.js";
import { computeNCI } from "../lib/nci.js";
import NciPanel from "../components/NciPanel.jsx";
import { nutrientColor } from "../dashboard/nutrientColors.js";

const NUTRIENT_LABEL = {
  N: "Nitrogênio",
  P2O5: "Fósforo (P₂O₅)",
  K2O: "Potássio (K₂O)",
  Ca: "Cálcio",
  Mg: "Magnésio",
  S: "Enxofre",
  B: "Boro",
  Cu: "Cobre",
  Mn: "Manganês",
  Zn: "Zinco",
  Fe: "Ferro",
  Mo: "Molibdênio",
  Ni: "Níquel",
  Co: "Cobalto",
  Cl: "Cloro",
  C_Org: "Carbono orgânico",
};

const ORDER = ["N", "P2O5", "K2O", "Ca", "Mg", "S", "B", "Cu", "Mn", "Zn", "Fe", "Mo", "Ni", "Co", "Cl", "C_Org"];

// Estado por produto na comparação: dose e preço são entradas do usuário.
// A dose começa na dose de referência do catálogo quando existe (só 16% dos
// produtos têm), e o preço sempre começa vazio — preço não está no catálogo.
function useSide(initial = null) {
  const [product, setProduct] = useState(initial);
  const [dose, setDose] = useState("");
  const [price, setPrice] = useState("");

  function choose(p) {
    setProduct(p);
    setDose(p?.defaultDose != null ? String(p.defaultDose) : "");
    setPrice("");
  }
  return { product, choose, dose, setDose, price, setPrice };
}

export default function Compare({ onOpenCatalog }) {
  const A = useSide();
  const B = useSide();
  const [areaHa, setAreaHa] = useState(1000);

  const ready = !!A.product && !!B.product;

  const econA = useMemo(
    () => (A.product ? economicsFor(A.product, { dose: A.dose, price: A.price, areaHa }) : null),
    [A.product, A.dose, A.price, areaHa]
  );
  const econB = useMemo(
    () => (B.product ? economicsFor(B.product, { dose: B.dose, price: B.price, areaHa }) : null),
    [B.product, B.dose, B.price, areaHa]
  );

  const nutrientKeys = useMemo(() => {
    if (!ready) return [];
    const set = new Set([...Object.keys(A.product.nutrients || {}), ...Object.keys(B.product.nutrients || {})]);
    return Array.from(set).sort((x, y) => {
      const ix = ORDER.indexOf(x);
      const iy = ORDER.indexOf(y);
      return (ix < 0 ? 99 : ix) - (iy < 0 ? 99 : iy);
    });
  }, [ready, A.product, B.product]);

  return (
    <div className="shell" style={{ paddingTop: 26, paddingBottom: 90 }}>
      <header style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>Compare duas soluções</h1>
        <p className="muted" style={{ fontSize: 14.5, margin: "6px 0 0", maxWidth: 720, lineHeight: 1.5 }}>
          Escolha dois produtos, informe dose e preço, e veja composição, custo por hectare e custo por nutriente lado a
          lado. Dose e preço são seus — o catálogo traz a composição.
        </p>
      </header>

      {/* SELEÇÃO */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 14, alignItems: "start" }} className="cmp-picker">
        <ProductSelector value={A.product} onChange={A.choose} label="Produto A" accent="var(--side-a)" />
        <div
          className="cmp-vs"
          style={{
            alignSelf: "center",
            width: 42,
            height: 42,
            borderRadius: "50%",
            background: "var(--surface)",
            border: "1px solid var(--border-strong)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-3)",
            fontWeight: 700,
            fontSize: 12,
            flexShrink: 0,
          }}
        >
          VS
        </div>
        <ProductSelector value={B.product} onChange={B.choose} label="Produto B" accent="var(--side-b)" />
      </div>

      {!ready && (
        <div className="card" style={{ marginTop: 18, padding: "28px 20px", textAlign: "center" }}>
          <ArrowLeftRight size={26} style={{ color: "var(--text-3)" }} />
          <div style={{ fontWeight: 600, marginTop: 10, fontSize: 15 }}>Selecione dois produtos para comparar</div>
          <div className="muted" style={{ fontSize: 13, marginTop: 5, maxWidth: 460, marginInline: "auto", lineHeight: 1.5 }}>
            Você pode comparar produtos de empresas diferentes, ou dois produtos da mesma empresa. Também dá para
            navegar pelo catálogo completo e montar um manejo inteiro.
          </div>
          <button className="btn btn-ghost" style={{ marginTop: 14 }} onClick={onOpenCatalog}>
            Abrir catálogo e manejo
          </button>
        </div>
      )}

      {ready && (
        <>
          {/* ENTRADAS: dose, preço e área */}
          <section className="card" style={{ marginTop: 18, padding: 16 }}>
            <SectionTitle
              n="1"
              title="Dose, preço e área"
              hint="O catálogo não guarda preço — ele varia por região, volume e negociação."
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="cmp-inputs">
              <SideInputs side={A} label="Produto A" accent="var(--side-a)" />
              <SideInputs side={B} label="Produto B" accent="var(--side-b)" />
            </div>
            <label style={{ display: "block", marginTop: 14, maxWidth: 260 }}>
              <span className="muted" style={{ fontSize: 12, display: "block", marginBottom: 5 }}>
                Área de aplicação (ha)
              </span>
              <input
                className="input tnum"
                type="number"
                min="0"
                inputMode="numeric"
                value={areaHa}
                onChange={(e) => setAreaHa(e.target.value === "" ? "" : Number(e.target.value))}
                aria-label="Área em hectares"
              />
            </label>
          </section>

          {/* AVISOS DE DADO FALTANTE */}
          <Gaps a={A} b={B} econA={econA} econB={econB} />

          {/* VISÃO GERAL */}
          <section className="card" style={{ marginTop: 14, padding: 16 }}>
            <SectionTitle n="2" title="Visão geral" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="cmp-inputs">
              <OverviewCard product={A.product} econ={econA} areaHa={areaHa} accent="var(--side-a)" label="Produto A" />
              <OverviewCard product={B.product} econ={econB} areaHa={areaHa} accent="var(--side-b)" label="Produto B" />
            </div>

            <PriceIsNotValue />
          </section>

          {/* COMPOSIÇÃO */}
          <section className="card" style={{ marginTop: 14, padding: 16 }}>
            <SectionTitle
              n="3"
              title="Composição"
              hint="Concentração declarada de cada nutriente e a diferença entre os dois produtos."
            />
            <CompositionTable a={A.product} b={B.product} keys={nutrientKeys} />
          </section>

          {/* ECONOMIA */}
          <section className="card" style={{ marginTop: 14, padding: 16 }}>
            <SectionTitle n="4" title="Economia" hint="Custo por hectare e custo por quilo de nutriente entregue." />
            <CompareBars
              label="Custo por hectare"
              unit="R$/ha"
              a={econA.costPerHa}
              b={econB.costPerHa}
              labelA={A.product.name}
              labelB={B.product.name}
              lowerIsBetter
              note="menor é mais barato por hectare"
            />
            <CompareBars
              label="Dose"
              unit={`${doseUnit(A.product)}/ha`}
              a={econA.dose}
              b={econB.dose}
              labelA={A.product.name}
              labelB={B.product.name}
            />
            <CostPerNutrient a={A} b={B} econA={econA} econB={econB} keys={nutrientKeys} />
          </section>

          {/* NCI */}
          <section className="card" style={{ marginTop: 14, padding: 16 }}>
            <SectionTitle n="5" title="Índice comparativo (NCI)" />
            <NciPanel
              nci={computeNCI(
                { product: A.product, dose: A.dose, price: A.price },
                { product: B.product, dose: B.dose, price: B.price }
              )}
              nameA={A.product.name}
              nameB={B.product.name}
            />
          </section>

          {/* POSICIONAMENTO */}
          <section className="card" style={{ marginTop: 14, padding: 16 }}>
            <SectionTitle n="6" title="Posicionamento" hint="Cultura e estádio em que cada produto está posicionado." />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="cmp-inputs">
              <Positioning product={A.product} accent="var(--side-a)" />
              <Positioning product={B.product} accent="var(--side-b)" />
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function SectionTitle({ n, title, hint }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <span
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            background: "var(--brand-soft)",
            color: "var(--brand)",
            fontSize: 11.5,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {n}
        </span>
        <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{title}</h2>
      </div>
      {hint && (
        <p className="muted" style={{ fontSize: 12.5, margin: "6px 0 0 31px", lineHeight: 1.45 }}>
          {hint}
        </p>
      )}
    </div>
  );
}

function SideInputs({ side, label, accent }) {
  const unit = doseUnit(side.product);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: accent }} />
        <span style={{ fontSize: 12.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {side.product.name}
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <label>
          <span className="muted-soft" style={{ fontSize: 11, display: "block", marginBottom: 4 }}>
            Dose ({unit}/ha)
          </span>
          <input
            className="input tnum"
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            value={side.dose}
            onChange={(e) => side.setDose(e.target.value)}
            placeholder="0"
            aria-label={`Dose de ${side.product.name}`}
          />
        </label>
        <label>
          <span className="muted-soft" style={{ fontSize: 11, display: "block", marginBottom: 4 }}>
            Preço (R$/{unit})
          </span>
          <input
            className="input tnum"
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            value={side.price}
            onChange={(e) => side.setPrice(e.target.value)}
            placeholder="0,00"
            aria-label={`Preço de ${side.product.name}`}
          />
        </label>
      </div>
      {side.product.defaultDose == null && (
        <div className="muted-soft" style={{ fontSize: 11, marginTop: 5 }}>
          Sem dose de referência no catálogo — informe a dose da bula.
        </div>
      )}
      {side.product.doseRaw && (
        <div className="muted-soft" style={{ fontSize: 11, marginTop: 5 }}>
          Dose cadastrada: {side.product.doseRaw}
        </div>
      )}
    </div>
  );
}

function Gaps({ a, b, econA, econB }) {
  const items = [];
  [
    [a, econA, "Produto A"],
    [b, econB, "Produto B"],
  ].forEach(([side, econ, label]) => {
    const miss = [];
    if (!isComparable(side.product)) miss.push("composição nutricional");
    if (!econ.hasDose) miss.push("dose");
    if (!econ.hasPrice) miss.push("preço");
    if (miss.length) items.push(`${label} (${side.product.name}): falta ${miss.join(", ")}`);
  });
  if (items.length === 0) return null;
  return (
    <div
      style={{
        marginTop: 14,
        padding: "12px 14px",
        borderRadius: "var(--radius-sm)",
        background: "var(--warn-soft)",
        border: "1px solid var(--warn)33",
        display: "flex",
        gap: 10,
      }}
    >
      <AlertTriangle size={16} style={{ color: "var(--warn)", flexShrink: 0, marginTop: 1 }} />
      <div style={{ fontSize: 12.5, lineHeight: 1.55 }}>
        <strong style={{ display: "block", marginBottom: 3 }}>Comparação incompleta</strong>
        {items.map((t, i) => (
          <div key={i} className="muted">
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}

function OverviewCard({ product, econ, areaHa, accent, label }) {
  const nCount = Object.keys(product.nutrients || {}).length;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: accent }} />
        <span className="muted-soft" style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {label}
        </span>
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.25 }}>{product.name}</div>
      <div className="muted" style={{ fontSize: 12.5, marginTop: 2, marginBottom: 10 }}>
        {product.brand}
        {product.category ? ` · ${product.category}` : ""}
      </div>

      <CostPerHectare econ={econ} product={product} areaHa={areaHa} accent={accent} compact />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
        <MiniStat label="Nutrientes" value={nCount > 0 ? nCount : "—"} />
        <MiniStat label="Apresentação" value={product.unit === "kg/ha" ? "Sólido" : product.unit ? "Líquido" : "—"} />
        <MiniStat label="Densidade" value={product.density ? `${fmtNum(product.density)} kg/L` : "—"} />
        <MiniStat label="Dose ref." value={product.defaultDose != null ? `${fmtNum(product.defaultDose)} ${doseUnit(product)}` : "—"} />
      </div>

      <div style={{ marginTop: 10 }}>
        <DataBadge product={product} compact />
      </div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div style={{ padding: "8px 10px", borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--border)" }}>
      <div className="muted-soft" style={{ fontSize: 10.5 }}>
        {label}
      </div>
      <div className="tnum" style={{ fontSize: 14, fontWeight: 700, marginTop: 1 }}>
        {value}
      </div>
    </div>
  );
}

function PriceIsNotValue() {
  return (
    <div
      style={{
        marginTop: 14,
        padding: "12px 14px",
        borderRadius: "var(--radius-sm)",
        background: "var(--info-soft)",
        border: "1px solid var(--info)26",
        display: "flex",
        gap: 10,
      }}
    >
      <Info size={16} style={{ color: "var(--info)", flexShrink: 0, marginTop: 1 }} />
      <div style={{ fontSize: 12.5, lineHeight: 1.55 }}>
        <strong>Preço ≠ valor.</strong>{" "}
        <span className="muted">
          O custo por hectare é uma variável da decisão, não a conclusão. Um produto com custo/ha maior pode entregar
          mais nutriente por aplicação, ter concentração diferente ou ocupar outro posicionamento no manejo — compare
          composição e posicionamento antes de concluir.
        </span>
      </div>
    </div>
  );
}

function CompositionTable({ a, b, keys }) {
  if (keys.length === 0) {
    return (
      <div className="muted" style={{ fontSize: 13, padding: "18px 0", textAlign: "center" }}>
        Nenhum dos dois produtos tem composição nutricional cadastrada — não há o que comparar numericamente.
      </div>
    );
  }
  const unitA = concentrationUnit(a);
  const unitB = concentrationUnit(b);
  const mixed = unitA !== unitB;

  return (
    <>
      {mixed && (
        <div
          style={{
            marginBottom: 12,
            padding: "10px 12px",
            borderRadius: "var(--radius-sm)",
            background: "var(--warn-soft)",
            border: "1px solid var(--warn)33",
            fontSize: 12.5,
            lineHeight: 1.5,
          }}
        >
          <strong>Unidades diferentes.</strong>{" "}
          <span className="muted">
            {a.name} é {unitA === "g/kg" ? "sólido" : "líquido"} ({unitA}) e {b.name} é{" "}
            {unitB === "g/kg" ? "sólido" : "líquido"} ({unitB}). A diferença percentual entre concentrações de unidades
            diferentes não é comparável direto — use o nutriente entregue por hectare, na seção Economia.
          </span>
        </div>
      )}
      {/* Desktop: tabela. Mobile: um card por nutriente (tabela de 4 colunas
          fica ilegível em 390px). */}
      <div className="only-wide" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 460 }}>
          <thead>
            <tr>
              <Th align="left">Nutriente</Th>
              <Th>
                {a.name} <span className="muted-soft">({unitA})</span>
              </Th>
              <Th>
                {b.name} <span className="muted-soft">({unitB})</span>
              </Th>
              <Th>Diferença</Th>
            </tr>
          </thead>
          <tbody>
            {keys.map((k) => {
              const va = a.nutrients?.[k];
              const vb = b.nutrients?.[k];
              const d = diff(va, vb);
              return (
                <tr key={k} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ padding: "9px 8px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: nutrientColor(k), flexShrink: 0 }} />
                      {NUTRIENT_LABEL[k] || k}
                    </span>
                  </td>
                  <Td>{va != null ? fmtNum(va) : "—"}</Td>
                  <Td>{vb != null ? fmtNum(vb) : "—"}</Td>
                  <td className="tnum" style={{ padding: "9px 8px", textAlign: "right" }}>
                    <DiffCell d={d} mixed={mixed} nameA={a.name} nameB={b.name} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="only-narrow">
        {keys.map((k) => {
          const va = a.nutrients?.[k];
          const vb = b.nutrients?.[k];
          const d = diff(va, vb);
          return (
            <div key={k} style={{ padding: "11px 12px", background: "var(--surface-2)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 7 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontWeight: 600, fontSize: 13 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: nutrientColor(k), flexShrink: 0 }} />
                  {NUTRIENT_LABEL[k] || k}
                </span>
                <span className="tnum" style={{ fontSize: 12 }}>
                  <DiffCell d={d} mixed={mixed} />
                </span>
              </div>
              <MobileRow color="var(--side-a)" name={a.name} value={va != null ? `${fmtNum(va)} ${unitA}` : "—"} />
              <MobileRow color="var(--side-b)" name={b.name} value={vb != null ? `${fmtNum(vb)} ${unitB}` : "—"} />
            </div>
          );
        })}
      </div>
    </>
  );
}

function MobileRow({ color, name, value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, fontSize: 12.5, padding: "3px 0" }}>
      <span className="muted" style={{ display: "inline-flex", alignItems: "center", gap: 6, minWidth: 0 }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: color, flexShrink: 0 }} />
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
      </span>
      <span className="tnum" style={{ fontWeight: 600, flexShrink: 0 }}>
        {value}
      </span>
    </div>
  );
}

function DiffCell({ d, mixed }) {
  if (!d) return <span className="muted-soft">—</span>;
  if (d.kind === "only-a") return <span style={{ color: "var(--side-a)", fontWeight: 600 }}>só no A</span>;
  if (d.kind === "only-b") return <span style={{ color: "var(--side-b)", fontWeight: 600 }}>só no B</span>;
  const up = d.abs > 0;
  return (
    <span style={{ fontWeight: 600, color: "var(--text)" }}>
      {up ? "+" : ""}
      {fmtNum(d.abs)}
      {!mixed && d.pct != null && (
        <span className="muted-soft" style={{ fontWeight: 500 }}>
          {" "}
          ({up ? "+" : ""}
          {fmtNum(d.pct, 1)}%)
        </span>
      )}
    </span>
  );
}

function Th({ children, align = "right" }) {
  return (
    <th
      className="muted"
      style={{ padding: "0 8px 9px", textAlign: align, fontSize: 11.5, fontWeight: 600, whiteSpace: "nowrap" }}
    >
      {children}
    </th>
  );
}

function Td({ children }) {
  return (
    <td className="tnum" style={{ padding: "9px 8px", textAlign: "right" }}>
      {children}
    </td>
  );
}

// Custo por quilo de nutriente — só faz sentido nos nutrientes que os dois
// produtos entregam, e só quando há dose e preço dos dois lados.
function CostPerNutrient({ a, b, econA, econB, keys }) {
  const rows = keys
    .map((k) => ({
      key: k,
      a: econA.nutrients[k],
      b: econB.nutrients[k],
    }))
    .filter((r) => r.a?.costPerKg != null || r.b?.costPerKg != null);

  if (!econA.hasPrice || !econB.hasPrice) {
    return (
      <div className="muted" style={{ fontSize: 12.5, padding: "12px 0 0", lineHeight: 1.5 }}>
        Informe o preço dos dois produtos para ver o custo por quilo de nutriente entregue — é esse número que permite
        comparar produtos com concentrações e doses diferentes.
      </div>
    );
  }
  if (rows.length === 0) return null;

  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 4 }}>Custo por quilo de nutriente entregue</div>
      <p className="muted" style={{ fontSize: 12, margin: "0 0 10px", lineHeight: 1.45 }}>
        Quanto custa entregar 1 kg de cada nutriente, considerando a dose informada. Índice por produto — para um manejo
        inteiro, use o comparativo do catálogo.
      </p>
      <div className="only-wide" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 460 }}>
          <thead>
            <tr>
              <Th align="left">Nutriente</Th>
              <Th>{a.product.name}</Th>
              <Th>{b.product.name}</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} style={{ borderTop: "1px solid var(--border)" }}>
                <td style={{ padding: "9px 8px" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: nutrientColor(r.key), flexShrink: 0 }} />
                    {NUTRIENT_LABEL[r.key] || r.key}
                  </span>
                </td>
                <NutrientCostCell cell={r.a} />
                <NutrientCostCell cell={r.b} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="only-narrow">
        {rows.map((r) => (
          <div key={r.key} style={{ padding: "11px 12px", background: "var(--surface-2)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, fontWeight: 600, fontSize: 13, marginBottom: 7 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: nutrientColor(r.key), flexShrink: 0 }} />
              {NUTRIENT_LABEL[r.key] || r.key}
            </div>
            <MobileRow
              color="var(--side-a)"
              name={a.product.name}
              value={r.a?.costPerKg != null ? `${fmtBRL(r.a.costPerKg)}/kg` : "—"}
            />
            <MobileRow
              color="var(--side-b)"
              name={b.product.name}
              value={r.b?.costPerKg != null ? `${fmtBRL(r.b.costPerKg)}/kg` : "—"}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function NutrientCostCell({ cell }) {
  if (!cell || cell.costPerKg == null) {
    return (
      <td className="tnum muted-soft" style={{ padding: "9px 8px", textAlign: "right" }}>
        —
      </td>
    );
  }
  return (
    <td className="tnum" style={{ padding: "9px 8px", textAlign: "right" }}>
      <div style={{ fontWeight: 600 }}>{fmtBRL(cell.costPerKg)}/kg</div>
      <div className="muted-soft" style={{ fontSize: 11 }}>
        {fmtNum(cell.gPerHa)} g/ha
      </div>
    </td>
  );
}

function Positioning({ product, accent }) {
  const pos = positioningFor(product.id);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: accent }} />
        <span style={{ fontSize: 12.5, fontWeight: 600 }}>{product.name}</span>
      </div>
      {pos.length === 0 ? (
        <div
          className="muted"
          style={{ fontSize: 12.5, padding: "12px 14px", background: "var(--surface-2)", borderRadius: "var(--radius-sm)", lineHeight: 1.5 }}
        >
          Sem posicionamento por cultura/estádio cadastrado para este produto.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {pos.map((p, i) => (
            <div
              key={i}
              style={{ padding: "9px 11px", background: "var(--surface-2)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}
            >
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
      )}
      {product.observations && (
        <div style={{ marginTop: 9 }}>
          <div className="muted-soft" style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>
            Observações cadastradas
          </div>
          <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.5, whiteSpace: "pre-line" }}>
            {product.observations}
          </div>
        </div>
      )}
      {product.warning && (
        <div
          style={{
            marginTop: 8,
            padding: "8px 10px",
            borderRadius: 8,
            background: "var(--warn-soft)",
            color: "var(--warn)",
            fontSize: 11.5,
            lineHeight: 1.5,
            whiteSpace: "pre-line",
          }}
        >
          {product.warning}
        </div>
      )}
    </div>
  );
}
