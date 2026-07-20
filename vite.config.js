import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// `vite build --mode singlefile` produces a single self-contained index.html
// (CSS/JS inlined, no external files) for hosts that just want to drop in
// one file, e.g. Firebase Hosting's default public/index.html.
export default defineConfig(({ mode }) => ({
  plugins: [react(), ...(mode === "singlefile" ? [viteSingleFile()] : [])],
}));
