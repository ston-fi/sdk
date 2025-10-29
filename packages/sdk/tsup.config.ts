// @ts-expect-error - esbuild-analyzer package is not typed
import AnalyzerPlugin from "esbuild-analyzer";
import { defineConfig } from "tsup";

export default defineConfig({
  entryPoints: ["src/", "!src/test-utils", "!src/**/*.test.ts"],
  format: ["esm", "cjs"],
  outDir: "dist",
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: true,
  esbuildPlugins: [
    AnalyzerPlugin({
      outfile: "./build-report.html",
    }),
  ],
});
