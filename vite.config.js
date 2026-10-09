import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// Builds to one self-contained dist/index.html: works on Cloudflare Pages
// and can still be published as a single-file artifact.
export default defineConfig({
  base: "./",
  plugins: [react(), viteSingleFile()],
});
