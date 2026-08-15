import React, { useMemo, useState } from "react";
import { Search, X, ArrowRight } from "lucide-react";
import { BRAND_TILES } from "../lib/brandTiles.js";
import { AGROCETE } from "../lib/catalog.js";

// Vitrine de empresas: uma bandeira por empresa, em vez da lista de todos os
// produtos de todas as marcas de uma vez. A entrada "Empresas" antes despejava
// os 1.595 produtos agrupados por marca — pra chegar numa empresa específica a
// pessoa rolava a lista inteira. A bandeira dá a visão do mercado numa tela e
// transforma a escolha da empresa num clique.
export default function Brands({ onOpenBrand }) {
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return BRAND_TILES;
    return BRAND_TILES.filter((t) => t.brand.toLowerCase().includes(term));
  }, [q]);

  const totalProdutos = BRAND_TILES.reduce((s, t) => s + t.total, 0);

  return (
    <div className="shell" style={{ paddingTop: 26, paddingBottom: 80 }}>
      <header style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>Empresas</h1>
        <p className="muted" style={{ fontSize: 14.5, margin: "6px 0 0", lineHeight: 1.55, maxWidth: 620 }}>
          {BRAND_TILES.length} empresas e {totalProdutos.toLocaleString("pt-BR")} produtos cadastrados. Abra uma
          empresa para ver o portfólio dela, selecionar produtos e gerar o comparativo em gráfico.
        </p>
      </header>

      <div style={{ position: "relative", marginBottom: 16, maxWidth: 380 }}>
        <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar empresa"
          aria-label="Buscar empresa"
          className="input"
          style={{ paddingLeft: 36, paddingRight: q ? 34 : 12, width: "100%" }}
        />
        {q && (
          <button
            onClick={() => setQ("")}
            aria-label="Limpar busca"
            className="btn btn-ghost"
            style={{ position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)", padding: 5 }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {list.length === 0 ? (
        <div className="card" style={{ padding: "26px 18px", textAlign: "center" }}>
          <div style={{ fontWeight: 600 }}>Nenhuma empresa com esse nome</div>
          <p className="muted" style={{ fontSize: 13, marginTop: 6 }}>
            Confira a grafia — o catálogo guarda o nome exatamente como veio da planilha de origem.
          </p>
        </div>
      ) : (
        <div className="brand-grid">
          {list.map((t) => (
            <BrandFlag key={t.brand} tile={t} onClick={() => onOpenBrand(t.brand)} />
          ))}
        </div>
      )}
    </div>
  );
}

function BrandFlag({ tile, onClick }) {
  const { badge } = tile;
  const isAgrocete = tile.brand === AGROCETE;
  return (
    <button className="brand-flag card" onClick={onClick} aria-label={`Abrir portfólio de ${tile.brand}`}>
      <span
        className="brand-flag-badge"
        style={{ "--flag-bg": badge.bg, "--flag-fg": badge.fg, "--flag-bg-dark": badge.bgDark, "--flag-fg-dark": badge.fgDark }}
        aria-hidden="true"
      >
        {badge.initials}
      </span>
      <span style={{ minWidth: 0, flex: 1, textAlign: "left" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
          <span style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.25 }}>{tile.brand}</span>
          {isAgrocete && (
            <span className="chip" style={{ fontSize: 10, background: "var(--brand-soft)", color: "var(--brand)", borderColor: "transparent" }}>
              nossa linha
            </span>
          )}
        </span>
        <span className="muted" style={{ display: "block", fontSize: 12.5, marginTop: 3 }}>
          {tile.total} {tile.total === 1 ? "produto" : "produtos"} ·{" "}
          {tile.withComposition > 0 ? `${tile.withComposition} com composição` : "sem composição cadastrada"}
        </span>
        {tile.topCategories.length > 0 && (
          <span className="muted-soft" style={{ display: "block", fontSize: 11.5, marginTop: 4, lineHeight: 1.4 }}>
            {tile.topCategories.join(" · ")}
          </span>
        )}
      </span>
      <ArrowRight size={16} style={{ color: "var(--text-3)", flexShrink: 0 }} />
    </button>
  );
}
