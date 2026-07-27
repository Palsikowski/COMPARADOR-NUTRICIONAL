import React, { useState } from "react";
import { Sprout, ChevronDown, ChevronUp } from "lucide-react";
import { MANAGEMENT_PRESETS, PRESET_SOURCE_NOTE, buildPresetSelection } from "../data/managementPresets.js";

const CROPS = Object.keys(MANAGEMENT_PRESETS);

// Manejos prontos por cultura (Soja/Milho/Algodão) x nível de investimento
// (Básico/Médio/Completo), baseados no material oficial "Manejo Atualizado
// 2024" da Agrocete — ver managementPresets.js pra fonte e ressalvas.
export default function ManagementPresetsPanel({ onLoad }) {
  const [open, setOpen] = useState(false);
  const [crop, setCrop] = useState(CROPS[0]);

  return (
    <div style={{ background: "#17212B", borderRadius: 12, border: "1px solid #24313D", overflow: "hidden", marginBottom: 16 }}>
      <button
        onClick={() => setOpen(!open)}
        className="tap-scale"
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 14px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          color: "#E8EDF1",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Sprout size={15} color="#1FBF8F" />
          <span style={{ fontWeight: 600, fontSize: 13 }}>Manejos prontos</span>
        </div>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      <div className={`accordion-body${open ? " open" : ""}`}>
        <div style={{ padding: "0 14px 14px" }}>
          <p className="muted-soft" style={{ fontSize: 10, marginBottom: 10, lineHeight: 1.4 }}>{PRESET_SOURCE_NOTE}</p>

          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            {CROPS.map((c) => (
              <button
                key={c}
                onClick={() => setCrop(c)}
                className="tap-scale"
                style={{
                  flex: 1,
                  padding: "7px 6px",
                  borderRadius: 8,
                  border: `1px solid ${crop === c ? "#1FBF8F" : "#24313D"}`,
                  background: crop === c ? "#1FBF8F1A" : "#0F1720",
                  color: crop === c ? "#1FBF8F" : "#9AACB8",
                  fontSize: 12,
                  fontWeight: crop === c ? 700 : 500,
                  cursor: "pointer",
                }}
              >
                {c}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {MANAGEMENT_PRESETS[crop].tiers.map((t) => (
              <button
                key={t.level}
                onClick={() => {
                  const { selection, notes } = buildPresetSelection(crop, t.level);
                  onLoad(selection, notes, `${crop} — ${t.level}`);
                }}
                className="tap-scale"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "9px 12px",
                  borderRadius: 8,
                  border: "1px solid #24313D",
                  background: "#0F1720",
                  color: "#E8EDF1",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <span>{t.level}</span>
                <span className="muted-soft" style={{ fontSize: 10, fontWeight: 400 }}>
                  {t.stageKeys.length} estágio{t.stageKeys.length > 1 ? "s" : ""}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
