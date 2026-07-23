import React, { useState } from "react";
import { Bookmark, ChevronDown, ChevronUp, Save, Pencil, Trash2, FolderOpen, Check, X } from "lucide-react";

export default function TemplatesPanel({ templates, selectedCount, onSave, onLoad, onDelete, onRename }) {
  const [open, setOpen] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  function handleSave() {
    if (!nameInput.trim()) return;
    onSave(nameInput.trim());
    setNameInput("");
  }

  function startRename(t) {
    setRenamingId(t.id);
    setRenameValue(t.name);
  }

  function confirmRename() {
    if (renameValue.trim()) onRename(renamingId, renameValue.trim());
    setRenamingId(null);
  }

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
          <Bookmark size={15} color="#1FBF8F" />
          <span style={{ fontWeight: 600, fontSize: 13 }}>Manejos salvos</span>
          {templates.length > 0 && (
            <span style={{ fontSize: 11, background: "#233241", padding: "2px 7px", borderRadius: 999, fontWeight: 600 }}>{templates.length}</span>
          )}
        </div>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      <div className={`accordion-body${open ? " open" : ""}`}>
        <div>
          <div style={{ padding: "0 14px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Nome do manejo (ex: Soja V4 - vs Stoller)"
                style={{
                  flex: 1,
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "1px solid #24313D",
                  background: "#0F1720",
                  color: "#E8EDF1",
                  fontSize: 12,
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
              />
              <button
                onClick={handleSave}
                disabled={selectedCount === 0}
                className="tap-scale"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "none",
                  background: selectedCount === 0 ? "#233241" : "#1FBF8F",
                  color: selectedCount === 0 ? "#5C6B78" : "#0B1319",
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: selectedCount === 0 ? "default" : "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                <Save size={13} /> Salvar atual
              </button>
            </div>

            {templates.length === 0 && <p style={{ fontSize: 11, color: "#5C6B78", margin: 0 }}>Nenhum manejo salvo ainda.</p>}

            {templates.map((t) => (
              <div
                key={t.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#0F1720",
                  border: "1px solid #24313D",
                  borderRadius: 8,
                  padding: "8px 10px",
                }}
              >
                {renamingId === t.id ? (
                  <>
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && confirmRename()}
                      style={{
                        flex: 1,
                        padding: "5px 8px",
                        borderRadius: 6,
                        border: "1px solid #1FBF8F",
                        background: "#17212B",
                        color: "#E8EDF1",
                        fontSize: 12,
                        boxSizing: "border-box",
                        fontFamily: "inherit",
                      }}
                    />
                    <button onClick={confirmRename} className="tap-scale" style={iconBtnStyle} aria-label="Confirmar">
                      <Check size={14} color="#1FBF8F" />
                    </button>
                    <button onClick={() => setRenamingId(null)} className="tap-scale" style={iconBtnStyle} aria-label="Cancelar">
                      <X size={14} color="#8CA0AF" />
                    </button>
                  </>
                ) : (
                  <>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</div>
                      <div style={{ fontSize: 10, color: "#5C6B78" }}>{Object.keys(t.selected).length} produto(s)</div>
                    </div>
                    <button onClick={() => onLoad(t)} className="tap-scale" style={iconBtnStyle} aria-label={`Carregar ${t.name}`} title="Carregar">
                      <FolderOpen size={14} color="#1FBF8F" />
                    </button>
                    <button onClick={() => startRename(t)} className="tap-scale" style={iconBtnStyle} aria-label={`Renomear ${t.name}`} title="Renomear">
                      <Pencil size={14} color="#8CA0AF" />
                    </button>
                    <button onClick={() => onDelete(t.id)} className="tap-scale" style={iconBtnStyle} aria-label={`Excluir ${t.name}`} title="Excluir">
                      <Trash2 size={14} color="#F87171" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const iconBtnStyle = {
  background: "transparent",
  border: "1px solid #24313D",
  borderRadius: 6,
  width: 28,
  height: 28,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  flexShrink: 0,
};
