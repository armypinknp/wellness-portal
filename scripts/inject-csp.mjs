// Adds a hash-only script-src CSP <meta> to the prerendered SPA shell.
//
// TanStack's hydration scripts are inline and change every build, so a static
// header can't list their hashes. Browsers enforce every policy present, so this
// meta policy (strict scripts) combines with the vercel.json header (all other
// directives, incl. frame-ancestors which meta can't set). Result: only this
// build's exact inline scripts run (ADR 0001, S5).
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const file = process.argv[2] ?? "dist/client/_shell.html";
const html = readFileSync(file, "utf8");
if (html.includes('http-equiv="Content-Security-Policy"')) throw new Error("CSP already injected");

const hashes = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(
  ([, body]) => {
    // The HTML parser turns NUL into U+FFFD inside <script>; the browser hashes
    // the parsed text, so hash that. TanStack serializes route ids with a NUL.
    const parsed = body.replaceAll("\u0000", "�");
    return `'sha256-${createHash("sha256").update(parsed).digest("base64")}'`;
  },
);
if (hashes.length === 0) throw new Error("No inline scripts found; check the shell output");

const policy = `script-src 'self' ${hashes.join(" ")}; object-src 'none'; base-uri 'self'`;
writeFileSync(
  file,
  html.replace("<head>", `<head><meta http-equiv="Content-Security-Policy" content="${policy}"/>`),
);
console.log(`CSP meta injected into ${file} (${hashes.length} inline script hashes)`);
