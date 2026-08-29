import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight, Maximize2, Minimize2, AlertTriangle, Info } from "lucide-react";
import { CompositionBars, SeriesLegend } from "../components/ComparisonChart.jsx";
import { buildDeck } from "../lib/presentation.js";
import { chartValues } from "../lib/brandTiles.js";
import { fmtNum } from "../lib/economics.js";
import { nutrientLabel } from "../lib/nutrientLabels.js";

// Modo apresentação do comparativo de composição.
//
// A tela do comparativo é para estudar: tudo junto, denso, com a ficha a um
// clique. Projetada numa reunião ela não se sustenta — texto de 12px, quatro
// avisos empilhados e nenhuma ordem de leitura.
//
// Aqui o MESMO dado vira sequência: capa → quadro completo → um nutriente por
// vez → o que o dado não sustenta → fecho. Nada é recalculado: os painéis
// chegam prontos da página da empresa, e o gráfico é o mesmo componente numa
// densidade maior (`size="stage"`).
//
// Três regras que valem em todos os slides:
//  - um assunto por slide;
//  - nenhum número sem unidade e sem de quem ele é;
//  - as ressalvas têm slide próprio, antes do fecho — quem apresenta precisa
//    dizê-las, não deixar o cliente descobrir depois.

// Escala de texto do palco: cresce com a largura da projeção, com piso para
// notebook e teto para não estourar em telão.
// Abaixo disto o palco troca de caixa (ver SIZES em ComparisonChart): é o
// mesmo ponto em que a legenda desce para a própria linha do cabeçalho.
const NARROW = 760;

function useStageSize() {
  const [narrow, setNarrow] = useState(
    () => typeof window !== "undefined" && window.matchMedia(`(max-width: ${NARROW}px)`).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${NARROW}px)`);
    const on = (e) => setNarrow(e.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return narrow ? "stageNarrow" : "stage";
}

const T = {
  eyebrow: "clamp(11px, 1.05vw, 15px)",
  title: "clamp(22px, 2.9vw, 42px)",
  big: "clamp(30px, 4.4vw, 64px)",
  hero: "clamp(46px, 7.6vw, 116px)",
  body: "clamp(13px, 1.25vw, 18px)",
  small: "clamp(11px, 1vw, 14px)",
};

export default function PresentationDeck({ brand, products, panels, withoutData = [], note = "", colorOf, onClose }) {
  const slides = useMemo(
    () => buildDeck({ brand, panels, withoutData, note, products }),
    [brand, panels, withoutData, note, products]
  );
  const [i, setI] = useState(0);
  const [full, setFull] = useState(false);
  const stageSize = useStageSize();
  const rootRef = useRef(null);

  const go = useCallback(
    (delta) => setI((cur) => Math.min(slides.length - 1, Math.max(0, cur + delta))),
    [slides.length]
  );

  // Teclado é o controle real de uma apresentação: apresentador remoto manda
  // PageUp/PageDown, e barra de espaço é o reflexo de quem já usou slides.
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") return onClose();
      if (["ArrowRight", "PageDown", " ", "Spacebar"].includes(e.key)) {
        e.preventDefault();
        go(1);
      } else if (["ArrowLeft", "PageUp"].includes(e.key)) {
        e.preventDefault();
        go(-1);
      } else if (e.key === "Home") {
        setI(0);
      } else if (e.key === "End") {
        setI(slides.length - 1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose, slides.length]);

  // A página atrás continua rolando sob o overlay se ninguém travar.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    rootRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onFs = () => setFull(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await rootRef.current?.requestFullscreen?.();
    } catch {
      // navegador sem fullscreen ou permissão negada: a apresentação continua
      // funcionando em janela, só não ocupa a tela toda.
    }
  }

  const slide = slides[i];

  return (
    <div
      ref={rootRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={`Apresentação do comparativo de ${brand}`}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        outline: "none",
      }}
    >
      <DeckHeader
        brand={brand}
        products={products}
        colorOf={colorOf}
        index={i}
        total={slides.length}
        full={full}
        onFullscreen={toggleFullscreen}
        onClose={onClose}
      />

      <main
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          display: "flex",
          justifyContent: "center",
          padding: "clamp(16px, 3vw, 44px)",
        }}
      >
        <div style={{ width: "100%", maxWidth: 1180, margin: "auto" }}>
          <Slide slide={slide} colorOf={colorOf} brand={brand} stageSize={stageSize} />
        </div>
      </main>

      <DeckFooter index={i} total={slides.length} onPrev={() => go(-1)} onNext={() => go(1)} onJump={setI} />
    </div>
  );
}

function DeckHeader({ brand, products, colorOf, index, total, full, onFullscreen, onClose }) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        flexWrap: "wrap",
        padding: "12px clamp(16px, 3vw, 44px)",
        borderBottom: "1px solid var(--border)",
        background: "var(--surface)",
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: T.small, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-3)" }}>
        {brand}
      </span>

      {/* Legenda fixa no cabeçalho: os nutrientes mudam de slide para slide, a
          identidade dos produtos não pode mudar junto. */}
      <div className="deck-legend" style={{ minWidth: 0, flex: 1 }}>
        <SeriesLegend products={products} colorOf={colorOf} size={14} gap={18} />
      </div>

      <span className="tnum muted-soft" style={{ fontSize: T.small, flexShrink: 0 }}>
        {index + 1} / {total}
      </span>
      <button
        className="btn btn-ghost"
        onClick={onFullscreen}
        style={{ minHeight: 38, padding: "0 10px", flexShrink: 0 }}
        aria-label={full ? "Sair da tela cheia" : "Tela cheia"}
      >
        {full ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
      </button>
      <button className="btn btn-ghost" onClick={onClose} style={{ minHeight: 38, padding: "0 12px", flexShrink: 0 }}>
        <X size={15} /> Sair
      </button>
    </header>
  );
}

function DeckFooter({ index, total, onPrev, onNext, onJump }) {
  return (
    <footer
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "10px clamp(16px, 3vw, 44px)",
        borderTop: "1px solid var(--border)",
        background: "var(--surface)",
        flexShrink: 0,
      }}
    >
      <button className="btn btn-ghost" onClick={onPrev} disabled={index === 0} style={{ minHeight: 40, padding: "0 12px" }}>
        <ChevronLeft size={16} /> Anterior
      </button>

      {/* Marcadores clicáveis: numa reunião sempre pedem "volta naquele slide". */}
      <div style={{ display: "flex", gap: 6, flex: 1, minWidth: 0, overflowX: "auto", alignItems: "center" }}>
        {Array.from({ length: total }, (_, k) => (
          <button
            key={k}
            onClick={() => onJump(k)}
            aria-label={`Ir para o slide ${k + 1}`}
            aria-current={k === index ? "true" : undefined}
            style={{
              width: k === index ? 26 : 9,
              height: 9,
              borderRadius: 999,
              border: "none",
              flexShrink: 0,
              cursor: "pointer",
              padding: 0,
              background: k === index ? "var(--brand)" : "var(--surface-3)",
              transition: "width var(--speed) ease, background var(--speed) ease",
            }}
          />
        ))}
      </div>

      <span className="muted-soft only-wide" style={{ fontSize: T.small, whiteSpace: "nowrap" }}>
        ← → navega · Esc sai
      </span>
      <button className="btn btn-primary" onClick={onNext} disabled={index === total - 1} style={{ minHeight: 40, padding: "0 12px" }}>
        Próximo <ChevronRight size={16} />
      </button>
    </footer>
  );
}

function Slide({ slide, colorOf, brand, stageSize }) {
  if (slide.kind === "cover") return <CoverSlide {...slide} colorOf={colorOf} />;
  if (slide.kind === "panel") return <PanelSlide {...slide} colorOf={colorOf} stageSize={stageSize} />;
  if (slide.kind === "highlight") return <HighlightSlide {...slide} colorOf={colorOf} stageSize={stageSize} />;
  if (slide.kind === "caveats") return <CaveatsSlide {...slide} />;
  if (slide.kind === "close") return <CloseSlide {...slide} brand={brand} />;
  return null;
}

function Eyebrow({ children }) {
  return (
    <div
      style={{
        fontSize: T.eyebrow,
        fontWeight: 700,
        letterSpacing: "0.09em",
        textTransform: "uppercase",
        color: "var(--brand)",
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

function SlideTitle({ children, size = T.title }) {
  return (
    <h2 style={{ fontSize: size, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.12, margin: 0 }}>{children}</h2>
  );
}

function Footnote({ children }) {
  return (
    <p className="muted-soft" style={{ fontSize: T.small, lineHeight: 1.55, margin: "clamp(14px, 2vw, 26px) 0 0", maxWidth: 900 }}>
      {children}
    </p>
  );
}

// Os três nutrientes mais concentrados do produto — o "quem é ele" em uma linha.
function topNutrients(product, n = 3) {
  const cv = chartValues(product);
  if (!cv) return null;
  const items = Object.entries(cv.values)
    .filter(([, v]) => Number(v) > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
  if (!items.length) return null;
  return items.map(([k, v]) => `${nutrientLabel(k)} ${fmtNum(v)}${cv.unit === "% m/m" ? "%" : ` ${cv.unit}`}`).join(" · ");
}

function CoverSlide({ brand, products, panels, withoutData, colorOf }) {
  const units = Array.from(new Set(panels.map((p) => p.unit)));
  return (
    <div>
      <Eyebrow>Comparativo de composição</Eyebrow>
      <SlideTitle size={T.big}>{brand}</SlideTitle>
      <p className="muted" style={{ fontSize: T.body, lineHeight: 1.55, margin: "12px 0 0", maxWidth: 820 }}>
        {products.length} {products.length === 1 ? "produto selecionado" : "produtos selecionados"}
        {units.length ? ` · concentração declarada em ${units.join(" e ")}` : ""}
        {withoutData.length ? ` · ${withoutData.length} sem composição cadastrada` : ""}.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, 250px), 1fr))`,
          gap: 12,
          marginTop: "clamp(18px, 2.6vw, 34px)",
        }}
      >
        {products.map((p) => {
          const top = topNutrients(p);
          return (
            <div key={p.id} className="card" style={{ padding: "clamp(14px, 1.6vw, 20px)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
                <span style={{ width: 12, height: 12, borderRadius: 3, background: colorOf.get(p.id), flexShrink: 0 }} />
                <span className="muted-soft" style={{ fontSize: T.small }}>{p.category || "sem categoria"}</span>
              </span>
              <div style={{ fontSize: `clamp(16px, 1.7vw, 24px)`, fontWeight: 700, lineHeight: 1.2 }}>{p.name}</div>
              <div className="muted" style={{ fontSize: T.small, marginTop: 8, lineHeight: 1.5 }}>
                {top || "Sem composição cadastrada — fica fora do gráfico."}
              </div>
            </div>
          );
        })}
      </div>

      <Footnote>
        Composição declarada pelo fabricante no material de origem do catálogo. Este comparativo é de concentração no
        produto — dose e preço não estão no catálogo e entram na Calculadora Custo/ha.
      </Footnote>
    </div>
  );
}

function PanelSlide({ panel, unit, multiUnit, part, colorOf, stageSize }) {
  return (
    <div>
      <Eyebrow>
        Composição declarada · {unit}
        {part ? ` · parte ${part.index} de ${part.total}` : ""}
      </Eyebrow>
      <SlideTitle>Quanto cada produto declara de cada nutriente</SlideTitle>

      <div className="deck-chart" style={{ marginTop: "clamp(16px, 2.4vw, 30px)" }}>
        <CompositionBars panel={panel} colorOf={colorOf} size={stageSize} />
      </div>

      <Footnote>
        Valores em <strong>{unit}</strong>, na mesma escala em todos os slides deste gráfico. Traço (—) é{" "}
        <strong>nutriente não declarado</strong>, que é diferente de zero.
        {multiUnit ? " Barras de unidades diferentes não se comparam entre si." : ""}
      </Footnote>
    </div>
  );
}

function HighlightSlide({ stat, colorOf, stageSize }) {
  const { nutrient, unit, leader, runnerUp, exclusive, silent, ratio, entries } = stat;
  const focusPanel = { ...stat.panel, nutrients: [nutrient] };
  const diff = leader.value - (runnerUp ? runnerUp.value : 0);

  return (
    <div>
      <Eyebrow>Destaque · {nutrientLabel(nutrient)}</Eyebrow>

      {/* Quem vem antes de quanto: sem o nome, o número grande é só um número.
          A identidade fica no quadradinho de cor ao lado do nome — o número
          herói usa tinta de texto, porque em amarelo ou verde-claro (slots 3 e
          4 da paleta) ele ficaria ilegível projetado. */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span style={{ width: 14, height: 14, borderRadius: 4, background: colorOf.get(leader.product.id), flexShrink: 0 }} />
        <span style={{ fontSize: `clamp(16px, 1.9vw, 26px)`, fontWeight: 700 }}>{leader.product.name}</span>
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: "clamp(10px, 1.1vw, 18px)", flexWrap: "wrap", marginTop: 6 }}>
        {/* Figura herói: dígitos proporcionais (tabular deixa número grande
            frouxo) e a unidade em corpo menor, para o valor ler primeiro. */}
        <span style={{ fontSize: T.hero, fontWeight: 700, letterSpacing: "-0.035em", lineHeight: 1 }}>
          {fmtNum(leader.value)}
        </span>
        <span className="muted" style={{ fontSize: T.title, fontWeight: 600 }}>{unit}</span>
      </div>

      <p className="muted" style={{ fontSize: T.body, lineHeight: 1.55, margin: "10px 0 0", maxWidth: 900 }}>
        {exclusive ? (
          <>
            É o único da seleção que declara <strong>{nutrientLabel(nutrient)}</strong>
            {silent > 0 ? ` — os outros ${silent} não trazem esse nutriente na composição.` : "."}
          </>
        ) : (
          <>
            <strong>
              +{fmtNum(diff)} {unit}
            </strong>{" "}
            {ratio ? `(${fmtNum(ratio, 1)}× a concentração)` : ""} em relação a {runnerUp.product.name}
            {silent > 0 ? `, e ${silent} da seleção não declaram esse nutriente.` : "."}
          </>
        )}
      </p>

      <div className="deck-chart" style={{ marginTop: "clamp(16px, 2.2vw, 28px)" }}>
        <CompositionBars panel={focusPanel} colorOf={colorOf} size={stageSize} scaleTo={leader.value} nutrientTitles={false} />
      </div>

      <Footnote>
        Escala deste nutriente, não a do gráfico completo — {entries.length}{" "}
        {entries.length === 1 ? "produto" : "produtos"} da seleção. Concentração declarada:{" "}
        <strong>mais concentrado não é melhor</strong>, depende da dose e do papel do produto no manejo.
      </Footnote>
    </div>
  );
}

function CaveatsSlide({ caveats }) {
  return (
    <div>
      <Eyebrow>Limites da leitura</Eyebrow>
      <SlideTitle>O que este gráfico não diz</SlideTitle>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: "clamp(16px, 2.4vw, 30px)" }}>
        {caveats.map((c) => {
          const warn = c.tone === "warn";
          return (
            <div
              key={c.id}
              style={{
                display: "flex",
                gap: 12,
                padding: "clamp(12px, 1.5vw, 18px)",
                borderRadius: "var(--radius-sm)",
                background: warn ? "var(--warn-soft)" : "var(--info-soft)",
                border: `1px solid color-mix(in srgb, ${warn ? "var(--warn)" : "var(--info)"} 22%, transparent)`,
              }}
            >
              {warn ? (
                <AlertTriangle size={20} style={{ color: "var(--warn)", flexShrink: 0, marginTop: 2 }} />
              ) : (
                <Info size={20} style={{ color: "var(--info)", flexShrink: 0, marginTop: 2 }} />
              )}
              <div>
                <div style={{ fontSize: `clamp(14px, 1.5vw, 20px)`, fontWeight: 700, lineHeight: 1.3 }}>{c.title}</div>
                <div className="muted" style={{ fontSize: T.body, lineHeight: 1.55, marginTop: 5 }}>
                  {c.body}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CloseSlide({ brand, note, products, panels }) {
  const nutrientCount = new Set(panels.flatMap((p) => p.nutrients)).size;
  return (
    <div>
      <Eyebrow>Fecho</Eyebrow>
      <SlideTitle>O que foi comparado</SlideTitle>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 190px), 1fr))",
          gap: 12,
          marginTop: "clamp(16px, 2.4vw, 30px)",
        }}
      >
        <Stat label="Empresa" value={brand} small />
        <Stat label={products.length === 1 ? "Produto" : "Produtos"} value={products.length} />
        <Stat label="Nutrientes no gráfico" value={nutrientCount} />
        <Stat label={panels.length === 1 ? "Unidade" : "Unidades"} value={panels.map((p) => p.unit).join(" · ")} small />
      </div>

      {note && (
        <div
          className="card"
          style={{ padding: "clamp(14px, 1.8vw, 22px)", marginTop: 14, borderLeft: "3px solid var(--brand)" }}
        >
          <div className="muted-soft" style={{ fontSize: T.small, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Observação da equipe
          </div>
          <div style={{ fontSize: T.body, lineHeight: 1.55, marginTop: 6, whiteSpace: "pre-line" }}>{note}</div>
        </div>
      )}

      <Footnote>
        Comparativo de <strong>concentração declarada</strong>, montado a partir do catálogo da plataforma. Não é
        recomendação agronômica nem indicação de compra: produtos com objetivos diferentes aparecem lado a lado sem que
        isso signifique que um substitui o outro. Custo por hectare e custo por quilo de nutriente dependem de dose e
        preço, que não estão no catálogo.
      </Footnote>
    </div>
  );
}

function Stat({ label, value, small }) {
  return (
    <div className="card" style={{ padding: "clamp(12px, 1.5vw, 18px)" }}>
      <div className="muted" style={{ fontSize: T.small }}>
        {label}
      </div>
      <div
        style={{
          fontSize: small ? `clamp(15px, 1.6vw, 22px)` : `clamp(24px, 3vw, 42px)`,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          marginTop: 4,
          lineHeight: 1.15,
        }}
      >
        {value}
      </div>
    </div>
  );
}
