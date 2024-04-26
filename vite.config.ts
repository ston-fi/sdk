import { defineConfig } from "vite";
import { resolve } from "node:path";
import dts from "vite-plugin-dts";
import { visualizer } from "rollup-plugin-visualizer";

import { peerDependencies } from "./package.json";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  plugins: [
    dts(),
  ],
  build: {
    rollupOptions: {
      external: [...Object.keys(peerDependencies)],
      output: { preserveModules: true, exports: "named" },
      plugins: [
        visualizer({
          filename: "./dist/build-report.html",
        }),
      ],
    },
    lib: {
      fileName: "index",
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es", "cjs"],
    },
    minify: true,
    sourcemap: true,
  },
});
