// Serves dist/client the way Vercel will: rewrite to _shell.html plus the
// global headers from vercel.json, so the build and its CSP can be checked
// locally and by Playwright.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const vercel = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));
const securityHeaders = Object.fromEntries(vercel.headers[0].headers.map((h) => [h.key, h.value]));
const root = new URL("../dist/client/", import.meta.url).pathname;
const port = Number(process.env.PORT ?? 4173);
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".txt": "text/plain" };

createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url ?? "/", "http://x").pathname)).replace(/^(\.\.[/\\])+/, "");
  for (const candidate of [path, "/_shell.html"]) {
    try {
      const body = await readFile(join(root, candidate));
      res.writeHead(200, { ...securityHeaders, "content-type": types[extname(candidate)] ?? "application/octet-stream" });
      return res.end(body);
    } catch { /* fall through to the SPA shell */ }
  }
  res.writeHead(404).end();
}).listen(port, () => console.log(`Serving ${root} on http://localhost:${port}`));
