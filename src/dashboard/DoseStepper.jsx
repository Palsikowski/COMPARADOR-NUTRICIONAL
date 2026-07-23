import React, { useRef } from "react";
import { Minus, Plus } from "lucide-react";

const stepBtnStyle = {
  width: 28,
  height: 28,
  borderRadius: 7,
  border: "1px solid #24313D",
  background: "#17212B",
  color: "#E8EDF1",
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
          <Minus size={13} />
        </button>
        <input
          type="number"
          step="0.01"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: 62,
            textAlign: "center",
            padding: "6px 4px",
            borderRadius: 6,
            border: "1px solid #24313D",
            background: "#17212B",
            color: "#E8EDF1",
            fontSize: 12,
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
          <Plus size={13} />
        </button>
        <span style={{ fontSize: 9, color: "#5C6B78" }}>passo {fineStep ? "0,1" : "1,0"}</span>
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
