import { defineConfig } from "vite";
import monkey from "vite-plugin-monkey";

import { userscript } from "./src/meta.js";

export default defineConfig({
  build: {
    minify: false,
    cssMinify: false,
    sourcemap: true,
    outDir: "dist",
    emptyOutDir: true,
  },
  plugins: [
    monkey({
      entry: "src/main.js",
      userscript,
      server: {
        prefix: `dev:${userscript.name}`,
      },
      build: {
        fileName: "juejin-markdown-formatter.user.js",
        metaFileName: "juejin-markdown-formatter.meta.js",
        autoGrant: false,
      },
    }),
  ],
});
