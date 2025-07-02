// @ts-ignore - esbuild-analyzer package is not typed
import AnalyzerPlugin from "esbuild-analyzer";
import { defineConfig } from "tsup";

export default defineConfig({
  entryPoints: ["src/", "!src/**/*.test.ts"],
  format: ["esm"],
  outDir: "dist",
  dts: true,
  clean: true,
  esbuildPlugins: [
    AnalyzerPlugin({
      outfile: "./build-report.html",
    }),
  ],
});
