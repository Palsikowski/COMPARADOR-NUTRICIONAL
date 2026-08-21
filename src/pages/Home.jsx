import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, ArrowLeftRight, Building2, Calculator, Sprout, ArrowRight, Scale, Gauge, Layers } from "lucide-react";
import { searchAll, platformStats, AGROCETE, STAGES } from "../lib/catalog.js";
import { isComparable } from "../lib/provenance.js";
import { fmtNum } from "../lib/economics.js";

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
  C_Org: "Carbono orgânico",
};

const EXAMPLES = ["Manganês", "Soja", "V4", "Boro"];

export default function Home({ onCompare, onCatalog, onSearchTerm }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);
  const stats = useMemo(() => platformStats(), []);
  const results = useMemo(() => searchAll(q, { nutrientMeta: NUTRIENT_LABEL }), [q]);
  const hasQuery = open && q.trim().length >= 2;

  // Fecha o resultado ao clicar fora — senão o painel cobre os atalhos logo
  // abaixo e o usuário fica sem saída a não ser apagar o texto.
  useEffect(() => {
    function onDoc(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  const empty =
    hasQuery &&
    results.products.length === 0 &&
    results.brands.length === 0 &&
    results.nutrients.length === 0 &&
    results.cultures.length === 0 &&
    (results.stages || []).length === 0;

  return (
    <div>
      {/* HERO */}
      {/* Hero sem fundo próprio: é aqui que o fundo animado aparece de verdade.
          As faixas seguintes continuam opacas — dado se lê sobre superfície
          sólida, não sobre mancha em movimento. */}
      <section style={{ background: "transparent", borderBottom: "1px solid var(--border)" }}>
        <div className="shell" style={{ paddingTop: 56, paddingBottom: 44 }}>
          <h1
            style={{
              fontSize: "clamp(30px, 5.2vw, 46px)",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              fontWeight: 700,
              margin: 0,
              maxWidth: 640,
            }}
          >
            Compare. Entenda. <span style={{ color: "var(--brand)" }}>Decida melhor.</span>
          </h1>
          <p className="muted" style={{ fontSize: "clamp(15px, 2vw, 17px)", lineHeight: 1.55, margin: "16px 0 0", maxWidth: 620 }}>
            Compare produtos, tecnologias e manejos de nutrição foliar por composição, posicionamento e custo por
            hectare.
          </p>

          {/* BUSCA PRINCIPAL */}
          <div ref={boxRef} style={{ marginTop: 26, maxWidth: 680, position: "relative" }}>
            <Search size={20} style={{ position: "absolute", left: 16, top: 18, color: "var(--text-3)", pointerEvents: "none" }} />
            <input
              className="input"
              style={{ paddingLeft: 46, minHeight: 56, fontSize: 16, boxShadow: "var(--shadow)" }}
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setOpen(false);
              }}
              placeholder="Busque um produto, empresa, nutriente ou cultura..."
              aria-label="Busca principal"
            />
            {hasQuery && (
              <div
                className="card"
                style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, zIndex: 40, boxShadow: "var(--shadow-lg)", overflow: "hidden", maxHeight: 400, overflowY: "auto" }}
              >
                {empty ? (
                  <div style={{ padding: "20px 16px" }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Nenhum resultado para “{q}”</div>
                    <div className="muted" style={{ fontSize: 13, marginTop: 5, lineHeight: 1.5 }}>
                      Tente buscar pelo nome da empresa, nutriente ou cultura. Exemplos: {EXAMPLES.join(", ")}.
                    </div>
                  </div>
                ) : (
                  <>
                    {results.nutrients.length > 0 && (
                      <Group title="Nutrientes">
                        {results.nutrients.map((k) => (
                          <Row key={k} onClick={() => onSearchTerm(NUTRIENT_LABEL[k] || k)} title={NUTRIENT_LABEL[k] || k} sub="Ver produtos com esse nutriente" />
                        ))}
                      </Group>
                    )}
                    {results.brands.length > 0 && (
                      <Group title="Empresas">
                        {results.brands.map((b) => (
                          <Row key={b} onClick={() => onSearchTerm(b)} title={b === AGROCETE ? "AGROCETE (nossos produtos)" : b} sub="Ver portfólio no catálogo" />
                        ))}
                      </Group>
                    )}
                    {results.cultures.length > 0 && (
                      <Group title="Culturas">
                        {results.cultures.map((c) => (
                          <Row key={c} onClick={onCatalog} title={c} sub="Manejo oficial por estádio" />
                        ))}
                      </Group>
                    )}
                    {(results.stages || []).length > 0 && (
                      <Group title="Estádios fenológicos">
                        {results.stages.map((s) => (
                          <Row
                            key={`${s.culture}-${s.key}`}
                            onClick={onCatalog}
                            title={`${s.culture} · ${s.label}`}
                            sub={`${s.count} produto${s.count > 1 ? "s" : ""} posicionado${s.count > 1 ? "s" : ""} no manejo oficial`}
                          />
                        ))}
                      </Group>
                    )}
                    {results.products.length > 0 && (
                      <Group title="Produtos">
                        {results.products.map((p) => (
                          <Row
                            key={p.id}
                            onClick={() => onSearchTerm(p.name)}
                            title={p.name}
                            sub={`${p.brand}${p.category ? ` · ${p.category}` : ""}`}
                            tag={isComparable(p) ? `${Object.keys(p.nutrients).length} nutrientes` : "sem composição"}
                            tagTone={isComparable(p) ? "ok" : "warn"}
                          />
                        ))}
                      </Group>
                    )}
                  </>
                )}
              </div>
            )}
            {q.trim().length < 2 && (
              <div style={{ display: "flex", gap: 7, marginTop: 12, flexWrap: "wrap", alignItems: "center" }}>
                <span className="muted-soft" style={{ fontSize: 12 }}>
                  Exemplos:
                </span>
                {EXAMPLES.map((e) => (
                  <button
                    key={e}
                    className="chip"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setQ(e);
                      setOpen(true);
                    }}
                  >
                    {e}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ATALHOS */}
      <div className="shell" style={{ paddingTop: 28 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 12 }}>
          <ActionCard
            icon={<ArrowLeftRight size={18} />}
            title="Comparar produtos"
            desc="Compare dois produtos por composição, custo/ha e posicionamento."
            onClick={onCompare}
          />
          <ActionCard
            icon={<Building2 size={18} />}
            title="Comparar empresas"
            desc="Navegue pelo portfólio de cada uma das 58 marcas do catálogo."
            onClick={onCatalog}
          />
          <ActionCard
            icon={<Calculator size={18} />}
            title="Analisar custo/ha"
            desc="Entenda o impacto econômico da dose e do preço na área toda."
            onClick={onCompare}
          />
          <ActionCard
            icon={<Sprout size={18} />}
            title="Encontrar um manejo"
            desc="Manejos oficiais por cultura e estádio fenológico."
            onClick={onCatalog}
          />
        </div>
      </div>

      {/* INDICADORES — todos derivados dos dados reais */}
      <div className="shell" style={{ paddingTop: 26, paddingBottom: 40 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
          <Stat label="Produtos cadastrados" value={fmtNum(stats.products, 0)} />
          <Stat label="Empresas" value={stats.brands} />
          <Stat label="Nutrientes mapeados" value={stats.nutrients} />
          <Stat label="Culturas e estádios" value={`${stats.cultures} · ${STAGES.length}`} />
        </div>
        <p className="muted-soft" style={{ fontSize: 12, marginTop: 12, lineHeight: 1.55 }}>
          {fmtNum(stats.withNutrients, 0)} produtos têm composição nutricional cadastrada e{" "}
          {fmtNum(stats.withDose, 0)} têm dose de referência. Os demais entram na comparação, mas exigem que você
          informe os dados que faltam — a plataforma sinaliza cada lacuna em vez de preencher sozinha.
        </p>
      </div>

      {/* PREÇO ≠ VALOR */}
      <section style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="shell" style={{ paddingTop: 40, paddingBottom: 40 }}>
          <span className="chip" style={{ background: "var(--brand-soft)", color: "var(--brand)", borderColor: "transparent" }}>
            <Scale size={13} /> Diferencial da plataforma
          </span>
          <h2 style={{ fontSize: "clamp(22px, 3.4vw, 30px)", fontWeight: 700, letterSpacing: "-0.02em", margin: "14px 0 0" }}>
            Preço ≠ valor
          </h2>
          <p className="muted" style={{ fontSize: 15, lineHeight: 1.6, margin: "10px 0 0", maxWidth: 640 }}>
            O custo por hectare é uma variável da decisão, não a conclusão. Dois produtos com o mesmo custo/ha podem
            entregar quantidades muito diferentes de nutriente — e um produto mais caro por hectare pode sair mais
            barato por quilo de nutriente entregue.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12, marginTop: 22 }}>
            <ValueCard
              icon={<Calculator size={17} />}
              title="Custo por hectare"
              desc="Dose × preço, com a conta aberta e o total para a área que você informar."
              example="0,5 L/ha × R$ 85/L = R$ 42,50/ha"
            />
            <ValueCard
              icon={<Gauge size={17} />}
              title="Custo por nutriente"
              desc="Quanto custa entregar 1 kg de cada nutriente (N, P, K, Mn…) na dose informada. É o que permite comparar concentrações diferentes."
              example="R$ 173,01/kg de Zn vs R$ 1.666,67/kg"
            />
            <ValueCard
              icon={<Layers size={17} />}
              title="NCI · Nutrição & Custo Index"
              desc="Índice comparativo do par selecionado, com os pesos abertos e a lista do que não entra na conta por falta de dado."
              example="Índice comparativo — não é nota de qualidade"
            />
          </div>

          <div
            style={{
              marginTop: 16,
              padding: "12px 14px",
              borderRadius: "var(--radius-sm)",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              fontSize: 12.5,
              lineHeight: 1.6,
            }}
          >
            <strong>Sobre o NCI:</strong>{" "}
            <span className="muted">
              dois critérios de uma avaliação completa — tecnologia de formulação e evidência experimental — não existem
              na base de dados e por isso ficam declaradamente fora do cálculo. Quando falta composição, dose ou preço, o
              índice não é calculado: a plataforma mostra “dados insuficientes” em vez de um número frouxo.
            </span>
          </div>

          <button className="btn btn-primary" style={{ marginTop: 18 }} onClick={onCompare}>
            Iniciar comparação <ArrowRight size={15} />
          </button>
        </div>
      </section>
    </div>
  );
}

function ValueCard({ icon, title, desc, example }) {
  return (
    <div className="card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 7 }}>
      <span
        style={{
          width: 34,
          height: 34,
          borderRadius: 9,
          background: "var(--brand-soft)",
          color: "var(--brand)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </span>
      <span style={{ fontSize: 14.5, fontWeight: 700, marginTop: 2 }}>{title}</span>
      <span className="muted" style={{ fontSize: 12.5, lineHeight: 1.55, flex: 1 }}>
        {desc}
      </span>
      <span
        className="tnum"
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "var(--brand)",
          background: "var(--brand-soft)",
          padding: "7px 10px",
          borderRadius: 8,
          marginTop: 4,
        }}
      >
        {example}
      </span>
    </div>
  );
}

function Group({ title, children }) {
  return (
    <div>
      <div
        className="muted-soft"
        style={{ padding: "8px 14px 5px", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", background: "var(--surface-2)" }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function Row({ onClick, title, sub, tag, tagTone }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "11px 14px",
        minHeight: 52,
        background: "transparent",
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
          {title}
        </span>
        <span className="muted-soft" style={{ fontSize: 11.5 }}>
          {sub}
        </span>
      </span>
      {tag && (
        <span
          className="chip"
          style={{
            fontSize: 10,
            padding: "2px 7px",
            flexShrink: 0,
            background: tagTone === "ok" ? "var(--ok-soft)" : "var(--warn-soft)",
            color: tagTone === "ok" ? "var(--ok)" : "var(--warn)",
            borderColor: "transparent",
          }}
        >
          {tag}
        </span>
      )}
    </button>
  );
}

function ActionCard({ icon, title, desc, onClick }) {
  return (
    <button
      onClick={onClick}
      className="card action-card"
      style={{
        padding: 16,
        textAlign: "left",
        cursor: "pointer",
        font: "inherit",
        color: "var(--text)",
        display: "flex",
        flexDirection: "column",
        gap: 7,
        minHeight: 132,
      }}
    >
      <span
        style={{
          width: 34,
          height: 34,
          borderRadius: 9,
          background: "var(--brand-soft)",
          color: "var(--brand)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </span>
      <span style={{ fontSize: 14.5, fontWeight: 700, marginTop: 2 }}>{title}</span>
      <span className="muted" style={{ fontSize: 12.5, lineHeight: 1.5, flex: 1 }}>
        {desc}
      </span>
      <span style={{ color: "var(--brand)", display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, fontWeight: 600 }}>
        Abrir <ArrowRight size={13} />
      </span>
    </button>
  );
}

function Stat({ label, value }) {
  return (
    <div className="card" style={{ padding: "14px 16px" }}>
      <div className="muted" style={{ fontSize: 12 }}>
        {label}
      </div>
      <div className="tnum" style={{ fontSize: 27, fontWeight: 700, marginTop: 3, letterSpacing: "-0.02em" }}>
        {value}
      </div>
    </div>
  );
}
