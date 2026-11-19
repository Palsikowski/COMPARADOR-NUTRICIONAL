import React, { useEffect, useState } from "react";
import PillNav from "./components/PillNav.jsx";
import GlobalSearch from "./components/GlobalSearch.jsx";
import AppBackground from "./components/AppBackground.jsx";
import Home from "./pages/Home.jsx";
import Compare from "./pages/Compare.jsx";
import About from "./pages/About.jsx";
import Managements from "./pages/Managements.jsx";
import Catalog from "./pages/Catalog.jsx";
import Brands from "./pages/Brands.jsx";
import BrandPage from "./pages/BrandPage.jsx";
import Portfolio from "./pages/Portfolio.jsx";
import PhotoId from "./pages/PhotoId.jsx";
import Dashboard from "./Dashboard.jsx";
import { readStoredTheme, applyTheme, storeTheme } from "./lib/theme.js";
import { useAuth } from "./lib/auth.js";
import "./theme.css";
import "./shell.css";


// O menu central lista as quatro telas por onde o trabalho começa; o resto
// fica em "Mais" (e no sanduíche do celular).
//
// "Produtos" subiu para o centro: é o catálogo de 1.647 itens, a tela mais
// usada do app, e estava a dois cliques — o mesmo custo de "Sobre".
//
// "Manejo do cliente" e "Manejos Agrocete" formam um par de propósito: o que o
// produtor usa hoje × o que a Agrocete recomenda. O nome no plural ("Manejos
// Cliente") escondia esse sentido; no singular fica claro que é UM manejo, o
// que você monta. O id e o comportamento não mudaram.
//
// O rótulo aqui é o mesmo título que a tela mostra. Menu e página dizendo
// nomes diferentes é o que faz a pessoa achar que clicou errado.
const PRIMARY_NAV = [
  { id: "produtos", label: "Produtos" },
  { id: "empresas", label: "Empresas" },
  { id: "manejo", label: "Manejo do cliente" },
  { id: "manejos", label: "Manejos Agrocete" },
];

const SECONDARY_NAV = [
  { id: "portfolio", label: "Portfólio Agrocete" },
  { id: "custo", label: "Compare dois produtos" },
  { id: "foto", label: "Identificar por foto" },
  { id: "sobre", label: "Sobre" },
];

export default function App() {
  const [page, setPage] = useState("home");
  const [catalogSearch, setCatalogSearch] = useState("");
  const [pendingSelection, setPendingSelection] = useState(null);
  const [catalogNonce, setCatalogNonce] = useState(0);
  const [openBrand, setOpenBrand] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [dark, setDark] = useState(readStoredTheme);
  const [online, setOnline] = useState(() => (typeof navigator === "undefined" ? true : navigator.onLine));
  const { signOut } = useAuth();

  useEffect(() => {
    applyTheme(dark);
    storeTheme(dark);
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

  // Ctrl/⌘+K abre a busca de qualquer tela. O atalho é o caminho de quem usa
  // o app todo dia; a lupa na barra é o de quem não sabe que ele existe.
  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function go(id) {
    setPage(id);
    // Sair de "Empresas" fecha a empresa aberta: voltar pela navegação e cair
    // na página de uma marca que não se escolheu agora é desorientador.
    if (id !== "empresas") setOpenBrand(null);
  }

  function goBrand(brand) {
    setOpenBrand(brand);
    setPage("empresas");
    window.scrollTo({ top: 0 });
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

  // "Empresas" agora tem tela própria (vitrine de bandeiras), então só
  // "Produtos" abre a grade do catálogo.
  const isCatalog = page === "produtos";

  return (
    <>
      <AppBackground />

      <PillNav
        page={page}
        primary={PRIMARY_NAV}
        secondary={SECONDARY_NAV}
        online={online}
        dark={dark}
        onNavigate={go}
        onToggleTheme={() => setDark((v) => !v)}
        onSignOut={signOut}
        onOpenSearch={() => setSearchOpen(true)}
      />

      <GlobalSearch
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onProduct={(p) => goCatalogWith(p.name)}
        onBrand={(b) => goBrand(b)}
        onTerm={goCatalogWith}
      />

      <main className="app-shell" style={{ paddingTop: "var(--shell-top)" }}>
        {page === "home" && (
          <Home
            onCompare={() => go("custo")}
            onCatalog={() => go("produtos")}
            onSearchTerm={goCatalogWith}
            onBrands={() => go("empresas")}
            onPortfolio={() => go("portfolio")}
            onManagements={() => go("manejos")}
            onPhoto={() => go("foto")}
          />
        )}
        {page === "portfolio" && <Portfolio onOpenProduct={(p) => goCatalogWith(p.name)} />}
        {page === "custo" && <Compare onOpenCatalog={() => go("produtos")} />}
        {page === "manejos" && <Managements onLoadIntoCatalog={loadSelectionIntoCatalog} />}
        {page === "foto" && <PhotoId onOpenProduct={(p) => goCatalogWith(p.name)} onOpenBrand={goBrand} />}
        {page === "empresas" &&
          (openBrand ? (
            <BrandPage key={openBrand} brand={openBrand} dark={dark} onBack={() => setOpenBrand(null)} onPortfolio={() => go("portfolio")} />
          ) : (
            <Brands onOpenBrand={goBrand} />
          ))}
        {page === "sobre" && <About />}
        {isCatalog && (
          <Catalog
            key={`${page}-${catalogNonce}`}
            initialSearch={catalogSearch}
            initialGroupBy="categoria"
            onOpenPhoto={() => go("foto")}
            onOpenManejo={() => go("manejo")}
          />
        )}
        {page === "manejo" && (
          <Dashboard key={`manejo-${catalogNonce}`} initialSelection={pendingSelection} />
        )}
      </main>
    </>
  );
}
