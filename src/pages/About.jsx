import React, { useMemo, useState } from "react";
import { platformStats, STAGES, CULTURES } from "../lib/catalog.js";
import { LEVELS } from "../lib/provenance.js";
import { CRITERIA, MISSING_CRITERIA } from "../lib/nci.js";
import { fmtNum } from "../lib/economics.js";
import { NUTRIENT_INTERACTIONS, INTERACTION_KINDS } from "../data/nutrientInteractions.js";
import InteractionList, { InteractionSourceNote } from "../components/InteractionList.jsx";
import { NUTRIENT_LABEL } from "../lib/nutrientLabels.js";

// Página "Sobre" = transparência metodológica. O que a plataforma calcula, com
// que dado, e onde o dado não existe. É o que sustenta a credibilidade dos
// números nas outras telas.
export default function About() {
  const stats = platformStats();

  return (
    <div className="shell" style={{ paddingTop: 34, paddingBottom: 70, maxWidth: 860 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", margin: 0 }}>Sobre a plataforma</h1>
      <p className="muted" style={{ fontSize: 15, lineHeight: 1.65, margin: "12px 0 0" }}>
        O Comparador Nutricional compara produtos de nutrição foliar por <strong>composição, posicionamento e custo por
        hectare</strong>, a partir das planilhas internas e dos materiais oficiais recebidos. Todo número exibido tem
        origem rastreável; onde o dado não existe, a plataforma diz que não existe em vez de estimar.
      </p>

      <Section title="Cobertura dos dados">
        <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.6, marginTop: 0 }}>
          Medida sobre o catálogo atual, não estimada:
        </p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, minWidth: 380 }}>
            <tbody>
              <Row label="Produtos cadastrados" value={fmtNum(stats.products, 0)} />
              <Row label="Empresas" value={stats.brands} />
              <Row label="Com composição nutricional" value={`${fmtNum(stats.withNutrients, 0)} de ${fmtNum(stats.products, 0)}`} />
              <Row
                label="Com dose de referência"
                value={`${fmtNum(stats.withDose, 0)} de ${fmtNum(stats.products, 0)}`}
                warn
              />
              <Row label="Nutrientes mapeados" value={stats.nutrients} />
              <Row label="Culturas com manejo oficial" value={`${stats.cultures} (${CULTURES.join(", ")})`} />
              <Row label="Estádios fenológicos cadastrados" value={STAGES.length} />
              <Row label="Preço" value="0 — sempre informado por você" warn />
            </tbody>
          </table>
        </div>
        <Callout>
          Custo/ha depende de <strong>dose × preço</strong>. Como a maioria dos produtos não tem dose cadastrada e nenhum
          tem preço, esses dois campos são entradas suas. Sem eles, a plataforma mostra “informe dose e preço” em vez de
          “R$ 0,00” — um zero pareceria resultado.
        </Callout>
      </Section>

      <Section title="Confiabilidade da fonte">
        <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.6, marginTop: 0 }}>
          Cada produto carrega um selo derivado da origem registrada no cadastro:
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          <LevelRow level={LEVELS.OFFICIAL} count={stats.byProvenance.official} />
          <LevelRow level={LEVELS.DECLARED} count={stats.byProvenance.declared} />
          <LevelRow level={LEVELS.UNVERIFIED} count={stats.byProvenance.unverified} />
        </div>
        <p className="muted-soft" style={{ fontSize: 12.5, lineHeight: 1.6, marginTop: 10 }}>
          Nenhuma origem nova é promovida a “oficial” automaticamente: o que não casa com uma fonte conhecida entra como
          “informado”.
        </p>
      </Section>

      <Section title="Como o custo é calculado">
        <Formula label="Custo por hectare" expr="dose (un/ha) × preço (R$/un)" />
        <Formula label="Custo total" expr="custo/ha × área (ha)" />
        <Formula label="Nutriente entregue" expr="concentração (g/un) × dose (un/ha) = g/ha" />
        <Formula label="Custo por nutriente" expr="custo/ha ÷ (g/ha ÷ 1000) = R$/kg do nutriente" />
        <Callout>
          <strong>Unidades nunca são misturadas.</strong> Produto líquido usa L/ha, concentração em g/L e preço em R$/L;
          sólido usa kg/ha, g/kg e R$/kg. Quando os dois produtos comparados têm apresentações diferentes, a plataforma
          avisa que a diferença percentual entre concentrações não é comparável direto e remete ao nutriente entregue por
          hectare.
        </Callout>
      </Section>

      <Section title="NCI — Nutrição & Custo Index">
        <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.6, marginTop: 0 }}>
          Índice <strong>comparativo do par selecionado</strong>: cada critério é normalizado contra o outro produto (o
          melhor do par recebe 100). Não é nota de qualidade, não é recomendação de compra, e fora de um par o número não
          significa nada.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 10 }}>
          {CRITERIA.map((c) => (
            <div
              key={c.id}
              style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "9px 12px", background: "var(--surface-2)", borderRadius: "var(--radius-sm)", fontSize: 13 }}
            >
              <span>{c.label}</span>
              <span className="tnum" style={{ color: "var(--brand)", fontWeight: 700 }}>
                {c.weight}%
              </span>
            </div>
          ))}
        </div>
        <h3 style={{ fontSize: 14, fontWeight: 700, margin: "16px 0 7px" }}>Fora da conta, por falta de dado</h3>
        {MISSING_CRITERIA.map((c) => (
          <div
            key={c.label}
            style={{ padding: "10px 12px", background: "var(--warn-soft)", border: "1px solid color-mix(in srgb, var(--warn) 20%, transparent)", borderRadius: "var(--radius-sm)", marginBottom: 7 }}
          >
            <div style={{ fontSize: 13, fontWeight: 600 }}>{c.label}</div>
            <div className="muted" style={{ fontSize: 12.5, marginTop: 3, lineHeight: 1.5 }}>
              {c.reason}
            </div>
          </div>
        ))}
      </Section>

      <Section title="Interações entre nutrientes">
        <InteractionTable />
      </Section>

      <Section title="Limites conhecidos">
        <ul className="muted" style={{ fontSize: 13.5, lineHeight: 1.7, paddingLeft: 20, margin: 0 }}>
          <li>A tabela de interações entre nutrientes é referência de fisiologia de terceiro, não medição da Agrocete e não avaliação de nenhum produto. Ela não entra em nenhum cálculo (NCI, custo, dose ou comparativo).</li>
          <li>Doses de referência vêm do primeiro número do texto de dose da planilha — ponto de partida, não recomendação. Confira a bula.</li>
          <li>Posicionamento por cultura/estádio existe apenas para os produtos dos manejos oficiais de Soja, Milho e Algodão.</li>
          <li>Os 3 níveis dos manejos prontos (Básico/Médio/Completo) são um agrupamento nosso dos estágios do material oficial, não uma classificação da Agrocete.</li>
          <li>A sugestão automática de manejo Agrocete é uma heurística de aproximação por nutriente, não um solver nem recomendação validada.</li>
          <li>Preferências, manejos salvos e doses travadas ficam no navegador do aparelho — não sincronizam entre pessoas ou dispositivos.</li>
        </ul>
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="card" style={{ padding: 20, marginTop: 18 }}>
      <h2 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 12px" }}>{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, value, warn }) {
  return (
    <tr style={{ borderTop: "1px solid var(--border)" }}>
      <td style={{ padding: "9px 8px 9px 0" }}>{label}</td>
      <td
        className="tnum"
        style={{ padding: "9px 0", textAlign: "right", fontWeight: 600, color: warn ? "var(--warn)" : "var(--text)" }}
      >
        {value}
      </td>
    </tr>
  );
}

function LevelRow({ level, count = 0 }) {
  const tone = level.tone === "ok" ? "var(--ok)" : level.tone === "warn" ? "var(--warn)" : "var(--info)";
  return (
    <div style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 12px", background: "var(--surface-2)", borderRadius: "var(--radius-sm)" }}>
      <span style={{ color: tone, fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{level.icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600 }}>
          {level.label}{" "}
          <span className="tnum muted-soft" style={{ fontWeight: 500 }}>
            · {fmtNum(count, 0)} produtos
          </span>
        </div>
        <div className="muted" style={{ fontSize: 12.5, marginTop: 2, lineHeight: 1.5 }}>
          {level.help}
        </div>
      </div>
    </div>
  );
}

function Formula({ label, expr }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "baseline", padding: "9px 0", borderTop: "1px solid var(--border)" }}>
      <span style={{ fontSize: 13.5, fontWeight: 600, minWidth: 170 }}>{label}</span>
      <code
        className="tnum"
        style={{ fontSize: 12.5, background: "var(--surface-2)", padding: "4px 9px", borderRadius: 7, color: "var(--text-2)" }}
      >
        {expr}
      </code>
    </div>
  );
}

function Callout({ children }) {
  return (
    <div
      style={{
        marginTop: 12,
        padding: "12px 14px",
        borderRadius: "var(--radius-sm)",
        background: "var(--info-soft)",
        border: "1px solid color-mix(in srgb, var(--info) 15%, transparent)",
        fontSize: 12.5,
        lineHeight: 1.6,
      }}
    >
      {children}
    </div>
  );
}

// Tabela completa de interações, com filtro por tipo e por nutriente. É a
// referência de consulta; nas outras telas ela aparece já cruzada com a
// composição do produto que está aberto.
function InteractionTable() {
  const [kind, setKind] = useState("");
  const [nut, setNut] = useState("");

  const nutrientes = useMemo(() => {
    const set = new Set();
    NUTRIENT_INTERACTIONS.forEach((i) => i.keys.forEach((k) => set.add(k)));
    return Array.from(set).sort((a, b) => (NUTRIENT_LABEL[a] || a).localeCompare(NUTRIENT_LABEL[b] || b));
  }, []);

  const items = useMemo(
    () =>
      NUTRIENT_INTERACTIONS.filter(
        (i) => (!kind || i.kind === kind) && (!nut || i.keys.includes(nut))
      ),
    [kind, nut]
  );

  return (
    <>
      <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.6, margin: "0 0 12px" }}>
        {NUTRIENT_INTERACTIONS.length} interações entre nutrientes — o que se soma e o que compete. Serve para ler a
        composição de um produto (ou de uma calda) sabendo o que observar. <strong>Não entra em nenhum cálculo</strong>{" "}
        da plataforma.
      </p>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        <FilterChip active={!kind} onClick={() => setKind("")}>
          Todas ({NUTRIENT_INTERACTIONS.length})
        </FilterChip>
        {Object.entries(INTERACTION_KINDS).map(([id, k]) => {
          const n = NUTRIENT_INTERACTIONS.filter((i) => i.kind === id).length;
          return (
            <FilterChip key={id} active={kind === id} onClick={() => setKind(kind === id ? "" : id)} tone={k.tone}>
              {k.label} ({n})
            </FilterChip>
          );
        })}
      </div>

      <label style={{ display: "block", marginBottom: 12 }}>
        <span className="muted-soft" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Filtrar por nutriente
        </span>
        <select
          value={nut}
          onChange={(e) => setNut(e.target.value)}
          aria-label="Filtrar interações por nutriente"
          className="input"
          style={{ display: "block", marginTop: 5, maxWidth: 280 }}
        >
          <option value="">Todos os nutrientes</option>
          {nutrientes.map((k) => (
            <option key={k} value={k}>
              {k === "Al" ? "Alumínio (fator de solo)" : NUTRIENT_LABEL[k] || k}
            </option>
          ))}
        </select>
      </label>

      {items.length === 0 ? (
        <p className="muted" style={{ fontSize: 13 }}>Nenhuma interação com esses filtros.</p>
      ) : (
        <InteractionList items={items} />
      )}
      <InteractionSourceNote />
    </>
  );
}

function FilterChip({ children, active, onClick, tone }) {
  const fg = tone === "ok" ? "var(--ok)" : tone === "warn" ? "var(--warn)" : tone === "info" ? "var(--info)" : "var(--brand)";
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className="chip"
      style={{
        cursor: "pointer",
        fontSize: 12,
        fontFamily: "inherit",
        background: active ? `color-mix(in srgb, ${fg} 12%, transparent)` : "transparent",
        color: active ? fg : "var(--text-3)",
        borderColor: active ? "transparent" : "var(--border)",
      }}
    >
      {children}
    </button>
  );
}
