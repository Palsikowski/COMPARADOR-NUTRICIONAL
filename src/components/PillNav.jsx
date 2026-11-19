import React, { useEffect, useRef, useState } from "react";
import { Leaf, Sun, Moon, Wifi, WifiOff, Menu, X, LogOut, ChevronDown, Search } from "lucide-react";

// Barra de navegação flutuante em pílula, sobreposta ao fundo animado.
//
// Três seções no centro, como pedido: Empresas, Manejos Cliente e Manejos
// Agrocete. O app tem mais telas que isso (Produtos, Calculadora Custo/ha,
// Identificar por foto, Sobre) — elas não sumiram: ficam em "Mais", porque
// deixar quatro telas sem entrada na navegação seria perder funcionalidade em
// nome do desenho. No celular tudo desce pro sanduíche.
export default function PillNav({
  page,
  primary,
  secondary,
  online,
  dark,
  onNavigate,
  onToggleTheme,
  onSignOut,
  onOpenSearch,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);

  // Alargou a ponto de o sanduíche sumir? Fecha a folha: o botão que a fecharia
  // desaparece junto com o corte.
  useEffect(() => {
    const wide = window.matchMedia?.("(min-width: 1081px)");
    if (!wide) return undefined;
    const onChange = () => {
      if (wide.matches) setMenuOpen(false);
    };
    wide.addEventListener?.("change", onChange);
    return () => wide.removeEventListener?.("change", onChange);
  }, []);

  // Fecha o "Mais" ao clicar fora ou apertar Esc — menu que só fecha no
  // próprio botão prende o clique seguinte da pessoa.
  useEffect(() => {
    if (!moreOpen) return undefined;
    function onPointerDown(e) {
      if (!moreRef.current?.contains(e.target)) setMoreOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setMoreOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [moreOpen]);

  function go(id) {
    onNavigate(id);
    setMenuOpen(false);
    setMoreOpen(false);
  }

  // Quando a tela aberta está dentro de "Mais", o item que carrega o
  // aria-current nem existe no DOM (o menu está fechado). Resultado: em cinco
  // das oito telas nada dizia onde a pessoa estava. O botão passa a mostrar o
  // nome da seção ativa e a carregar o aria-current no lugar dela.
  const activeSecondary = secondary.find((n) => n.id === page) || null;

  return (
    <>
      {/* Faixa de topo: a barra flutua, então o conteúdo passa por baixo dela
          ao rolar. Sem este esmaecido, cards e texto apareciam nas frestas ao
          lado da pílula e a leitura ficava suja. */}
      <div className="shell-topfade" aria-hidden="true" />

      <div className="pillbar">
        <nav className="pill" aria-label="Navegação principal">
          <button className="pill-brand" onClick={() => go("home")} aria-label="Comparador Nutricional — início">
            <span className="pill-mark">
              <Leaf size={17} />
            </span>
            <span className="pill-brand-text">
              <span className="pill-brand-name">Comparador Nutricional</span>
              <span className="pill-brand-tag">Inteligência Foliar</span>
            </span>
          </button>

          <div className="pill-links">
            {primary.map((n) => (
              <button
                key={n.id}
                className="pill-link"
                onClick={() => go(n.id)}
                aria-current={page === n.id ? "page" : undefined}
                data-active={page === n.id ? "true" : undefined}
              >
                {n.label}
              </button>
            ))}

            <div className="pill-more" ref={moreRef}>
              <button
                className="pill-link"
                onClick={() => setMoreOpen((v) => !v)}
                aria-expanded={moreOpen}
                aria-haspopup="true"
                aria-current={activeSecondary ? "page" : undefined}
                data-active={activeSecondary ? "true" : undefined}
              >
                {activeSecondary ? activeSecondary.label : "Mais"}
                <ChevronDown size={14} style={{ transform: moreOpen ? "rotate(180deg)" : "none", transition: "transform var(--speed) ease" }} />
              </button>
              {moreOpen && (
                <div className="pill-dropdown" role="menu">
                  {secondary.map((n) => (
                    <button
                      key={n.id}
                      role="menuitem"
                      className="pill-dropdown-item"
                      onClick={() => go(n.id)}
                      aria-current={page === n.id ? "page" : undefined}
                      data-active={page === n.id ? "true" : undefined}
                    >
                      {n.label}
                    </button>
                  ))}
                  <div className="pill-dropdown-note">
                    {online ? <Wifi size={13} /> : <WifiOff size={13} />}
                    {online ? "Online — o catálogo fica no aparelho" : "Sem internet — o catálogo continua no aparelho"}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pill-actions">
            {!online && (
              <span className="pill-offline" title="Sem internet. A plataforma continua funcionando: todo o catálogo está salvo no aparelho.">
                <WifiOff size={13} /> Offline
              </span>
            )}

            {/* A busca unificada só existia na home. Aqui ela alcança todas as
                telas — é a porta de entrada de quem não sabe em qual das oito
                a resposta mora. */}
            <button
              className="pill-icon"
              onClick={onOpenSearch}
              title="Buscar em todo o app (Ctrl+K)"
              aria-label="Buscar em todo o app"
            >
              <Search size={16} />
            </button>

            <button
              className="pill-icon"
              onClick={onToggleTheme}
              title={dark ? "Usar tema claro" : "Usar tema escuro (leitura sob sol forte)"}
              aria-label={dark ? "Usar tema claro" : "Usar tema escuro"}
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <button className="pill-cta" onClick={onSignOut}>
              <LogOut size={15} /> <span className="pill-cta-label">Sair</span>
            </button>

            <button
              className="pill-burger"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>

        {menuOpen && (
          <div className="pill-sheet">
            {[...primary, ...secondary].map((n) => (
              <button
                key={n.id}
                className="pill-sheet-item"
                onClick={() => go(n.id)}
                aria-current={page === n.id ? "page" : undefined}
                data-active={page === n.id ? "true" : undefined}
              >
                {n.label}
              </button>
            ))}
            <div className="pill-dropdown-note">
              {online ? <Wifi size={13} /> : <WifiOff size={13} />}
              {online ? "Online — o catálogo fica no aparelho" : "Sem internet — o catálogo continua no aparelho"}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
