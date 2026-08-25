import React, { useEffect, useMemo, useRef, useState } from "react";
import { MoveHorizontal } from "lucide-react";
import { PRODUCTS_BY_ID } from "../lib/catalog.js";
import { doseUnit, fmtNum } from "../lib/economics.js";

// Linha do tempo fenológica de um manejo: a planta crescendo estágio a
// estágio, com os produtos posicionados embaixo de cada um.
//
// O desenho é SVG gerado a partir dos estágios REAIS do manejo aberto, não uma
// figura pronta. Três motivos, nessa ordem:
//
// - **Cada cultura tem os seus estágios.** Soja vai de Plantio a R4–R5, Algodão
//   usa B1/B6/F2/F6/C1, e um manejo editado pela equipe pode ter quantos
//   estágios quiser. Uma imagem fixa mostraria a soja para todo mundo e
//   passaria a mentir no primeiro manejo diferente.
// - **A planta é ilustração, não medição.** Ela cresce com a POSIÇÃO do
//   estágio na sequência, e não com dado agronômico de altura ou massa. Está
//   dito na legenda, porque um desenho ao lado de números pesa como se fosse
//   número.
// - **Funciona offline e nos dois temas**, que é o resto do app.
const MIN_COL_W = 118;
const H = 318;
const SOIL_TOP = 190;
// O rótulo fica ABAIXO de onde a raiz chega: com os dois na mesma faixa, o
// texto branco cruzava as raízes e virava ruído nos dois temas.
const LABEL_Y = SOIL_TOP + 70;

// Quebra o rótulo em até duas linhas, sem cortar palavra no meio quando dá.
function wrapLabel(label, max = 15) {
  const words = String(label).split(/\s+/);
  const lines = [""];
  words.forEach((w) => {
    const line = lines[lines.length - 1];
    if (!line) lines[lines.length - 1] = w;
    else if ((line + " " + w).length <= max) lines[lines.length - 1] = line + " " + w;
    else lines.push(w);
  });
  if (lines.length <= 2) return lines;
  return [lines[0], lines.slice(1).join(" ").slice(0, max - 1) + "…"];
}

// Uma planta. `t` (0..1) é a posição do estágio na sequência: define altura do
// caule, quantos pares de folha, raiz e se já aparecem flor e vagem.
function Plant({ x, t }) {
  const stem = 26 + t * 132;
  const top = SOIL_TOP - stem;
  const pairs = Math.max(1, Math.round(1 + t * 4));
  const rootLen = 20 + t * 34;
  const leafLen = 15 + t * 13;
  // Nada de "secar" a última planta: o fim da sequência de um manejo é o
  // último estágio CADASTRADO (na soja, R4–R5, que é enchimento de grão), não
  // a maturação. Desenhar a planta seca ali afirmaria um estádio fenológico
  // que o manejo não diz.
  const leaf = "var(--tl-leaf)";
  const stemColor = "var(--tl-stem)";

  const leaves = [];
  for (let i = 0; i < pairs; i++) {
    // Folhas de baixo para cima, as de cima menores — leitura de planta jovem
    // no começo e de dossel cheio no fim.
    const f = (i + 1) / (pairs + 0.6);
    const y = SOIL_TOP - stem * f;
    const size = leafLen * (0.72 + 0.42 * (1 - f));
    leaves.push(
      <g key={i}>
        <path d={`M0 ${y} C ${-size * 0.5} ${y - size * 0.5}, ${-size} ${y - size * 0.34}, ${-size} ${y + size * 0.16} C ${-size * 0.7} ${y + size * 0.5}, ${-size * 0.28} ${y + size * 0.3}, 0 ${y}`} fill={leaf} />
        <path d={`M0 ${y} C ${size * 0.5} ${y - size * 0.5}, ${size} ${y - size * 0.34}, ${size} ${y + size * 0.16} C ${size * 0.7} ${y + size * 0.5}, ${size * 0.28} ${size * 0.3 + y}, 0 ${y}`} fill={leaf} />
      </g>
    );
  }

  const roots = [0, 1, 2, 3].map((i) => {
    const dir = i % 2 === 0 ? 1 : -1;
    const spread = (12 + i * 7) * dir * (0.4 + t * 0.6);
    const depth = rootLen * (1 - i * 0.13);
    return (
      <path
        key={i}
        d={`M0 ${SOIL_TOP} C ${spread * 0.3} ${SOIL_TOP + depth * 0.4}, ${spread} ${SOIL_TOP + depth * 0.6}, ${spread * 1.1} ${SOIL_TOP + depth}`}
        stroke="var(--tl-root)"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />
    );
  });

  return (
    <g transform={`translate(${x} 0)`}>
      {roots}
      <line x1="0" y1={SOIL_TOP} x2="0" y2={top} stroke={stemColor} strokeWidth={2.2} strokeLinecap="round" />
      {leaves}
      {/* Floração no meio do ciclo, vagem no fim: os dois marcos que o
          consultor procura na figura. */}
      {t > 0.42 && t <= 0.86 && (
        <circle cx={0} cy={top - 3} r={3.4} fill="var(--tl-flower)" />
      )}
      {t > 0.6 && (
        <g>
          <ellipse cx={9} cy={SOIL_TOP - stem * 0.45} rx={3.2} ry={7} fill="var(--tl-pod)" transform={`rotate(24 9 ${SOIL_TOP - stem * 0.45})`} />
          <ellipse cx={-9} cy={SOIL_TOP - stem * 0.3} rx={3.2} ry={7} fill="var(--tl-pod)" transform={`rotate(-24 -9 ${SOIL_TOP - stem * 0.3})`} />
        </g>
      )}
    </g>
  );
}

export default function StageTimeline({ stages }) {
  const cols = useMemo(() => (stages || []).filter(Boolean), [stages]);
  const boxRef = useRef(null);
  const [avail, setAvail] = useState(0);

  // Coluna elástica: com espaço sobrando as colunas esticam e o solo ocupa a
  // largura do card; sem espaço, cada uma fica no mínimo legível e a figura
  // rola na horizontal. Medir é o único jeito — o SVG tem viewBox fixo, e
  // esticar por CSS distorceria as plantas.
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([entry]) => setAvail(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (cols.length === 0) return null;

  const colW = Math.max(MIN_COL_W, avail ? avail / cols.length : MIN_COL_W);
  const width = cols.length * colW;

  return (
    <figure className="tl" style={{ margin: "0 0 14px" }}>
      {/* Rolagem horizontal na figura e nos produtos juntos: as duas partes
          precisam continuar alinhadas coluna a coluna em tela estreita. */}
      <div className="tl-scroll" ref={boxRef}>
        <div style={{ minWidth: width }}>
          <svg viewBox={`0 0 ${width} ${H}`} width={width} height={H} role="img" aria-label={`Linha do tempo do manejo: ${cols.map((s) => s.label).join(", ")}`}>
            <rect x="0" y={SOIL_TOP} width={width} height={H - SOIL_TOP} fill="var(--tl-soil)" rx="10" />
            {cols.map((stage, i) => {
              const t = cols.length === 1 ? 0.55 : i / (cols.length - 1);
              const cx = i * colW + colW / 2;
              const lines = wrapLabel(stage.label, colW > 150 ? 20 : 15);
              return (
                <g key={stage.id || stage.key || i}>
                  {i > 0 && (
                    <line x1={i * colW} y1={SOIL_TOP + 12} x2={i * colW} y2={H - 12} stroke="var(--tl-divider)" strokeWidth="1" />
                  )}
                  <Plant x={cx} t={t} />
                  {lines.map((ln, li) => (
                    <text
                      key={li}
                      x={cx}
                      y={LABEL_Y + li * 15}
                      textAnchor="middle"
                      fill="var(--tl-label)"
                      fontSize="12"
                      fontWeight="700"
                      fontFamily="inherit"
                    >
                      {ln}
                    </text>
                  ))}
                  <text x={cx} y={H - 14} textAnchor="middle" fill="var(--tl-label-soft)" fontSize="10.5" fontWeight="600" fontFamily="inherit">
                    {stage.items.length === 0 ? "sem produto" : `${stage.items.length} produto${stage.items.length > 1 ? "s" : ""}`}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="tl-products" style={{ gridTemplateColumns: `repeat(${cols.length}, ${colW}px)` }}>
            {cols.map((stage, i) => (
              <div key={stage.id || stage.key || i} className="tl-col">
                {stage.items.length === 0 ? (
                  <span className="muted-soft" style={{ fontSize: 11 }}>—</span>
                ) : (
                  stage.items.map((item, j) => {
                    const p = PRODUCTS_BY_ID.get(item.productId);
                    const nome = p ? p.name : item.productId;
                    const dose = `${fmtNum(item.dose)} ${p ? doseUnit(p) : ""}/ha`;
                    return (
                      <span key={j} className="tl-chip" title={`${nome} — ${dose}`}>
                        <span className="tl-chip-name">{nome}</span>
                        <span className="tl-chip-dose tnum">{dose}</span>
                      </span>
                    );
                  })
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Só aparece quando a figura de fato não coube: aviso de rolagem que
          está sempre lá vira decoração e some da vista. */}
      {avail > 0 && width > avail + 1 && (
        <p className="muted-soft" style={{ fontSize: 11, margin: "6px 0 0", display: "flex", alignItems: "center", gap: 5 }}>
          <MoveHorizontal size={13} /> Arraste para ver os {cols.length} estágios.
        </p>
      )}

      <figcaption className="muted-soft" style={{ fontSize: 11.5, lineHeight: 1.5, marginTop: 8 }}>
        Esquema de leitura: a planta cresce conforme a <strong>posição do estágio na sequência</strong> do manejo, não
        conforme altura, massa ou estádio medido. Os produtos e as doses são os do manejo; o desenho é ilustração.
      </figcaption>
    </figure>
  );
}
