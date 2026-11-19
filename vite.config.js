import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// `vite build --mode singlefile` produces a single self-contained index.html
// (CSS/JS inlined, no external files) for hosts that just want to drop in
// one file, e.g. Firebase Hosting's default public/index.html.
// O build singlefile é também o que vai para o GitHub Pages, e lá o app não
// mora na raiz do domínio: mora em /COMPARADOR-NUTRICIONAL/. Com base "/"
// (o padrão), `import.meta.env.BASE_URL` vira "/" e o worker do OCR é
// procurado em palsikowski.github.io/ocr/… — 404, e "Identificar por foto"
// morre em produção mesmo com o resto do app inteiro inline no index.html.
// Com base "./" o caminho passa a ser relativo à página, o que funciona na
// raiz, em subpasta e até abrindo o arquivo direto do disco (file://).
export default defineConfig(({ mode }) => ({
  base: mode === "singlefile" ? "./" : "/",
  plugins: [react(), ...(mode === "singlefile" ? [viteSingleFile()] : [])],
}));
