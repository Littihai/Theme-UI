#!/usr/bin/env node
/**
 * The dictionary check (npm run check:i18n): every key the code asks for must exist in src/i18n, and every entry in
 * the dictionary should be asked for somewhere. Reads the source as text — no build needed.
 *
 *   t("a.b")  tr("a.b")  t(`a.b.${x}`)  labelKey: "a.b"  → used keys (a template literal keeps its static prefix)
 *
 * Exit code 1 when a used key is missing; unused keys are only listed (a key may be reached through data).
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = new URL("../src/", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx?|mjs)$/.test(name)) out.push(p);
  }
  return out;
}

const files = walk(root);
const dictFiles = files.filter((f) => /[\\/]i18n[\\/]dict(\.[\w-]+)?\.ts$/.test(f));
const codeFiles = files.filter((f) => !dictFiles.includes(f) && !/[\\/]i18n[\\/]errors\.ts$/.test(f));

// the dictionary: `"key": { th:` and `"key": e(`
const defined = new Map();
for (const f of dictFiles) {
  const src = readFileSync(f, "utf8");
  for (const m of src.matchAll(/^\s*"([^"]+)":\s*(?:\{|e\()/gm)) defined.set(m[1], relative(root, f));
}

// the code: exact keys and template prefixes
const exact = new Map();     // keys a t() / tr() call or a *Key field asks for: these must exist
const literals = new Set();  // every dotted string literal: a key that appears nowhere, not even in data, is unused
const prefixes = new Map();
const note = (map, key, f) => { if (!map.has(key)) map.set(key, new Set()); map.get(key).add(relative(root, f)); };
for (const f of codeFiles) {
  const src = readFileSync(f, "utf8");
  for (const m of src.matchAll(/\bt[r]?\(\s*"([^"]+)"/g)) note(exact, m[1], f);
  for (const m of src.matchAll(/\bt[r]?\(\s*`([^`$]+)\$\{/g)) note(prefixes, m[1], f);
  for (const m of src.matchAll(/\b(?:labelKey|descKey|title|hint)\s*:\s*"([a-z][\w-]*(?:\.[\w-]+)+)"/g)) note(exact, m[1], f);
  for (const m of src.matchAll(/"([a-z][\w-]*(?:\.[\w-]+)+)"/g)) literals.add(m[1]);
}

const missing = [...exact.keys()].filter((k) => !defined.has(k)).sort();
const usedByPrefix = (k) => [...prefixes.keys()].some((p) => k.startsWith(p));
const unused = [...defined.keys()].filter((k) => !exact.has(k) && !literals.has(k) && !usedByPrefix(k)).sort();

if (missing.length) {
  console.log(`\nMISSING (${missing.length}) — asked for in the code, not in the dictionary:`);
  for (const k of missing) console.log(`  ${k}   ← ${[...exact.get(k)].join(", ")}`);
}
if (unused.length) {
  console.log(`\nUNUSED (${unused.length}) — in the dictionary, never asked for exactly or by prefix:`);
  for (const k of unused) console.log(`  ${k}   (${defined.get(k)})`);
}
console.log(`\n${defined.size} keys defined · ${exact.size} exact uses · ${prefixes.size} template prefixes · ${missing.length} missing · ${unused.length} unused`);
process.exit(missing.length ? 1 : 0);
