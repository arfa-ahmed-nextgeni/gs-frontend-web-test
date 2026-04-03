import terser from "next/dist/compiled/terser/bundle.min.js";

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const sourceLoaderPath = path.resolve(
  currentDir,
  "../public/scripts/nr-loader-spa-1.310.1.min.js"
);

const source = await readFile(sourceLoaderPath, "utf8");
const result = await terser.minify(source, {
  compress: true,
  format: {
    comments: false,
  },
  mangle: true,
});

if (!result.code) {
  throw new Error("Failed to minify the New Relic browser loader.");
}

const output = `${result.code}\n`;
await writeFile(sourceLoaderPath, output);
console.info(
  `Minified New Relic browser loader for the current build: ${source.length} -> ${output.length} bytes.`
);
