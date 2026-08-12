import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, Lock, Unlock, Download, Upload, ClipboardList, ChevronDown } from "lucide-react";

function fmtNum(n) {
  return Number(n).toLocaleString("pt-BR", { maximumFractionDigits: 2 });
}

// Uma dose é considerada "cadastrada" quando travada no painel (mesmo que o
// catálogo original não tivesse nenhuma) ou quando o produto já veio com
// defaultDose da planilha de origem.
export function hasRegisteredDose(product, doseRegistry) {
  const reg = doseRegistry[product.id];
  if (reg && reg.locked) return true;
  return product.defaultDose != null;
}

// Dose "em vigor" pra um produto: a travada no painel tem prioridade sobre a
// da planilha original — usada como valor inicial ao selecionar o produto
// pra comparação.
export function effectiveDose(product, doseRegistry) {
  const reg = doseRegistry[product.id];
  if (reg && reg.locked) {
    const n = parseFloat(reg.dose);
    if (!isNaN(n)) return n;
  }
  return product.defaultDose ?? 0;
}

function parseDose(v) {
  const n = parseFloat(String(v).replace(",", "."));
  return isNaN(n) ? null : n;
}

// Painel dedicado pra cadastrar e travar a dose de cada produto — a planilha
// "Produtos Nutricionais" trouxe ~970 produtos sem nenhuma dose informada
// (só %m/m e densidade), então esse é o lugar pra ir preenchendo aos poucos:
// filtra os que ainda faltam, digita a dose, trava, e já vê a concentração
// de cada nutriente calculada (dose × concentração por unidade) sem precisar
// abrir o comparativo. Persistido em localStorage (mesmo padrão do resto do
// app) — export/import em JSON pra levar entre dispositivos ou consolidar
// depois no catálogo de verdade.
export default function DoseRegistryPanel({ allProducts, doseRegistry, onChangeDose, onToggleLock, onImportRegistry, nutrientMeta, brandColor }) {
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [onlyMissing, setOnlyMissing] = useState(true);
  const [onlyWithNutrients, setOnlyWithNutrients] = useState(true);
  const [visibleCount, setVisibleCount] = useState(50);
  const fileInputRef = useRef(null);

  const brands = useMemo(() => Array.from(new Set(allProducts.map((p) => p.brand))).sort((a, b) => a.localeCompare(b, "pt-BR")), [allProducts]);

  const { doneCount, totalCount, pendingWithNutrients } = useMemo(() => {
    let done = 0;
    let pending = 0;
    allProducts.forEach((p) => {
      if (hasRegisteredDose(p, doseRegistry)) done += 1;
      else if (p.hasNutrients) pending += 1;
    });
    return { doneCount: done, totalCount: allProducts.length, pendingWithNutrients: pending };
  }, [allProducts, doseRegistry]);

  const searchNorm = search.trim().toLowerCase();
  const filtered = useMemo(() => {
    return allProducts.filter((p) => {
      if (onlyMissing && hasRegisteredDose(p, doseRegistry)) return false;
      if (onlyWithNutrients && !p.hasNutrients) return false;
      if (brandFilter && p.brand !== brandFilter) return false;
      if (searchNorm && !p.name.toLowerCase().includes(searchNorm) && !p.brand.toLowerCase().includes(searchNorm)) return false;
      return true;
    });
  }, [allProducts, doseRegistry, onlyMissing, onlyWithNutrients, brandFilter, searchNorm]);

  useEffect(() => {
    setVisibleCount(50);
  }, [searchNorm, brandFilter, onlyMissing, onlyWithNutrients]);

  function exportJSON() {
    const blob = new Blob([JSON.stringify(doseRegistry, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `doses-travadas-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (data && typeof data === "object") onImportRegistry(data);
      } catch {
        // JSON inválido — ignora silenciosamente, não derruba o painel
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  const visible = filtered.slice(0, visibleCount);
  const progressPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <section>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
        <ClipboardList size={16} color="#1FBF8F" />
        <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", margin: 0 }}>Cadastro de doses</h2>
      </div>

      <div style={{ background: "#17212B", borderRadius: 12, border: "1px solid #24313D", padding: 14, marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
          <span>
            <strong style={{ color: "#1FBF8F" }}>{doneCount}</strong> de {totalCount} produtos com dose cadastrada
          </span>
          <span className="muted">{progressPct}%</span>
        </div>
        <div style={{ height: 8, borderRadius: 999, background: "#0F1720", overflow: "hidden" }}>
          <div style={{ width: `${progressPct}%`, height: "100%", background: "#1FBF8F", transition: "width 0.3s" }} />
        </div>
        {pendingWithNutrients > 0 && (
          <p className="muted-soft" style={{ fontSize: 11, marginTop: 8, marginBottom: 0 }}>
            {pendingWithNutrients} produto{pendingWithNutrients > 1 ? "s" : ""} com garantia de nutrientes cadastrada ainda esperando uma dose pra virar concentração por hectare.
          </p>
        )}

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button onClick={exportJSON} className="tap-scale" style={smallBtnStyle}>
            <Download size={13} /> Exportar doses (JSON)
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="tap-scale" style={smallBtnStyle}>
            <Upload size={13} /> Importar
          </button>
          <input ref={fileInputRef} type="file" accept="application/json" onChange={handleImportFile} style={{ display: "none" }} />
        </div>
      </div>

      <div style={{ position: "relative", marginBottom: 10 }}>
        <Search size={15} color="#8CA0AF" style={{ position: "absolute", left: 12, top: 11 }} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar produto ou marca..."
          style={{
            width: "100%",
            padding: "10px 12px 10px 34px",
            borderRadius: 10,
            border: "1px solid #24313D",
            background: "#17212B",
            color: "#E8EDF1",
            fontSize: 13,
            boxSizing: "border-box",
            fontFamily: "inherit",
          }}
        />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        <div style={{ position: "relative" }}>
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            style={{
              appearance: "none",
              padding: "7px 28px 7px 10px",
              borderRadius: 8,
              border: "1px solid #24313D",
              background: "#17212B",
              color: "#E8EDF1",
              fontSize: 12,
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            <option value="">Todas as marcas</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <ChevronDown size={13} color="#8CA0AF" style={{ position: "absolute", right: 9, top: 10, pointerEvents: "none" }} />
        </div>
        <ToggleChip label="Só sem dose" active={onlyMissing} onClick={() => setOnlyMissing((v) => !v)} />
        <ToggleChip label="Só com nutrientes" active={onlyWithNutrients} onClick={() => setOnlyWithNutrients((v) => !v)} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {visible.length === 0 && (
          <p className="muted-soft" style={{ fontSize: 12, textAlign: "center", padding: "20px 10px" }}>
            Nenhum produto encontrado com esses filtros.
          </p>
        )}
        {visible.map((p) => (
          <DoseRow
            key={p.id}
            product={p}
            reg={doseRegistry[p.id]}
            onChangeDose={onChangeDose}
            onToggleLock={onToggleLock}
            nutrientMeta={nutrientMeta}
            color={brandColor(p.brand)}
          />
        ))}
      </div>

      {filtered.length > visibleCount && (
        <button onClick={() => setVisibleCount((v) => v + 50)} className="tap-scale" style={{ ...smallBtnStyle, width: "100%", justifyContent: "center", marginTop: 10 }}>
          Carregar mais ({filtered.length - visibleCount} restantes)
        </button>
      )}
    </section>
  );
}

function ToggleChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="tap-scale"
      style={{
        padding: "7px 12px",
        borderRadius: 999,
        border: `1px solid ${active ? "#1FBF8F" : "#24313D"}`,
        background: active ? "#1FBF8F22" : "#17212B",
        color: active ? "#1FBF8F" : "#9AACB8",
        fontSize: 12,
        fontWeight: active ? 700 : 500,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

function DoseRow({ product, reg, onChangeDose, onToggleLock, nutrientMeta, color }) {
  const locked = !!reg?.locked;
  const doseValue = reg?.dose ?? (product.defaultDose != null ? String(product.defaultDose) : "");
  const unit = reg?.unit ?? product.unit ?? "L/ha";
  const doseNum = parseDose(doseValue);
  const canLock = doseNum != null && doseNum > 0;

  const preview =
    product.hasNutrients && doseNum != null && doseNum > 0
      ? Object.entries(product.nutrients).map(([key, gPerUnit]) => ({ key, val: gPerUnit * doseNum }))
      : [];

  return (
    <div
      style={{
        border: `1.5px solid ${locked ? "#1FBF8F" : "#24313D"}`,
        borderRadius: 10,
        padding: "10px 12px",
        background: locked ? "#1FBF8F0D" : "#0F1720",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 160 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
            {product.name}
          </div>
          <div className="muted-soft" style={{ fontSize: 11, marginTop: 2 }}>
            {product.brand} {product.category ? `· ${product.category}` : ""}
          </div>
          {product.hasNutrients && (
            <div className="muted" style={{ fontSize: 11, marginTop: 3 }}>
              {Object.entries(product.nutrientsPercent)
                .map(([k, v]) => `${nutrientMeta[k]?.label ?? k} ${fmtNum(v)}%`)
                .join(" · ")}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <input
            type="number"
            step="0.01"
            min="0"
            disabled={locked}
            value={doseValue}
            onChange={(e) => onChangeDose(product.id, { dose: e.target.value, unit })}
            placeholder="dose"
            style={{
              width: 78,
              padding: "7px 8px",
              borderRadius: 7,
              border: "1px solid #24313D",
              background: locked ? "#0B131966" : "#17212B",
              color: "#E8EDF1",
              fontSize: 12,
              boxSizing: "border-box",
              fontFamily: "inherit",
            }}
          />
          {product.unit ? (
            <span className="muted-soft" style={{ fontSize: 11, width: 44 }}>
              {product.unit}
            </span>
          ) : (
            <select
              disabled={locked}
              value={unit}
              onChange={(e) => onChangeDose(product.id, { dose: doseValue, unit: e.target.value })}
              style={{
                padding: "6px 6px",
                borderRadius: 7,
                border: "1px solid #24313D",
                background: locked ? "#0B131966" : "#17212B",
                color: "#E8EDF1",
                fontSize: 11,
                fontFamily: "inherit",
              }}
            >
              <option value="L/ha">L/ha</option>
              <option value="kg/ha">kg/ha</option>
            </select>
          )}
          <button
            type="button"
            onClick={() => onToggleLock(product.id)}
            disabled={!locked && !canLock}
            className="tap-scale"
            title={locked ? "Destravar dose" : "Travar dose"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "7px 10px",
              borderRadius: 7,
              border: "none",
              background: locked ? "#1FBF8F" : !canLock ? "#233241" : "#1FBF8F22",
              color: locked ? "#0B1319" : !canLock ? "#5C6B78" : "#1FBF8F",
              fontWeight: 700,
              fontSize: 11,
              cursor: locked || canLock ? "pointer" : "default",
              whiteSpace: "nowrap",
            }}
          >
            {locked ? <Lock size={12} /> : <Unlock size={12} />}
            {locked ? "Travada" : "Travar"}
          </button>
        </div>
      </div>

      {preview.length > 0 && (
        <div className="muted" style={{ fontSize: 11, marginTop: 8, paddingTop: 8, borderTop: "1px solid #24313D" }}>
          Concentração a {fmtNum(doseNum)}
          {unit.split("/")[0]}/ha:{" "}
          {preview.map((row, i) => (
            <span key={row.key}>
              <strong style={{ color: locked ? "#1FBF8F" : "#C7D2D9" }}>
                {nutrientMeta[row.key]?.label ?? row.key} {fmtNum(row.val)}g
              </strong>
              {i < preview.length - 1 ? " · " : ""}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

const smallBtnStyle = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #24313D",
  background: "#0F1720",
  color: "#C7D2D9",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
};
