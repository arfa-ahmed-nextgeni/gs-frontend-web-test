import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SUPPORTED_NEXT_VERSION = "16.2.2";

const REMOVED_POLYFILL_SEGMENTS = [
  '"trimStart"in String.prototype||(String.prototype.trimStart=String.prototype.trimLeft)',
  '"trimEnd"in String.prototype||(String.prototype.trimEnd=String.prototype.trimRight)',
  '"description"in Symbol.prototype||Object.defineProperty(Symbol.prototype,"description",{configurable:!0,get:function(){var t=/\\((.*)\\)/.exec(this.toString());return t?t[1]:void 0}})',
  "Array.prototype.flat||(Array.prototype.flat=function(t,r){return r=this.concat.apply([],this),t>1&&r.some(Array.isArray)?r.flat(t-1):r},Array.prototype.flatMap=function(t,r){return this.map(t,r).flat()})",
  'Promise.prototype.finally||(Promise.prototype.finally=function(t){if("function"!=typeof t)return this.then(t,t);var r=this.constructor||Promise;return this.then(function(n){return r.resolve(t()).then(function(){return n})},function(n){return r.resolve(t()).then(function(){throw n})})})',
  "Object.fromEntries||(Object.fromEntries=function(t){return Array.from(t).reduce(function(t,r){return t[r[0]]=r[1],t},{})})",
];

const KEPT_POLYFILL_SEGMENTS = [
  "Array.prototype.at||(Array.prototype.at=function(t){var r=Math.trunc(t)||0;if(r<0&&(r+=this.length),!(r<0||r>=this.length))return this[r]})",
  'Object.hasOwn||(Object.hasOwn=function(t,r){if(null==t)throw new TypeError("Cannot convert undefined or null to object");return Object.prototype.hasOwnProperty.call(Object(t),r)})',
  '"canParse"in URL||(URL.canParse=function(t,r){try{return!!new URL(t,r)}catch(t){return!1}})',
];

const EXPECTED_ORIGINAL_POLYFILL_MODULE =
  [...REMOVED_POLYFILL_SEGMENTS, ...KEPT_POLYFILL_SEGMENTS].join(",") + ";";

const PATCHED_POLYFILL_MODULE = `${KEPT_POLYFILL_SEGMENTS.join(",")};`;

const normalize = (value) => value.replace(/\r\n/g, "\n").trim();

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDirectory, "..");
const nextPackagePath = path.join(repoRoot, "node_modules/next/package.json");
const polyfillModulePath = path.join(
  repoRoot,
  "node_modules/next/dist/build/polyfills/polyfill-module.js"
);

const fail = (message) => {
  console.error(`patch-next-polyfills: ${message}`);
  process.exit(1);
};

try {
  const nextPackage = JSON.parse(await readFile(nextPackagePath, "utf8"));

  if (nextPackage.version !== SUPPORTED_NEXT_VERSION) {
    fail(
      `expected next@${SUPPORTED_NEXT_VERSION}, found next@${nextPackage.version}. Review the patch script before continuing.`
    );
  }

  const currentPolyfillModule = await readFile(polyfillModulePath, "utf8");
  const normalizedCurrentPolyfillModule = normalize(currentPolyfillModule);

  if (normalizedCurrentPolyfillModule === normalize(PATCHED_POLYFILL_MODULE)) {
    console.info("patch-next-polyfills: already applied.");
    process.exit(0);
  }

  if (
    normalizedCurrentPolyfillModule !==
    normalize(EXPECTED_ORIGINAL_POLYFILL_MODULE)
  ) {
    fail(
      "unexpected polyfill-module.js contents. Next internals likely changed and this patch needs review."
    );
  }

  await writeFile(polyfillModulePath, PATCHED_POLYFILL_MODULE);

  console.info("patch-next-polyfills: applied.");
} catch (error) {
  fail(error instanceof Error ? error.message : "unknown error");
}
