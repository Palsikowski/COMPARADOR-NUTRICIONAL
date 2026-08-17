import React from "react";
import { ArrowRightLeft, TrendingUp, AlertTriangle, HelpCircle } from "lucide-react";
import { kindOf, INTERACTION_SOURCE } from "../data/nutrientInteractions.js";
import { nutrientLabel } from "../lib/nutrientLabels.js";

const TONE = {
  ok: { fg: "var(--ok)", bg: "var(--ok-soft)", Icon: TrendingUp },
  warn: { fg: "var(--warn)", bg: "var(--warn-soft)", Icon: AlertTriangle },
  info: { fg: "var(--info)", bg: "var(--info-soft)", Icon: HelpCircle },
};

// Lista de interações entre nutrientes, no mesmo formato em qualquer tela.
//
// Cada linha diz o par, o tipo e o efeito descrito na referência. O tipo tem
// cor e ícone — nunca só cor —, porque "sinérgica" e "antagônica" mudam a
// decisão e não podem depender de o consultor distinguir verde de laranja.
export default function InteractionList({ items, showProducts = false, compact = false }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: compact ? 7 : 9 }}>
      {items.map((inter) => {
        const kind = kindOf(inter);
        const tone = TONE[kind.tone] || TONE.info;
        const { Icon } = tone;
        return (
          <div
            key={`${inter.a}-${inter.b}`}
            style={{
              display: "flex",
              gap: 10,
              padding: compact ? "9px 11px" : "11px 13px",
              borderRadius: "var(--radius-sm)",
              background: tone.bg,
              lineHeight: 1.5,
            }}
          >
            <Icon size={15} style={{ color: tone.fg, flexShrink: 0, marginTop: 2 }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", fontSize: 13.5, fontWeight: 600 }}>
                <span>
                  {nutrientLabel(inter.keys[0])} <ArrowRightLeft size={12} style={{ verticalAlign: -1, color: "var(--text-3)" }} />{" "}
                  {inter.b === "Al" ? "Alumínio" : nutrientLabel(inter.keys[1])}
                </span>
                <span className="chip" style={{ fontSize: 10.5, background: "transparent", color: tone.fg, borderColor: "transparent", padding: 0 }}>
                  {inter.tipo}
                </span>
              </div>
              <div className="muted" style={{ fontSize: 12.5, marginTop: 3 }}>
                {inter.efeito}
              </div>
              <div className="muted-soft" style={{ fontSize: 11.5, marginTop: 3 }}>
                Onde ocorre: {inter.onde}
                {showProducts && inter.from && inter.to && (
                  <>
                    {" · "}
                    <strong>{inter.from.name}</strong> × <strong>{inter.to.name}</strong>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Atribuição da referência. Aparece junto de toda lista — o material é de
// terceiro e é fisiologia geral, não avaliação da Agrocete sobre o produto.
export function InteractionSourceNote({ style }) {
  return (
    <p className="muted-soft" style={{ fontSize: 11.5, lineHeight: 1.5, margin: "9px 0 0", ...style }}>
      Referência de <strong>{INTERACTION_SOURCE.author}</strong>, {INTERACTION_SOURCE.date}. {INTERACTION_SOURCE.note}
    </p>
  );
}
