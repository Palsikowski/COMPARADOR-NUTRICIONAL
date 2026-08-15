import React, { useRef, useState } from "react";
import { Camera, Upload, Loader2, AlertTriangle, Info, Search, ArrowRight } from "lucide-react";
import { matchProductsFromText, confidenceLabel } from "../lib/photoMatch.js";
import { NutrientPillRow } from "../dashboard/NutrientPill.jsx";
import DataBadge from "../components/DataBadge.jsx";
import { concentrationUnit } from "../lib/economics.js";

const NUTRIENT_META = {
  N: { label: "Nitrogênio" }, P2O5: { label: "Fósforo (P2O5)" }, K2O: { label: "Potássio (K2O)" },
  Ca: { label: "Cálcio" }, Mg: { label: "Magnésio" }, S: { label: "Enxofre" }, B: { label: "Boro" },
  Cu: { label: "Cobre" }, Mn: { label: "Manganês" }, Zn: { label: "Zinco" }, Fe: { label: "Ferro" },
  Mo: { label: "Molibdênio" }, Ni: { label: "Níquel" }, Co: { label: "Cobalto" }, C_Org: { label: "Carbono orgânico" },
};

// Identificação por foto do rótulo.
//
// O reconhecimento lê o TEXTO impresso na embalagem (OCR rodando no próprio
// aparelho) e casa com os nomes do catálogo. Não é reconhecimento visual da
// embalagem: não existe nenhuma foto de produto cadastrada, então não há como
// treinar isso. O resultado é sempre uma lista de candidatos pra pessoa
// confirmar — o app não decide sozinho qual produto é.
export default function PhotoId({ onOpenProduct }) {
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [progress, setProgress] = useState("");
  const [text, setText] = useState("");
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);
  const cameraRef = useRef(null);

  async function handleFile(file) {
    if (!file) return;
    setError(null);
    setMatches([]);
    setText("");
    setPreview(URL.createObjectURL(file));
    setStatus("loading");
    setProgress("Carregando o leitor de texto...");

    try {
      const { createWorker } = await import("tesseract.js");
      // Worker, núcleo e modelo servidos pelo próprio app (public/ocr) em vez
      // do CDN padrão do tesseract.js — sem isso a leitura só funcionaria com
      // internet, justamente o oposto do que o app precisa em campo.
      const base = `${import.meta.env.BASE_URL}ocr`;
      const worker = await createWorker("eng", 1, {
        workerPath: `${base}/worker.min.js`,
        corePath: base,
        langPath: base,
        gzip: true,
        logger: (m) => {
          if (m.status === "recognizing text") setProgress(`Lendo o rótulo... ${Math.round((m.progress || 0) * 100)}%`);
          else if (m.status) setProgress("Preparando o leitor...");
        },
      });
      const { data } = await worker.recognize(file);
      await worker.terminate();

      const raw = (data.text || "").trim();
      setText(raw);
      const found = matchProductsFromText(raw);
      setMatches(found);
      setStatus("done");
    } catch (e) {
      setError(
        e?.message?.includes("Network") || e?.message?.includes("fetch")
          ? "Não deu para baixar o leitor de texto. Ele é baixado uma vez e depois fica no aparelho — conecte à internet e tente de novo."
          : `Não foi possível ler a imagem: ${e?.message || e}`
      );
      setStatus("error");
    }
  }

  return (
    <div className="shell" style={{ paddingTop: 26, paddingBottom: 80, maxWidth: 860 }}>
      <header style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>Identificar por foto</h1>
        <p className="muted" style={{ fontSize: 14.5, margin: "6px 0 0", lineHeight: 1.55 }}>
          Fotografe o rótulo do produto. O app lê o nome impresso na embalagem, no próprio aparelho, e procura no
          catálogo de 1.518 produtos.
        </p>
      </header>

      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn btn-primary" style={{ flex: 1, minWidth: 180 }} onClick={() => cameraRef.current?.click()}>
            <Camera size={17} /> Tirar foto do rótulo
          </button>
          <button className="btn btn-ghost" style={{ flex: 1, minWidth: 180 }} onClick={() => fileRef.current?.click()}>
            <Upload size={16} /> Enviar uma imagem
          </button>
        </div>
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files?.[0])} />
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files?.[0])} />

        <div
          style={{
            marginTop: 12,
            padding: "11px 13px",
            borderRadius: "var(--radius-sm)",
            background: "var(--info-soft)",
            border: "1px solid color-mix(in srgb, var(--info) 15%, transparent)",
            display: "flex",
            gap: 9,
            fontSize: 12.5,
            lineHeight: 1.55,
          }}
        >
          <Info size={15} style={{ color: "var(--info)", flexShrink: 0, marginTop: 1 }} />
          <span className="muted">
            Enquadre <strong>o nome do produto</strong> ocupando boa parte da foto, sem reflexo. A leitura acontece no
            aparelho — a foto não é enviada para lugar nenhum. O leitor é baixado uma única vez (~4 MB) e fica salvo.
          </span>
        </div>
      </div>

      {preview && (
        <div className="card" style={{ padding: 16, marginTop: 14 }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
            <img
              src={preview}
              alt="Foto enviada"
              style={{ width: 160, maxWidth: "100%", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}
            />
            <div style={{ flex: 1, minWidth: 220 }}>
              {status === "loading" && (
                <div style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13.5 }}>
                  <Loader2 size={17} className="spin" style={{ color: "var(--brand)" }} />
                  {progress || "Processando..."}
                </div>
              )}
              {status === "done" && (
                <>
                  <div className="muted-soft" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Texto lido no rótulo
                  </div>
                  <div
                    style={{
                      marginTop: 5,
                      padding: "9px 11px",
                      background: "var(--surface-2)",
                      borderRadius: 8,
                      fontSize: 12.5,
                      whiteSpace: "pre-wrap",
                      maxHeight: 120,
                      overflowY: "auto",
                      lineHeight: 1.45,
                    }}
                  >
                    {text || "(nada legível)"}
                  </div>
                </>
              )}
              {status === "error" && (
                <div style={{ display: "flex", gap: 9, fontSize: 13, color: "var(--warn)" }}>
                  <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {status === "done" && (
        <section style={{ marginTop: 14 }}>
          {matches.length === 0 ? (
            <div className="card" style={{ padding: "24px 18px", textAlign: "center" }}>
              <Search size={24} style={{ color: "var(--text-3)" }} />
              <div style={{ fontWeight: 600, marginTop: 9, fontSize: 15 }}>Nenhum produto reconhecido</div>
              <p className="muted" style={{ fontSize: 13, marginTop: 6, lineHeight: 1.55, maxWidth: 460, marginInline: "auto" }}>
                O texto lido não bateu com nenhum produto do catálogo. Tente uma foto mais próxima do nome, com o
                rótulo plano e sem reflexo — ou procure pelo nome na busca do catálogo.
              </p>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px" }}>
                {matches.length === 1 ? "1 produto provável" : `${matches.length} produtos prováveis`}
              </h2>
              <p className="muted" style={{ fontSize: 12.5, margin: "0 0 12px", lineHeight: 1.5 }}>
                Confira o nome antes de usar — a leitura de rótulo pode confundir produtos de nomes parecidos.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {matches.map((m) => (
                  <MatchCard key={m.product.id} match={m} onOpen={() => onOpenProduct(m.product)} />
                ))}
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}

function MatchCard({ match, onOpen }) {
  const { product: p, score, brandHit } = match;
  const conf = confidenceLabel(score);
  const tone = conf.tone === "ok" ? "var(--ok)" : conf.tone === "warn" ? "var(--warn)" : "var(--info)";
  const toneBg = conf.tone === "ok" ? "var(--ok-soft)" : conf.tone === "warn" ? "var(--warn-soft)" : "var(--info-soft)";

  return (
    <div className="card" style={{ padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.25 }}>{p.name}</div>
          <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>
            {p.brand}
            {p.category ? ` · ${p.category}` : ""}
          </div>
        </div>
        <span
          className="chip tnum"
          style={{ background: toneBg, color: tone, borderColor: "transparent", flexShrink: 0, alignSelf: "flex-start" }}
        >
          {Math.round(score * 100)}% · {conf.text}
        </span>
      </div>

      {p.hasNutrients && (
        <NutrientPillRow nutrients={p.nutrients} unit={concentrationUnit(p)} meta={NUTRIENT_META} max={6} compact />
      )}

      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 9, alignItems: "center" }}>
        <DataBadge product={p} compact />
        {brandHit && (
          <span className="chip" style={{ fontSize: 10.5, background: "var(--ok-soft)", color: "var(--ok)", borderColor: "transparent" }}>
            marca confere na foto
          </span>
        )}
      </div>

      <button className="btn btn-primary" style={{ width: "100%", marginTop: 12 }} onClick={onOpen}>
        É esse — abrir no catálogo <ArrowRight size={15} />
      </button>
    </div>
  );
}
