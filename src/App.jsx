import React, { useEffect, useState } from "react";
import { Leaf, Sun, Moon, Wifi, WifiOff, Menu, X, ArrowLeftRight, Camera } from "lucide-react";
import Home from "./pages/Home.jsx";
import Compare from "./pages/Compare.jsx";
import About from "./pages/About.jsx";
import Managements from "./pages/Managements.jsx";
import Catalog from "./pages/Catalog.jsx";
import PhotoId from "./pages/PhotoId.jsx";
import Dashboard from "./Dashboard.jsx";
import "./theme.css";

const THEME_KEY = "agro-theme";

// Os menus mapeiam para as telas que existem de verdade. "Produtos",
// "Empresas" e "Manejos" são três entradas diferentes no mesmo catálogo
// (lista por categoria, lista por marca e manejos oficiais abertos), porque
// é assim que o consultor pensa — não porque sejam três telas separadas.
const NAV = [
  { id: "produtos", label: "Produtos" },
  { id: "empresas", label: "Empresas" },
  { id: "manejo", label: "Meu manejo" },
  { id: "manejos", label: "Manejos Agrocete" },
  { id: "custo", label: "Calculadora Custo/ha" },
  { id: "foto", label: "Identificar por foto" },
  { id: "sobre", label: "Sobre" },
];

export default function App() {
  const [page, setPage] = useState("home");
  const [catalogSearch, setCatalogSearch] = useState("");
  const [pendingSelection, setPendingSelection] = useState(null);
  const [catalogNonce, setCatalogNonce] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem(THEME_KEY) === "dark";
    } catch {
      return false;
    }
  });
  const [online, setOnline] = useState(() => (typeof navigator === "undefined" ? true : navigator.onLine));

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    try {
      localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
    } catch {
      // sem localStorage: o tema só não persiste
    }
  }, [dark]);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  function go(id) {
    setPage(id);
    setMenuOpen(false);
  }

  function goCatalogWith(term) {
    setCatalogSearch(term);
    setPendingSelection(null);
    setCatalogNonce((n) => n + 1);
    go("produtos");
  }

  // Carrega um manejo inteiro no catálogo (produtos + doses já preenchidos).
  function loadSelectionIntoCatalog(selection) {
    setPendingSelection(selection);
    setCatalogSearch("");
    setCatalogNonce((n) => n + 1);
    go("manejo");
  }

  const isCatalog = page === "produtos" || page === "empresas";

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <header
        style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          position: "sticky",
          top: 0,
          zIndex: 30,
        }}
      >
        <div className="shell" style={{ display: "flex", alignItems: "center", gap: 12, height: 64 }}>
          <button
            onClick={() => go("home")}
            aria-label="Comparador Nutricional — início"
            style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: 0, color: "var(--text)", font: "inherit", flexShrink: 0 }}
          >
            <span
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: "var(--brand)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Leaf size={18} color="var(--brand-contrast)" />
            </span>
            <span style={{ textAlign: "left", lineHeight: 1.15, whiteSpace: "nowrap" }}>
              <span style={{ display: "block", fontSize: 15, fontWeight: 700, letterSpacing: "-0.015em" }}>
                Comparador Nutricional
              </span>
              <span
                className="brand-tagline"
                style={{
                  display: "inline-block",
                  marginTop: 2,
                  fontSize: 9.5,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--brand)",
                  background: "var(--brand-soft)",
                  padding: "1px 6px",
                  borderRadius: "var(--radius-pill)",
                }}
              >
                Inteligência Foliar
              </span>
            </span>
          </button>

          <nav className="main-nav" style={{ display: "flex", gap: 2, marginLeft: "auto" }}>
            {NAV.map((n) => {
              const active = page === n.id;
              return (
                <button
                  key={n.id}
                  onClick={() => go(n.id)}
                  aria-current={active ? "page" : undefined}
                  style={{
                    height: 38,
                    padding: "0 12px",
                    borderRadius: 9,
                    border: "none",
                    background: active ? "var(--brand-soft)" : "transparent",
                    color: active ? "var(--brand)" : "var(--text-2)",
                    fontWeight: active ? 700 : 500,
                    fontSize: 13.5,
                    cursor: "pointer",
                    font: "inherit",
                    fontFamily: "inherit",
                    whiteSpace: "nowrap",
                    transition: "background var(--speed) ease, color var(--speed) ease",
                  }}
                >
                  {n.label}
                </button>
              );
            })}
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto", flexShrink: 0 }}>
            <span
              title={
                online
                  ? "Com internet. O catálogo inteiro fica no aparelho — a plataforma funciona igual sem sinal."
                  : "Sem internet. A plataforma continua funcionando: todo o catálogo está salvo no aparelho."
              }
              className="chip conn-chip"
              style={{
                background: online ? "transparent" : "var(--warn-soft)",
                color: online ? "var(--text-3)" : "var(--warn)",
                borderColor: online ? "var(--border)" : "transparent",
              }}
            >
              {online ? <Wifi size={12} /> : <WifiOff size={12} />}
              {online ? "Online" : "Offline — funciona normal"}
            </span>

            <button
              onClick={() => setDark((v) => !v)}
              title={dark ? "Usar tema claro" : "Usar tema escuro (leitura sob sol forte)"}
              aria-label={dark ? "Usar tema claro" : "Usar tema escuro"}
              style={{
                width: 40,
                height: 40,
                borderRadius: 9,
                border: "1px solid var(--border)",
                background: "var(--surface)",
                color: "var(--text-2)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <button className="btn btn-primary cta-btn" style={{ minHeight: 40, fontSize: 13.5 }} onClick={() => go("custo")}>
              <ArrowLeftRight size={15} /> Iniciar comparação
            </button>

            <button
              className="menu-btn"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuOpen}
              style={{
                width: 40,
                height: 40,
                borderRadius: 9,
                border: "1px solid var(--border)",
                background: "var(--surface)",
                color: "var(--text-2)",
                cursor: "pointer",
                display: "none",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {menuOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>

        {/* Menu do celular: os mesmos itens, empilhados. */}
        {menuOpen && (
          <div className="mobile-menu" style={{ borderTop: "1px solid var(--border)", background: "var(--surface)" }}>
            <div className="shell" style={{ paddingTop: 8, paddingBottom: 12, display: "flex", flexDirection: "column", gap: 2 }}>
              {NAV.map((n) => (
                <button
                  key={n.id}
                  onClick={() => go(n.id)}
                  aria-current={page === n.id ? "page" : undefined}
                  style={{
                    minHeight: 48,
                    padding: "0 12px",
                    borderRadius: 9,
                    border: "none",
                    background: page === n.id ? "var(--brand-soft)" : "transparent",
                    color: page === n.id ? "var(--brand)" : "var(--text)",
                    fontWeight: page === n.id ? 700 : 500,
                    fontSize: 15,
                    textAlign: "left",
                    cursor: "pointer",
                    font: "inherit",
                    fontFamily: "inherit",
                  }}
                >
                  {n.label}
                </button>
              ))}
              <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={() => go("custo")}>
                <ArrowLeftRight size={15} /> Iniciar comparação
              </button>
            </div>
          </div>
        )}
      </header>

      <main>
        {page === "home" && (
          <Home onCompare={() => go("custo")} onCatalog={() => go("produtos")} onSearchTerm={goCatalogWith} />
        )}
        {page === "custo" && <Compare onOpenCatalog={() => go("produtos")} />}
        {page === "manejos" && <Managements onLoadIntoCatalog={loadSelectionIntoCatalog} />}
        {page === "foto" && <PhotoId onOpenProduct={(p) => goCatalogWith(p.name)} />}
        {page === "sobre" && <About />}
        {isCatalog && (
          <Catalog
            key={`${page}-${catalogNonce}`}
            initialSearch={page === "produtos" ? catalogSearch : ""}
            initialGroupBy={page === "empresas" ? "marca" : "categoria"}
            onOpenPhoto={() => go("foto")}
            onOpenManejo={() => go("manejo")}
          />
        )}
        {page === "manejo" && (
          <Dashboard key={`manejo-${catalogNonce}`} initialSelection={pendingSelection} />
        )}
      </main>
    </div>
  );
}
