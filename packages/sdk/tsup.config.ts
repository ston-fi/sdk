import { defineConfig } from "tsup";
// @ts-ignore - esbuild-analyzer package is not typed
import AnalyzerPlugin from "esbuild-analyzer";

export default defineConfig({
  entryPoints: [
    "src/",
    "!src/test-utils",
    "!src/**/*.test.ts",
  ],
  format: ["esm", "cjs"],
  outDir: "dist",
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: true,
  esbuildPlugins: [AnalyzerPlugin({
    outfile: "./build-report.html"
  })],
});
