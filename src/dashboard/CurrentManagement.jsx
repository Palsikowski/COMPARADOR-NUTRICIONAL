import React, { useRef, useState } from "react";
import { X, Trash2, ListChecks } from "lucide-react";

// Linha com gesto de arrastar para a esquerda (toque) para remover — sem
// biblioteca de gestos, só touch events nativos com um limiar de distância.
function SwipeRow({ children, onRemove }) {
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);

  function onTouchStart(e) {
    startX.current = e.touches[0].clientX;
    setDragging(true);
  }
  function onTouchMove(e) {
    const delta = e.touches[0].clientX - startX.current;
    if (delta < 0) setDx(delta);
  }
  function onTouchEnd() {
    setDragging(false);
    if (dx < -72) onRemove();
    setDx(0);
  }

  return (
    <div style={{ position: "relative", overflow: "hidden", borderRadius: 10 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "#F87171",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          padding: "0 16px",
        }}
      >
        <Trash2 size={16} color="#0B1319" />
      </div>
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          transform: `translateX(${dx}px)`,
          transition: dragging ? "none" : "transform 0.2s ease",
          position: "relative",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// Lista compacta do manejo em montagem — sempre visível, com remoção por
// swipe (mobile) ou clique no X (desktop), e edição de dose/preço por toque
// no item (abre o QuickEditDrawer no componente pai).
export default function CurrentManagement({ selected, productsById, brandColor, onToggle, onEdit }) {
  const ids = Object.keys(selected);
  if (ids.length === 0) return null;

  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
        <ListChecks size={15} color="#1FBF8F" />
        <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", margin: 0 }}>
          Manejo atual ({ids.length})
        </h2>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {ids.map((id) => {
          const p = productsById.get(id);
          if (!p) return null;
          const color = brandColor(p.brand);
          const sel = selected[id];
          return (
            <SwipeRow key={id} onRemove={() => onToggle(p)}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#17212B",
                  border: "1px solid #24313D",
                  borderRadius: 10,
                  padding: "8px 10px",
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
                <button
                  onClick={() => onEdit && onEdit(p)}
                  className="tap-scale"
                  style={{
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "transparent",
                    border: "none",
                    padding: 0,
                    cursor: onEdit ? "pointer" : "default",
                    textAlign: "left",
                    color: "#E8EDF1",
                  }}
                  title={onEdit ? "Editar dose e preço" : undefined}
                >
                  <span style={{ flex: 1, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</span>
                  {sel.dose != null && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        background: `${color}22`,
                        color,
                        padding: "2px 7px",
                        borderRadius: 999,
                        flexShrink: 0,
                      }}
                    >
                      {sel.dose}
                      {p.unit ? p.unit.split("/")[0] : ""}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => onToggle(p)}
                  className="tap-scale muted"
                  style={{ background: "transparent", border: "none", cursor: "pointer", padding: 3, flexShrink: 0 }}
                  aria-label={`Remover ${p.name}`}
                >
                  <X size={14} />
                </button>
              </div>
            </SwipeRow>
          );
        })}
      </div>
      <p className="muted-soft" style={{ fontSize: 10, marginTop: 5 }}>Toque no item para editar dose/preço · arraste para a esquerda ou toque no X para remover.</p>
    </div>
  );
}
