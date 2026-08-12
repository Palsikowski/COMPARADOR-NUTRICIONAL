import React, { useMemo } from "react";
import { Wand2, Plus, CheckCircle2, AlertTriangle } from "lucide-react";
import { suggestAgroceteProducts, uncoveredKeys } from "./suggestAgrocete.js";

function fmtNum(n) {
  return Number(n).toLocaleString("pt-BR", { maximumFractionDigits: 2 });
}

// Sugestão automática de manejo Agrocete equivalente: parte do total de
// nutrientes do manejo concorrente já montado (qualquer combinação de
// marcas) e propõe produtos Agrocete reais pra cobrir o que ainda falta.
// Ver suggestAgrocete.js pra a heurística — é uma aproximação, não uma
// recomendação agronômica fechada.
export default function SuggestionPanel({ totals, allNutrientKeys, allProducts, selected, productsById, nutrientMeta, onAdd, onAddAll }) {
  const { suggestions, remaining, deficit } = useMemo(
    () => suggestAgroceteProducts({ totals, allNutrientKeys, allProducts, selected }),
    [totals, allNutrientKeys, allProducts, selected]
  );

  if (totals.comp.count === 0) return null;

  // Com dose 0 o concorrente entrega 0 de tudo, e "não falta nada" seria lido
  // como "a Agrocete já cobre" — o que é falso quando não há nada dos dois
  // lados. Nesse caso o que falta é a dose, e é isso que precisa ser dito.
  const compDelivers = allNutrientKeys.some((k) => (totals.comp.nutrients[k] || 0) > 0);
  if (!compDelivers) {
    return (
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "flex-start",
          background: "color-mix(in srgb, var(--warn) 8%, transparent)",
          border: "1px solid color-mix(in srgb, var(--warn) 27%, transparent)",
          borderRadius: 10,
          padding: 12,
          marginBottom: 12,
          fontSize: 12,
        }}
      >
        <AlertTriangle size={14} color="var(--warn)" style={{ flexShrink: 0, marginTop: 1 }} />
        <span>
          O manejo concorrente está com dose zero, então ainda não entrega nutriente nenhum. Informe a dose de cada
          produto para o comparativo e a sugestão fazerem sentido.
        </span>
      </div>
    );
  }

  const hasDeficit = allNutrientKeys.some((k) => (totals.comp.nutrients[k] || 0) > (totals.agro.nutrients[k] || 0) + 0.001);

  if (!hasDeficit) {
    return (
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start", background: "color-mix(in srgb, var(--brand) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--brand) 27%, transparent)", borderRadius: 10, padding: 12, marginBottom: 12, fontSize: 12 }}>
        <CheckCircle2 size={14} color="var(--brand)" style={{ flexShrink: 0, marginTop: 1 }} />
        <span>Seu manejo Agrocete já cobre ou supera o concorrente selecionado em todos os nutrientes comparados.</span>
      </div>
    );
  }

  if (suggestions.length === 0) {
    const uncovered = uncoveredKeys(remaining, deficit).map((k) => nutrientMeta[k]?.label ?? k);
    return (
      <div className="muted-soft" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 12, marginBottom: 12, fontSize: 12 }}>
        Não encontramos produtos Agrocete no catálogo que cubram automaticamente{" "}
        {uncovered.length > 0 ? <>o(s) nutriente(s) <strong style={{ color: "var(--text-2)" }}>{uncovered.join(", ")}</strong> do manejo concorrente selecionado</> : "os nutrientes restantes"} — adicione manualmente pela busca ou pelos chips de nutriente.
      </div>
    );
  }

  const stillIncomplete = uncoveredKeys(remaining, deficit).map((k) => nutrientMeta[k]?.label ?? k);

  return (
    <div style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)", padding: 14, marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
        <Wand2 size={15} color="var(--brand)" />
        <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", margin: 0 }}>
          Sugestão de manejo Agrocete equivalente
        </h2>
      </div>
      <p className="muted-soft" style={{ fontSize: 11, marginBottom: 10, lineHeight: 1.4 }}>
        Aproximação automática pelos nutrientes que faltam cobrir em relação ao manejo concorrente selecionado — não é uma recomendação agronômica validada. Ajuste as doses e confirme com a equipe técnica antes de cotar.
        {stillIncomplete.length > 0 && (
          <>
            {" "}
            Mesmo adicionando tudo abaixo, a cobertura ainda fica incompleta para: <strong style={{ color: "var(--text-2)" }}>{stillIncomplete.join(", ")}</strong>.
          </>
        )}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {suggestions.map((s) => {
          const product = productsById.get(s.productId);
          if (!product) return null;
          return (
            <div
              key={s.productId}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "8px 10px",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{product.name}</div>
                <div className="muted-soft" style={{ fontSize: 10, marginTop: 1 }}>
                  cobre: {s.covers.map((k) => nutrientMeta[k]?.label ?? k).join(", ")}
                </div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--brand)", flexShrink: 0 }}>
                {fmtNum(s.dose)}
                {product.unit ? product.unit.split("/")[0] : ""}
              </span>
              <button
                onClick={() => onAdd(s)}
                className="tap-scale"
                style={{ background: "var(--brand)", border: "none", borderRadius: 7, width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-contrast)", cursor: "pointer", flexShrink: 0 }}
                aria-label={`Adicionar ${product.name}`}
              >
                <Plus size={14} />
              </button>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => onAddAll(suggestions)}
        className="tap-scale"
        style={{
          marginTop: 12,
          width: "100%",
          padding: "10px",
          borderRadius: 10,
          border: "none",
          background: "var(--brand)",
          color: "var(--brand-contrast)",
          fontWeight: 700,
          fontSize: 13,
          cursor: "pointer",
        }}
      >
        Adicionar todos ({suggestions.length})
      </button>
    </div>
  );
}
