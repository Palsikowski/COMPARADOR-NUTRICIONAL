import React, { useMemo, useState } from "react";
import { FileDown, Search, X, Info, FileText } from "lucide-react";
import { portfolioRows, portfolioCultures, PORTFOLIO_SOURCE } from "../lib/portfolio.js";
import { exportPortfolio } from "../lib/portfolioPdf.js";
import ProductSheet from "../components/ProductSheet.jsx";

// Portfólio Agrocete — a tabela do material oficial dentro do app.
//
// É a visão "posicionamento rápido em mãos": todo o portfólio numa tela, com a
// garantia de cada produto e a dose por cultura, agrupado como a própria
// Agrocete agrupa. No celular a tabela vira card por produto, porque seis
// colunas em 390px não se lê.
export default function Portfolio({ onOpenProduct }) {
  const [q, setQ] = useState("");
  const [sheet, setSheet] = useState(null);
  const [exporting, setExporting] = useState(false);
  const culturas = useMemo(() => portfolioCultures(), []);
  const grupos = useMemo(() => portfolioRows(), []);

  const filtrado = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return grupos;
    return grupos
      .map((g) => ({
        ...g,
        products: g.products.filter(
          (r) =>
            r.product.name.toLowerCase().includes(t) ||
            (r.product.technology || "").toLowerCase().includes(t) ||
            (r.composition || "").toLowerCase().includes(t) ||
            r.nutrients.some((n) => n.label.toLowerCase().includes(t))
        ),
      }))
      .filter((g) => g.products.length > 0);
  }, [grupos, q]);

  const total = grupos.reduce((s, g) => s + g.products.length, 0);
  const achados = filtrado.reduce((s, g) => s + g.products.length, 0);

  async function handleExport() {
    setExporting(true);
    try {
      await exportPortfolio({ grupos: filtrado, culturas });
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="shell" style={{ paddingTop: 24, paddingBottom: 80 }}>
      <header style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>Portfólio Agrocete</h1>
        <p className="muted" style={{ fontSize: 14.5, margin: "6px 0 0", lineHeight: 1.55, maxWidth: 680 }}>
          Os {total} produtos do material de posicionamento, com a garantia de cada um e a dose por cultura.
          Agrupados como a Agrocete agrupa.
        </p>
      </header>

      <div className="card" style={{ padding: 14, marginBottom: 16, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar produto, nutriente ou tecnologia"
            aria-label="Buscar no portfólio"
            className="input"
            style={{ paddingLeft: 36, paddingRight: q ? 34 : 12, width: "100%" }}
          />
          {q && (
            <button onClick={() => setQ("")} aria-label="Limpar busca" className="btn btn-ghost" style={{ position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)", padding: 5 }}>
              <X size={14} />
            </button>
          )}
        </div>
        <button className="btn btn-primary" onClick={handleExport} disabled={exporting || achados === 0}>
          <FileDown size={15} /> {exporting ? "Gerando..." : "Baixar PDF"}
        </button>
      </div>

      {q && (
        <p className="muted" style={{ fontSize: 12.5, margin: "0 0 12px" }}>
          {achados} de {total} produtos
        </p>
      )}

      {filtrado.length === 0 ? (
        <div className="card" style={{ padding: "26px 18px", textAlign: "center" }}>
          <div style={{ fontWeight: 600 }}>Nenhum produto com esse termo</div>
        </div>
      ) : (
        filtrado.map((g) => (
          <section key={g.group} style={{ marginBottom: 26 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 10px", display: "flex", alignItems: "center", gap: 8 }}>
              {g.group}
              <span className="chip" style={{ fontSize: 10.5, background: "var(--surface-2)", borderColor: "transparent", color: "var(--text-3)" }}>
                {g.products.length}
              </span>
            </h2>

            {/* Tabela no desktop */}
            <div className="card only-wide" style={{ padding: 0, overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr>
                    <Th>Produto</Th>
                    <Th>Garantias</Th>
                    {culturas.map((c) => (
                      <Th key={c} center>
                        {c}
                      </Th>
                    ))}
                    <Th>Composição / tecnologia</Th>
                    <Th />
                  </tr>
                </thead>
                <tbody>
                  {g.products.map((r) => (
                    <tr key={r.product.id} style={{ borderTop: "1px solid var(--border)" }}>
                      <td style={{ padding: "10px 12px", fontWeight: 600, minWidth: 140 }}>{r.product.name}</td>
                      <td style={{ padding: "10px 12px", minWidth: 200 }}>
                        <Garantia row={r} />
                      </td>
                      {culturas.map((c) => {
                        const d = r.culturas.find((x) => x.cultura === c);
                        return (
                          <td
                            key={c}
                            className="muted"
                            style={{ padding: "10px 12px", textAlign: "center", whiteSpace: "pre-line", fontSize: 12.5, minWidth: 134 }}
                          >
                            {d ? d.dose : <span className="muted-soft">—</span>}
                          </td>
                        );
                      })}
                      <td className="muted" style={{ padding: "10px 12px", fontSize: 12.5, minWidth: 200 }}>
                        {r.product.technology || "—"}
                      </td>
                      <td style={{ padding: "10px 8px" }}>
                        <button className="btn btn-ghost" style={{ padding: 6 }} onClick={() => setSheet(r.product)} aria-label={`Ficha técnica de ${r.product.name}`}>
                          <FileText size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards no celular */}
            <div className="only-narrow" style={{ flexDirection: "column", gap: 10 }}>
              {g.products.map((r) => (
                <div key={r.product.id} className="card" style={{ padding: 13 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.25 }}>{r.product.name}</div>
                    <button className="btn btn-ghost" style={{ padding: 6, flexShrink: 0 }} onClick={() => setSheet(r.product)} aria-label={`Ficha técnica de ${r.product.name}`}>
                      <FileText size={15} />
                    </button>
                  </div>
                  <div style={{ marginTop: 7 }}>
                    <Garantia row={r} />
                  </div>
                  {r.product.technology && (
                    <div className="muted" style={{ fontSize: 12, marginTop: 7, lineHeight: 1.45 }}>
                      {r.product.technology}
                    </div>
                  )}
                  {r.culturas.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 9 }}>
                      {r.culturas.map((c) => (
                        <div key={c.cultura} style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 12.5 }}>
                          <span style={{ fontWeight: 600 }}>{c.cultura}</span>
                          <span className="muted" style={{ textAlign: "right", whiteSpace: "pre-line" }}>{c.dose}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))
      )}

      <div
        style={{
          display: "flex",
          gap: 9,
          padding: "11px 13px",
          borderRadius: "var(--radius-sm)",
          background: "var(--info-soft)",
          fontSize: 12.5,
          lineHeight: 1.55,
          marginTop: 4,
        }}
      >
        <Info size={15} style={{ color: "var(--info)", flexShrink: 0, marginTop: 1 }} />
        <span className="muted">
          {PORTFOLIO_SOURCE} As garantias são as mesmas que alimentam os cálculos do app — a tabela não é uma cópia
          à parte. Dose é a faixa do material; confirme na bula antes de aplicar.
        </span>
      </div>

      {sheet && <ProductSheet product={sheet} onClose={() => setSheet(null)} />}
    </div>
  );
}

function Th({ children, center }) {
  return (
    <th
      style={{
        textAlign: center ? "center" : "left",
        padding: "9px 12px",
        fontWeight: 600,
        fontSize: 11.5,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        color: "var(--text-3)",
        borderBottom: "1px solid var(--border)",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </th>
  );
}

function Garantia({ row }) {
  if (row.nutrients.length === 0) {
    return (
      <span className="muted" style={{ fontSize: 12.5, lineHeight: 1.45 }}>
        {row.composition || "não informado"}
      </span>
    );
  }
  return (
    <span style={{ display: "flex", flexWrap: "wrap", gap: "3px 10px", fontSize: 12.5 }}>
      {row.nutrients.map((n) => (
        <span key={n.key} style={{ whiteSpace: "nowrap" }}>
          <strong>{n.label}</strong> {n.value}
          {n.percent && <span className="muted-soft"> ({n.percent})</span>}
        </span>
      ))}
    </span>
  );
}
