import React, { useRef } from "react";
import { Minus, Plus } from "lucide-react";

// 48x48 = alvo de toque mínimo recomendado pra uso no celular em campo
// (dedo grosso, luva, tela suja) — o stepper é o controle mais usado do app.
const stepBtnStyle = {
  width: 48,
  height: 48,
  borderRadius: 10,
  border: "1px solid var(--border-strong)",
  background: "var(--surface)",
  color: "var(--text)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  flexShrink: 0,
};

// Stepper +/- com aceleração em long-press, duplo toque alterna passo
// fino (0,1) / grosso (1,0), e slider horizontal sincronizado com o valor.
export default function DoseStepper({ value, onChange, fineStep, onToggleFineStep, max }) {
  const step = fineStep ? 0.1 : 1;
  const timerRef = useRef(null);
  const speedRef = useRef(320);
  const lastTapRef = useRef(0);

  function clamp(v) {
    return Math.max(0, Math.round(v * 100) / 100);
  }

  function bump(dir) {
    onChange(String(clamp((parseFloat(value) || 0) + dir * step)));
  }

  function startHold(dir) {
    bump(dir);
    speedRef.current = 320;
    const tick = () => {
      bump(dir);
      speedRef.current = Math.max(55, speedRef.current - 35);
      timerRef.current = setTimeout(tick, speedRef.current);
    };
    timerRef.current = setTimeout(tick, speedRef.current);
  }

  function stopHold() {
    clearTimeout(timerRef.current);
  }

  function handleTap() {
    const now = Date.now();
    if (now - lastTapRef.current < 320) onToggleFineStep();
    lastTapRef.current = now;
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <button
          type="button"
          className="tap-scale"
          onMouseDown={() => startHold(-1)}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          onTouchStart={() => startHold(-1)}
          onTouchEnd={stopHold}
          onClick={handleTap}
          style={stepBtnStyle}
          aria-label="Diminuir dose"
        >
          <Minus size={18} />
        </button>
        <input
          type="number"
          step="0.01"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Dose"
          style={{
            flex: 1,
            minWidth: 0,
            height: 48,
            textAlign: "center",
            padding: "6px 4px",
            borderRadius: 10,
            border: "1px solid var(--border-strong)",
            background: "var(--surface)",
            color: "var(--text)",
            fontSize: 20,
            fontWeight: 700,
            boxSizing: "border-box",
            fontFamily: "inherit",
          }}
        />
        <button
          type="button"
          className="tap-scale"
          onMouseDown={() => startHold(1)}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          onTouchStart={() => startHold(1)}
          onTouchEnd={stopHold}
          onClick={handleTap}
          style={stepBtnStyle}
          aria-label="Aumentar dose"
        >
          <Plus size={18} />
        </button>
      </div>
      <div style={{ fontSize: 10, color: "var(--text-3)", marginTop: 5, textAlign: "center" }}>
        passo {fineStep ? "0,1" : "1,0"} — toque duas vezes no + ou − pra alternar
      </div>
      <input
        type="range"
        min={0}
        max={max}
        step={step}
        value={Math.min(parseFloat(value) || 0, max)}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", marginTop: 7 }}
      />
    </div>
  );
}
