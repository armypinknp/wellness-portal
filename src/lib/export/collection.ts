import { strToU8, zipSync, type Zippable } from "fflate";
import { PRIVACY_WARNING } from "@/lib/privacy-copy";
import { itemImage, itemText, type SavedItem } from "@/lib/storage/schema";

export const EXPORT_FILENAME = "wellness-portal-saved-items.zip";
export const EXPORT_FORMAT_VERSION = 1;

const escapeHtml = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c,
  );

function dataUrlToBytes(dataUrl: string): { bytes: Uint8Array; ext: "png" | "jpg" } {
  const [header = "", base64 = ""] = dataUrl.split(",", 2);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return { bytes, ext: header.includes("image/jpeg") ? "jpg" : "png" };
}

/**
 * Builds the export archive entirely in the browser (ADR 0001, D3):
 * index.html (readable on any device), manifest.json (machine-readable,
 * no image data) and images/*. Nothing is uploaded.
 */
export function buildCollectionZip(items: SavedItem[], exportedAt = new Date()): Blob {
  const files: Zippable = {};
  const manifestItems = items.map((item, n) => {
    const image = itemImage(item);
    let imageFile: string | undefined;
    if (image) {
      const { bytes, ext } = dataUrlToBytes(image);
      imageFile = `images/${String(n + 1).padStart(3, "0")}.${ext}`;
      files[imageFile] = [bytes, { level: 0 }]; // already compressed
    }
    const { payload: _payload, ...meta } = item;
    return { ...meta, text: itemText(item), imageFile };
  });

  const sections = manifestItems
    .map(
      (item) =>
        `<article><h2>${escapeHtml(item.room)} — ${escapeHtml(item.activity)}</h2>` +
        `<p>${escapeHtml(new Date(item.createdAt).toLocaleString())}</p>` +
        (item.text ? `<pre>${escapeHtml(item.text)}</pre>` : "") +
        (item.imageFile ? `<img alt="Saved artwork" src="${escapeHtml(item.imageFile)}">` : "") +
        `</article>`,
    )
    .join("");

  files["index.html"] = strToU8(
    `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width">` +
      `<title>My Saved Items — Wellness Portal</title>` +
      `<style>body{font-family:system-ui;max-width:800px;margin:32px auto;padding:16px}article{border-bottom:1px solid;padding:16px 0}pre{white-space:pre-wrap;overflow-wrap:anywhere;font-family:inherit}img{max-width:100%;background:#eee}</style>` +
      `<h1>My Saved Items</h1><p>${escapeHtml(PRIVACY_WARNING)}</p>${sections || "<p>No saved items.</p>"}</html>`,
  );
  files["manifest.json"] = strToU8(
    JSON.stringify(
      {
        format: "army-pink-wellness-portal-saved-items",
        formatVersion: EXPORT_FORMAT_VERSION,
        exportedAt: exportedAt.toISOString(),
        items: manifestItems,
      },
      null,
      2,
    ),
  );
  return new Blob([zipSync(files) as Uint8Array<ArrayBuffer>], { type: "application/zip" });
}

/** Hand the archive to the visitor: share sheet on touch devices, else a download. */
export async function deliverCollection(blob: Blob) {
  const file = new File([blob], EXPORT_FILENAME, { type: blob.type });
  if (matchMedia("(pointer: coarse)").matches && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: "My Saved Items" });
      return;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
