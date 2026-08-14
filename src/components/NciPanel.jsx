import React, { useState } from "react";
import { X, HelpCircle, AlertTriangle } from "lucide-react";
import { CRITERIA, MISSING_CRITERIA } from "../lib/nci.js";
import { fmtNum } from "../lib/economics.js";

// NCI na tela. Regras de apresentação, deliberadas:
//  - nunca chama de "vencedor" nem de "melhor produto";
//  - o número é sempre rotulado como índice COMPARATIVO daquele par;
//  - quando falta dado, mostra o motivo em vez de um número frouxo;
//  - a metodologia fica a um clique, incluindo o que NÃO entra na conta.
export default function NciPanel({ nci, nameA, nameB }) {
  const [showMethod, setShowMethod] = useState(false);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>NCI · Nutrição &amp; Custo Index</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
            Índice <strong>comparativo entre estes dois produtos</strong> — não é nota de qualidade nem indicação de
            compra.
          </div>
        </div>
        <button className="btn btn-ghost" style={{ minHeight: 40, fontSize: 12.5 }} onClick={() => setShowMethod(true)}>
          <HelpCircle size={14} /> Como calculamos?
        </button>
      </div>

      {nci.insufficient ? (
        <div
          style={{
            marginTop: 10,
            padding: "12px 14px",
            borderRadius: "var(--radius-sm)",
            background: "var(--warn-soft)",
            border: "1px solid color-mix(in srgb, var(--warn) 20%, transparent)",
            display: "flex",
            gap: 10,
          }}
        >
          <AlertTriangle size={16} style={{ color: "var(--warn)", flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 12.5, lineHeight: 1.55 }}>
            <strong style={{ display: "block", marginBottom: 3 }}>Dados insuficientes para avaliação completa</strong>
            {nci.reasons.map((r, i) => (
              <div key={i} className="muted">
                · {r}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }} className="cmp-inputs">
            <ScoreCard name={nameA} score={nci.a.score} accent="var(--side-a)" />
            <ScoreCard name={nameB} score={nci.b.score} accent="var(--side-b)" />
          </div>

          {/* Mobile: um card por critério (a tabela tem 4 colunas). */}
          <div className="only-narrow" style={{ marginTop: 14 }}>
            {nci.a.parts.map((pa, i) => {
              const pb = nci.b.parts[i];
              return (
                <div
                  key={pa.id}
                  style={{
                    padding: "11px 12px",
                    background: "var(--surface-2)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border)",
                    opacity: pa.applied ? 1 : 0.6,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 7 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{pa.label}</span>
                    <span className="tnum muted" style={{ fontSize: 12, flexShrink: 0 }}>
                      {pa.applied ? `peso ${pa.weight}%` : "fora da conta"}
                    </span>
                  </div>
                  <MobileScore color="var(--side-a)" name={nameA} part={pa} />
                  <MobileScore color="var(--side-b)" name={nameB} part={pb} />
                </div>
              );
            })}
          </div>

          <div className="only-wide" style={{ marginTop: 14, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, minWidth: 460 }}>
              <thead>
                <tr>
                  <th className="muted" style={{ textAlign: "left", padding: "0 8px 8px", fontSize: 11.5, fontWeight: 600 }}>
                    Critério
                  </th>
                  <th className="muted" style={{ textAlign: "right", padding: "0 8px 8px", fontSize: 11.5, fontWeight: 600 }}>
                    Peso
                  </th>
                  <th className="muted" style={{ textAlign: "right", padding: "0 8px 8px", fontSize: 11.5, fontWeight: 600 }}>
                    {nameA}
                  </th>
                  <th className="muted" style={{ textAlign: "right", padding: "0 8px 8px", fontSize: 11.5, fontWeight: 600 }}>
                    {nameB}
                  </th>
                </tr>
              </thead>
              <tbody>
                {nci.a.parts.map((pa, i) => {
                  const pb = nci.b.parts[i];
                  return (
                    <tr key={pa.id} style={{ borderTop: "1px solid var(--border)", opacity: pa.applied ? 1 : 0.55 }}>
                      <td style={{ padding: "9px 8px" }}>
                        {pa.label}
                        {!pa.applied && (
                          <span className="muted-soft" style={{ fontSize: 11 }}>
                            {" "}
                            — sem dado nos dois, fora da conta
                          </span>
                        )}
                      </td>
                      <td className="tnum muted" style={{ padding: "9px 8px", textAlign: "right" }}>
                        {pa.applied ? `${pa.weight}%` : "—"}
                      </td>
                      <ScoreCell part={pa} />
                      <ScoreCell part={pb} />
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {nci.usedWeight < 100 && (
            <div className="muted-soft" style={{ fontSize: 11.5, marginTop: 8, lineHeight: 1.5 }}>
              Só {nci.usedWeight}% dos pesos puderam ser aplicados neste par; os critérios sem dado foram excluídos e os
              pesos restantes, renormalizados.
            </div>
          )}
        </>
      )}

      {showMethod && <MethodModal onClose={() => setShowMethod(false)} />}
    </div>
  );
}

function MobileScore({ color, name, part }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, fontSize: 12.5, padding: "3px 0" }}>
      <span className="muted" style={{ display: "inline-flex", alignItems: "center", gap: 6, minWidth: 0 }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: color, flexShrink: 0 }} />
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
      </span>
      <span className="tnum" style={{ flexShrink: 0, textAlign: "right" }}>
        {part.applied ? (
          <>
            <strong>{fmtNum(part.normalized, 0)}</strong>
            {part.raw != null && <span className="muted-soft"> · {fmtNum(part.raw)}</span>}
          </>
        ) : (
          <span className="muted-soft">—</span>
        )}
      </span>
    </div>
  );
}

function ScoreCard({ name, score, accent }) {
  return (
    <div style={{ padding: 14, borderRadius: "var(--radius-sm)", background: "var(--surface-2)", border: "1px solid var(--border)" }}>
      <div className="muted" style={{ fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {name}
      </div>
      <div className="tnum" style={{ fontSize: 30, fontWeight: 700, color: accent, lineHeight: 1.1, marginTop: 3 }}>
        {fmtNum(score, 1)}
        <span style={{ fontSize: 13, color: "var(--text-3)", fontWeight: 600 }}> / 100</span>
      </div>
      <div style={{ height: 6, background: "var(--surface-3)", borderRadius: 3, marginTop: 8, overflow: "hidden" }}>
        <div style={{ width: `${Math.min(score, 100)}%`, height: "100%", background: accent, transition: "width var(--speed) ease" }} />
      </div>
    </div>
  );
}

function ScoreCell({ part }) {
  if (!part.applied) {
    return (
      <td className="tnum muted-soft" style={{ padding: "9px 8px", textAlign: "right" }}>
        —
      </td>
    );
  }
  return (
    <td className="tnum" style={{ padding: "9px 8px", textAlign: "right" }}>
      <div style={{ fontWeight: 600 }}>{fmtNum(part.normalized, 0)}</div>
      {part.raw != null && (
        <div className="muted-soft" style={{ fontSize: 11 }}>
          {fmtNum(part.raw)}
        </div>
      )}
    </td>
  );
}

function MethodModal({ onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(17,24,39,0.55)",
        zIndex: 80,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card"
        role="dialog"
        aria-label="Como calculamos o NCI"
        style={{ maxWidth: 620, width: "100%", maxHeight: "86vh", overflowY: "auto", padding: 20, boxShadow: "var(--shadow-lg)" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Como calculamos o NCI</h3>
          <button className="btn btn-ghost" style={{ width: 44, height: 44, minHeight: 44, padding: 0 }} onClick={onClose} aria-label="Fechar">
            <X size={17} />
          </button>
        </div>

        <p className="muted" style={{ fontSize: 13, lineHeight: 1.6, marginTop: 12 }}>
          O NCI é um <strong>índice comparativo do par selecionado</strong>. Cada critério é normalizado contra o outro
          produto: o melhor do par recebe 100 e o outro recebe a proporção. Por isso o mesmo produto pode ter NCI
          diferente conforme com quem está sendo comparado — <strong>fora de um par, o número não significa nada</strong>.
        </p>

        <h4 style={{ fontSize: 13.5, fontWeight: 700, margin: "16px 0 8px" }}>Critérios e pesos</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {CRITERIA.map((c) => (
            <div key={c.id} style={{ padding: "10px 12px", background: "var(--surface-2)", borderRadius: "var(--radius-sm)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 13, fontWeight: 600 }}>
                <span>{c.label}</span>
                <span className="tnum" style={{ color: "var(--brand)" }}>
                  {c.weight}%
                </span>
              </div>
              <div className="muted" style={{ fontSize: 12, marginTop: 3, lineHeight: 1.5 }}>
                {c.help} {c.lowerIsBetter ? "Menor é melhor." : "Maior é melhor."}
              </div>
            </div>
          ))}
        </div>

        <h4 style={{ fontSize: 13.5, fontWeight: 700, margin: "18px 0 8px" }}>O que NÃO entra na conta</h4>
        <p className="muted" style={{ fontSize: 12.5, lineHeight: 1.6, margin: "0 0 8px" }}>
          Estes critérios fazem parte de uma avaliação completa, mas <strong>não existem na base de dados</strong>. Em
          vez de estimá-los, eles ficam de fora e isso é declarado aqui:
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {MISSING_CRITERIA.map((c) => (
            <div
              key={c.label}
              style={{ padding: "10px 12px", background: "var(--warn-soft)", borderRadius: "var(--radius-sm)", border: "1px solid color-mix(in srgb, var(--warn) 20%, transparent)" }}
            >
              <div style={{ fontSize: 13, fontWeight: 600 }}>{c.label}</div>
              <div className="muted" style={{ fontSize: 12, marginTop: 3, lineHeight: 1.5 }}>
                {c.reason}
              </div>
            </div>
          ))}
        </div>

        <h4 style={{ fontSize: 13.5, fontWeight: 700, margin: "18px 0 8px" }}>Limites de uso</h4>
        <ul className="muted" style={{ fontSize: 12.5, lineHeight: 1.65, paddingLeft: 18, margin: 0 }}>
          <li>Não é recomendação agronômica nem indicação de compra.</li>
          <li>Depende de dose e preço informados por você — dados que não estão no catálogo.</li>
          <li>Produtos com objetivos diferentes (um especialista em zinco vs. um NPK completo) podem ter índices muito distantes sem que isso signifique que um é pior: eles resolvem problemas diferentes.</li>
          <li>Sem composição, dose ou preço dos dois lados, o índice não é calculado.</li>
        </ul>

        <button className="btn btn-primary" style={{ width: "100%", marginTop: 18 }} onClick={onClose}>
          Entendi
        </button>
      </div>
    </div>
  );
}
