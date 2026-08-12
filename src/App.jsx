import React, { useEffect, useState } from "react";
import { Leaf, Sun, Moon, Home as HomeIcon, ArrowLeftRight, Layers, Wifi, WifiOff } from "lucide-react";
import Home from "./pages/Home.jsx";
import Compare from "./pages/Compare.jsx";
import Dashboard from "./Dashboard.jsx";
import "./theme.css";

const THEME_KEY = "agro-theme";
const NAV = [
  { id: "home", label: "Início", icon: HomeIcon },
  { id: "compare", label: "Comparar", icon: ArrowLeftRight },
  { id: "catalog", label: "Catálogo e manejo", icon: Layers },
];

// Shell da plataforma. O Dashboard original continua inteiro na aba "Catálogo
// e manejo" — nada do que já funcionava (manejos prontos, sugestão Agrocete,
// templates, trava de dose, exportação em PDF) foi removido; ele ganhou um
// nível de navegação por cima.
export default function App() {
  const [page, setPage] = useState("home");
  const [catalogSearch, setCatalogSearch] = useState("");
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
      // sem localStorage: tema só não persiste
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

  // Busca vinda da home abre o catálogo já filtrado — a busca da home é a
  // porta de entrada, não um beco sem saída.
  function goCatalogWith(term) {
    setCatalogSearch(term);
    setPage("catalog");
  }

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
        <div
          className="shell"
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, height: 62 }}
        >
          <button
            onClick={() => setPage("home")}
            style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: 0, color: "var(--text)", font: "inherit" }}
          >
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                background: "var(--brand)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Leaf size={17} color="var(--brand-contrast)" />
            </span>
            <span style={{ textAlign: "left", lineHeight: 1.15, whiteSpace: "nowrap" }}>
              <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, letterSpacing: "-0.01em" }}>Painel Agrocete</span>
              <span className="muted-soft brand-tagline" style={{ display: "block", fontSize: 10.5 }}>
                Inteligência em nutrição foliar
              </span>
            </span>
          </button>

          <nav className="main-nav" style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
            {NAV.map((n) => {
              const Icon = n.icon;
              const active = page === n.id;
              return (
                <button
                  key={n.id}
                  onClick={() => setPage(n.id)}
                  // O rótulo some no mobile (só ícone), então o nome acessível
                  // precisa vir do aria-label — senão vira um botão sem nome.
                  aria-label={n.label}
                  aria-current={active ? "page" : undefined}
                  title={n.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    height: 40,
                    padding: "0 13px",
                    borderRadius: 9,
                    border: "1px solid transparent",
                    background: active ? "var(--brand-soft)" : "transparent",
                    color: active ? "var(--brand)" : "var(--text-2)",
                    fontWeight: active ? 700 : 500,
                    fontSize: 13.5,
                    cursor: "pointer",
                    font: "inherit",
                    fontFamily: "inherit",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Icon size={15} />
                  <span className="nav-label">{n.label}</span>
                </button>
              );
            })}
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <span
              title={
                online
                  ? "Com internet. O catálogo inteiro fica no aparelho — a plataforma funciona igual sem sinal."
                  : "Sem internet. A plataforma continua funcionando: todo o catálogo está salvo no aparelho."
              }
              className="chip"
              style={{
                background: online ? "transparent" : "var(--warn-soft)",
                color: online ? "var(--text-3)" : "var(--warn)",
                borderColor: online ? "var(--border)" : "transparent",
              }}
            >
              {online ? <Wifi size={12} /> : <WifiOff size={12} />}
              <span className="nav-label">{online ? "Online" : "Offline — funciona normal"}</span>
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
          </div>
        </div>
      </header>

      <main>
        {page === "home" && (
          <Home onCompare={() => setPage("compare")} onCatalog={() => setPage("catalog")} onSearchTerm={goCatalogWith} />
        )}
        {page === "compare" && <Compare onOpenCatalog={() => setPage("catalog")} />}
        {page === "catalog" && <Dashboard initialSearch={catalogSearch} />}
      </main>
    </div>
  );
}
