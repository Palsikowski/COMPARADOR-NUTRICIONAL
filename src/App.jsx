import React, { useEffect, useState } from "react";
import PillNav from "./components/PillNav.jsx";
import AppBackground from "./components/AppBackground.jsx";
import Home from "./pages/Home.jsx";
import Compare from "./pages/Compare.jsx";
import About from "./pages/About.jsx";
import Managements from "./pages/Managements.jsx";
import Catalog from "./pages/Catalog.jsx";
import Brands from "./pages/Brands.jsx";
import BrandPage from "./pages/BrandPage.jsx";
import PhotoId from "./pages/PhotoId.jsx";
import Dashboard from "./Dashboard.jsx";
import { readStoredTheme, applyTheme, storeTheme } from "./lib/theme.js";
import { useAuth } from "./lib/auth.js";
import "./theme.css";
import "./shell.css";


// A barra flutuante mostra três seções no centro, como pedido. As outras
// quatro telas continuam existindo e ficam em "Mais" (e no sanduíche do
// celular): sumir com a entrada de navegação de metade do app em nome do
// desenho seria perder função, não ganhar estética.
//
// "Manejos Cliente" é a tela que o app chamava de "Meu manejo" — o nome mudou
// na navegação, o id e o comportamento não.
const PRIMARY_NAV = [
  { id: "empresas", label: "Empresas" },
  { id: "manejo", label: "Manejos Cliente" },
  { id: "manejos", label: "Manejos Agrocete" },
];

const SECONDARY_NAV = [
  { id: "produtos", label: "Produtos" },
  { id: "custo", label: "Calculadora Custo/ha" },
  { id: "foto", label: "Identificar por foto" },
  { id: "sobre", label: "Sobre" },
];

export default function App() {
  const [page, setPage] = useState("home");
  const [catalogSearch, setCatalogSearch] = useState("");
  const [pendingSelection, setPendingSelection] = useState(null);
  const [catalogNonce, setCatalogNonce] = useState(0);
  const [openBrand, setOpenBrand] = useState(null);
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
      />

      <main className="app-shell" style={{ paddingTop: "var(--shell-top)" }}>
        {page === "home" && (
          <Home onCompare={() => go("custo")} onCatalog={() => go("produtos")} onSearchTerm={goCatalogWith} />
        )}
        {page === "custo" && <Compare onOpenCatalog={() => go("produtos")} />}
        {page === "manejos" && <Managements onLoadIntoCatalog={loadSelectionIntoCatalog} />}
        {page === "foto" && <PhotoId onOpenProduct={(p) => goCatalogWith(p.name)} onOpenBrand={goBrand} />}
        {page === "empresas" &&
          (openBrand ? (
            <BrandPage key={openBrand} brand={openBrand} dark={dark} onBack={() => setOpenBrand(null)} />
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
