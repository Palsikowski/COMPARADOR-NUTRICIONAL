import React, { useMemo, useState } from "react";
import { ArrowLeft, Search, X, FileDown, BarChart3, AlertTriangle, Info, FileText } from "lucide-react";
import { productsOfBrand, AGROCETE } from "../lib/catalog.js";
import { tileFor, comparisonData, chartValues } from "../lib/brandTiles.js";
import { fmtNum } from "../lib/economics.js";
import ComparisonChart, { seriesColors, MAX_SERIES } from "../components/ComparisonChart.jsx";
import ProductSheet from "../components/ProductSheet.jsx";
import DataBadge from "../components/DataBadge.jsx";
import { exportComparison } from "../lib/comparisonPdf.js";
import { nutrientLabel } from "../lib/nutrientLabels.js";

// Página de uma empresa: portfólio dela, seleção de produtos e o comparativo.
//
// A seleção é local desta tela e não mexe no "Meu manejo" — aqui a pessoa está
// estudando o portfólio de um concorrente para discutir com a equipe, não
// montando um manejo pra cotar. Misturar as duas coisas faria a seleção de
// estudo virar recomendação sem ninguém pedir.
export default function BrandPage({ brand, onBack, dark }) {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState([]);
  const [sheet, setSheet] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [note, setNote] = useState("");

  const tile = tileFor(brand);
  const all = useMemo(() => productsOfBrand(brand), [brand]);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    const base = term ? all.filter((p) => p.name.toLowerCase().includes(term)) : all;
    // Produto com composição primeiro: é com ele que dá pra montar o gráfico.
    return [...base].sort((a, b) => Number(!!chartValues(b)) - Number(!!chartValues(a)) || a.name.localeCompare(b.name));
  }, [all, q]);

  const selectedProducts = useMemo(
    () => selected.map((id) => all.find((p) => p.id === id)).filter(Boolean),
    [selected, all]
  );
  const { panels, withoutData } = useMemo(() => comparisonData(selectedProducts), [selectedProducts]);

  // A cor identifica o PRODUTO, não a posição dele dentro de um painel. Com a
  // seleção dividida em mais de um gráfico (g/kg e %m/m, por exemplo), colorir
  // por posição daria a mesma cor a dois produtos diferentes na mesma tela.
  const colorOf = useMemo(() => {
    const pal = seriesColors(dark);
    return new Map(selected.map((id, i) => [id, pal[i % pal.length]]));
  }, [selected, dark]);
  const full = selected.length >= MAX_SERIES;

  function toggle(p) {
    setSelected((cur) => (cur.includes(p.id) ? cur.filter((id) => id !== p.id) : cur.length >= MAX_SERIES ? cur : [...cur, p.id]));
  }

  async function handleExport() {
    setExporting(true);
    try {
      const pal = seriesColors(false);
      await exportComparison({
        brand,
        products: selectedProducts,
        panels,
        withoutData,
        note,
        colorOf: new Map(selected.map((id, i) => [id, pal[i % pal.length]])),
      });
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="shell" style={{ paddingTop: 20, paddingBottom: 90 }}>
      <button className="btn btn-ghost" onClick={onBack} style={{ marginBottom: 14, paddingLeft: 6 }}>
        <ArrowLeft size={16} /> Todas as empresas
      </button>

      <header style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", marginBottom: 18 }}>
        {tile && (
          <span
            className="brand-flag-badge"
            style={{
              "--flag-bg": tile.badge.bg,
              "--flag-fg": tile.badge.fg,
              "--flag-bg-dark": tile.badge.bgDark,
              "--flag-fg-dark": tile.badge.fgDark,
              width: 56,
              height: 56,
              fontSize: 20,
            }}
            aria-hidden="true"
          >
            {tile.badge.initials}
          </span>
        )}
        <div style={{ minWidth: 0 }}>
          <h1 style={{ fontSize: 25, fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>{brand}</h1>
          <p className="muted" style={{ fontSize: 13.5, margin: "4px 0 0" }}>
            {all.length} {all.length === 1 ? "produto cadastrado" : "produtos cadastrados"}
            {tile && tile.withComposition > 0 ? ` · ${tile.withComposition} com composição declarada` : ""}
            {brand === AGROCETE ? " · nossa linha" : ""}
          </p>
        </div>
      </header>

      <div className="card" style={{ padding: 14, marginBottom: 16 }}>
        <div style={{ position: "relative" }}>
          <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Buscar em ${brand}`}
            aria-label={`Buscar produto em ${brand}`}
            className="input"
            style={{ paddingLeft: 36, paddingRight: q ? 34 : 12, width: "100%" }}
          />
          {q && (
            <button onClick={() => setQ("")} aria-label="Limpar busca" className="btn btn-ghost" style={{ position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)", padding: 5 }}>
              <X size={14} />
            </button>
          )}
        </div>
        <p className="muted" style={{ fontSize: 12.5, margin: "10px 0 0", lineHeight: 1.5 }}>
          Marque até {MAX_SERIES} produtos para comparar. O limite não é técnico: acima de quatro cores as barras
          deixam de ser distinguíveis com segurança por quem tem daltonismo.
        </p>
      </div>

      {selectedProducts.length > 0 && (
        <section className="card" style={{ padding: 16, marginBottom: 18 }} id="comparativo">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <BarChart3 size={18} style={{ color: "var(--brand)" }} /> Comparativo
            </h2>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="btn btn-ghost" onClick={() => setSelected([])}>
                Limpar seleção
              </button>
              <button className="btn btn-primary" onClick={handleExport} disabled={exporting || panels.length === 0}>
                <FileDown size={15} /> {exporting ? "Gerando..." : "Baixar PDF"}
              </button>
            </div>
          </div>

          {panels.length === 0 ? (
            <div style={{ display: "flex", gap: 9, fontSize: 13.5, padding: "12px 13px", background: "var(--warn-soft)", borderRadius: "var(--radius-sm)", lineHeight: 1.55 }}>
              <AlertTriangle size={16} style={{ color: "var(--warn)", flexShrink: 0, marginTop: 1 }} />
              <span>
                Nenhum dos produtos marcados tem composição cadastrada, então não há o que colocar no gráfico.
                Selecione produtos com composição, ou preencha a dos escolhidos pela ficha técnica.
              </span>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
              {panels.map((panel) => (
                <ComparisonChart
                  key={panel.unit}
                  panel={panel}
                  colorOf={colorOf}
                  title={panels.length > 1 ? `Produtos em ${panel.unit}` : "Composição declarada"}
                />
              ))}
            </div>
          )}

          {panels.some((p) => p.unit === "% m/m") && (
            <div style={{ display: "flex", gap: 9, fontSize: 12.5, marginTop: 14, padding: "11px 13px", background: "var(--warn-soft)", borderRadius: "var(--radius-sm)", lineHeight: 1.55 }}>
              <AlertTriangle size={15} style={{ color: "var(--warn)", flexShrink: 0, marginTop: 1 }} />
              <span>
                O gráfico em <strong>%m/m</strong> compara a proporção declarada, não a entrega por hectare: esses
                produtos vieram sem densidade no material de origem, então não dá para converter para g/L nem
                calcular custo por kg de nutriente. Informando a densidade pela ficha técnica (botão Editar), eles
                passam a entrar nas contas.
              </span>
            </div>
          )}

          {panels.length > 1 && (
            <div style={{ display: "flex", gap: 9, fontSize: 12.5, marginTop: 14, padding: "11px 13px", background: "var(--info-soft)", borderRadius: "var(--radius-sm)", lineHeight: 1.55 }}>
              <Info size={15} style={{ color: "var(--info)", flexShrink: 0, marginTop: 1 }} />
              <span>
                A seleção mistura <strong>{panels.map((p) => p.unit).join(" e ")}</strong>. É um gráfico por unidade
                porque elas não dividem a mesma escala — g/L é por litro, g/kg é por quilo e %m/m é proporção.
                Comparar as alturas entre um gráfico e outro não significa nada.
              </span>
            </div>
          )}

          {withoutData.length > 0 && (
            <p className="muted" style={{ fontSize: 12.5, marginTop: 12, lineHeight: 1.55 }}>
              Fora do gráfico por não ter composição cadastrada:{" "}
              <strong>{withoutData.map((p) => p.name).join(", ")}</strong>. Não vira barra zerada porque
              &ldquo;não sabemos&rdquo; é diferente de &ldquo;não entrega&rdquo;.
            </p>
          )}

          <label style={{ display: "block", marginTop: 16 }}>
            <span className="muted-soft" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Observação para a equipe (sai no PDF)
            </span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="input"
              style={{ width: "100%", marginTop: 5, resize: "vertical", fontFamily: "inherit" }}
              placeholder="Ex: comparar com o Grap Cálcio na reunião de terça"
            />
          </label>
        </section>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {list.map((p) => {
          const on = selected.includes(p.id);
          return (
            <div key={p.id} className="card" style={{ padding: 12, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 220, cursor: on || !full ? "pointer" : "default" }}>
                <input
                  type="checkbox"
                  checked={on}
                  disabled={!on && full}
                  onChange={() => toggle(p)}
                  aria-label={`Comparar ${p.name}`}
                  style={{ width: 18, height: 18, accentColor: on ? colorOf.get(p.id) : undefined, flexShrink: 0 }}
                />
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 14.5, fontWeight: 600, lineHeight: 1.3 }}>{p.name}</span>
                  <span className="muted" style={{ display: "block", fontSize: 12, marginTop: 2 }}>
                    {p.category || "sem categoria"}
                    {(() => {
                      const cv = chartValues(p);
                      if (!cv) return " · sem composição cadastrada";
                      return ` · ${Object.entries(cv.values)
                        .filter(([, v]) => Number(v) > 0)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 3)
                        .map(([k, v]) => `${nutrientLabel(k)} ${fmtNum(v)}${cv.unit === "% m/m" ? "%" : ` ${cv.unit}`}`)
                        .join(" · ")}`;
                    })()}
                  </span>
                </span>
              </label>
              <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
                <DataBadge product={p} compact />
                <button className="btn btn-ghost" onClick={() => setSheet(p)} aria-label={`Ficha técnica de ${p.name}`} style={{ padding: 7 }}>
                  <FileText size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {sheet && <ProductSheet product={sheet} onClose={() => setSheet(null)} />}
    </div>
  );
}
