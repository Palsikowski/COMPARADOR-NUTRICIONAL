import React from "react";
import ShaderBackground from "./ShaderBackground.jsx";

// Fundo animado do app inteiro: o shader em tela cheia, fixo, e um véu por
// cima dele.
//
// O véu não é enfeite — é o que torna o fundo viável numa ferramenta de
// leitura. Sem ele, uma grade de 1.647 produtos ficaria por cima de manchas
// roxas em movimento e a tabela viraria um teste de vista. Com ele, o shader
// vira textura: aparece nas margens, entre os cards e por trás da barra de
// vidro, e o texto continua no contraste de sempre.
//
// A opacidade vem de tokens (`--veil`), então cada tema define a sua: claro
// precisa de mais véu que escuro, porque o shader é escuro.
export default function AppBackground() {
  return (
    <div className="app-bg" aria-hidden="true">
      <ShaderBackground className="app-bg-canvas" />
      <div className="app-bg-veil" />
    </div>
  );
}
