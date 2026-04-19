/**
 * cache-bust.mjs
 *
 * Appends a short content-hash query string (?v=<hash>) to the <script> and
 * <link rel="stylesheet"> references in dist/index.html so that browsers
 * always fetch the latest assets after a deployment.
 */

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, "../dist");

function shortHash(filePath) {
  const content = readFileSync(filePath);
  return createHash("sha256").update(content).digest("hex").slice(0, 8);
}

const jsHash  = shortHash(resolve(distDir, "main.js"));
const cssHash = shortHash(resolve(distDir, "styles.css"));

const htmlPath = resolve(distDir, "index.html");
let html = readFileSync(htmlPath, "utf8");

// Replace asset references (handles both plain and already-versioned URLs,
// and both double- and single-quoted attribute values).
function bustAsset(source, filename, hash) {
  const escaped = filename.replace(".", "\\.");
  const updated = source.replace(
    new RegExp(`((?:src|href)=)(["'])${escaped}(?:\\?v=[^"']*)?\\2`),
    (_, attr, q) => `${attr}${q}${filename}?v=${hash}${q}`
  );
  if (updated === source) {
    console.warn(`Warning: no reference to "${filename}" found in index.html`);
  }
  return updated;
}

html = bustAsset(html, "main.js",    jsHash);
html = bustAsset(html, "styles.css", cssHash);

writeFileSync(htmlPath, html, "utf8");

console.log(`Cache-busted: main.js?v=${jsHash}  styles.css?v=${cssHash}`);
