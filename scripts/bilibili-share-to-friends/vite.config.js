import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
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
    preact(),
    monkey({
      entry: "src/main.js",
      userscript,
      server: {
        prefix: `dev:${userscript.name}`,
      },
      build: {
        fileName: "bilibili-share-to-friends.user.js",
        metaFileName: "bilibili-share-to-friends.meta.js",
        autoGrant: false,
      },
    }),
  ],
});
