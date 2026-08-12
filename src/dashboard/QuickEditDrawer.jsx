import React from "react";
import { X, Lock, LockOpen } from "lucide-react";
import DoseStepper from "./DoseStepper.jsx";

// Drawer/modal leve para ajustar dose e preço de um produto sem poluir a
// lista de cards — abre por cima do conteúdo, fecha ao tocar fora ou no X.
// O cadeado trava a dose atual como padrão desse produto (persistido no
// aparelho) — próxima vez que for selecionado, já começa com essa dose,
// mesmo produtos sem dose de referência cadastrada.
export default function QuickEditDrawer({ product, color, doseValue, priceValue, onUpdate, onClose, fineStep, onToggleFineStep, locked, onToggleLock }) {
  if (!product) return null;
  const sliderMax = Math.max((product.defaultDose || 1) * 4, 5);
  const unitBase = (product.unit || "un").split("/")[0];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(5,10,14,0.6)",
        zIndex: 60,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 460,
          background: "#101A22",
          border: `1px solid ${color}55`,
          borderBottom: "none",
          borderRadius: "16px 16px 0 0",
          padding: "16px 18px 22px",
          boxShadow: "0 -8px 30px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{product.name}</div>
            <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{product.category || product.brand}</div>
          </div>
          <button onClick={onClose} className="tap-scale" aria-label="Fechar" style={{ background: "#17212B", border: "1px solid #24313D", borderRadius: 8, width: 30, height: 30, color: "#E8EDF1", cursor: "pointer", flexShrink: 0 }}>
            <X size={15} />
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
          <div className="muted" style={{ fontSize: 11 }}>Dose ({product.unit || "un"})</div>
          <button
            onClick={() => onToggleLock(doseValue)}
            className="tap-scale"
            title={locked ? "Destravar dose (voltar a editar)" : "Travar esta dose como padrão do produto"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              background: locked ? `${color}22` : "#17212B",
              border: `1px solid ${locked ? color : "#24313D"}`,
              borderRadius: 999,
              padding: "3px 9px",
              color: locked ? color : "#8CA0AF",
              fontSize: 10,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {locked ? <Lock size={12} /> : <LockOpen size={12} />}
            {locked ? "Travada" : "Travar"}
          </button>
        </div>
        {locked && (
          <p className="muted-soft" style={{ fontSize: 10, margin: "0 0 8px" }}>
            Essa dose vira o padrão desse produto neste aparelho — destrave pra ajustar.
          </p>
        )}
        <div style={{ opacity: locked ? 0.5 : 1, pointerEvents: locked ? "none" : "auto" }}>
          <DoseStepper value={doseValue} onChange={(v) => onUpdate("dose", v)} fineStep={fineStep} onToggleFineStep={onToggleFineStep} max={sliderMax} />
        </div>

        <label className="muted" style={{ display: "block", fontSize: 11, marginTop: 16 }}>
          Preço (R$/{unitBase})
          <input
            type="number"
            step="0.01"
            value={priceValue}
            onChange={(e) => onUpdate("price", e.target.value)}
            style={{
              width: "100%",
              marginTop: 4,
              padding: "9px 10px",
              borderRadius: 8,
              border: "1px solid #24313D",
              background: "#17212B",
              color: "#E8EDF1",
              fontSize: 13,
              boxSizing: "border-box",
              fontFamily: "inherit",
            }}
          />
        </label>

        <button
          onClick={onClose}
          className="tap-scale"
          style={{
            marginTop: 18,
            width: "100%",
            padding: "11px",
            borderRadius: 10,
            border: "none",
            background: color,
            color: "#0B1319",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Concluído
        </button>
      </div>
    </div>
  );
}
