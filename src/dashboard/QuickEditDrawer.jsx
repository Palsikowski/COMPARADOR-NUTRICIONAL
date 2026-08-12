import React from "react";
import { X, Lock, LockOpen } from "lucide-react";
import DoseStepper from "./DoseStepper.jsx";

// Âmbar (não verde) pro estado travado: verde já é a cor da Agrocete no app
// inteiro, então usar verde aqui confundiria "travado" com "produto nosso".
const LOCK_COLOR = "#F5A524";

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
          <button
            onClick={onClose}
            className="tap-scale"
            aria-label="Fechar"
            style={{ background: "#17212B", border: "1px solid #24313D", borderRadius: 10, width: 48, height: 48, color: "#E8EDF1", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="muted" style={{ fontSize: 11, marginBottom: 6 }}>Dose ({product.unit || "un"})</div>
        <div style={{ opacity: locked ? 0.55 : 1, pointerEvents: locked ? "none" : "auto" }}>
          <DoseStepper value={doseValue} onChange={(v) => onUpdate("dose", v)} fineStep={fineStep} onToggleFineStep={onToggleFineStep} max={sliderMax} />
        </div>

        {/* TRAVA — botão largo e de alto contraste: travado fica âmbar sólido,
            pra não ter dúvida de que o valor foi fixado naquele aparelho. */}
        <button
          onClick={() => onToggleLock(doseValue)}
          className="tap-scale"
          title={locked ? "Destravar dose (voltar a editar)" : "Travar esta dose como padrão do produto neste aparelho"}
          style={{
            marginTop: 12,
            width: "100%",
            minHeight: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            background: locked ? LOCK_COLOR : "#17212B",
            border: `1.5px solid ${locked ? LOCK_COLOR : "#2E3D4B"}`,
            borderRadius: 10,
            padding: "12px 14px",
            color: locked ? "#0B1319" : "#C7D2D9",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {locked ? <Lock size={16} /> : <LockOpen size={16} />}
          {locked ? "Dose travada — toque pra destravar" : "Travar dose como padrão"}
        </button>
        <p className="muted-soft" style={{ fontSize: 10.5, margin: "7px 0 0", lineHeight: 1.45 }}>
          {locked
            ? `Salvo neste aparelho: toda vez que ${product.name} entrar no manejo já vem com ${doseValue} ${product.unit || ""}.`
            : "Fixa essa dose como padrão do produto neste aparelho — útil pros produtos que vêm sem dose de referência."}
        </p>

        <label className="muted" style={{ display: "block", fontSize: 11, marginTop: 16 }}>
          Preço (R$/{unitBase})
          <input
            type="number"
            step="0.01"
            value={priceValue}
            onChange={(e) => onUpdate("price", e.target.value)}
            style={{
              width: "100%",
              marginTop: 5,
              minHeight: 48,
              padding: "12px",
              borderRadius: 10,
              border: "1px solid #24313D",
              background: "#17212B",
              color: "#E8EDF1",
              fontSize: 15,
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
            minHeight: 48,
            padding: "14px",
            borderRadius: 10,
            border: "none",
            background: color,
            color: "#0B1319",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Concluído
        </button>
      </div>
    </div>
  );
}
