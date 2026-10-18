export type SavingPreference = "device" | "none";
export type SavedContent = {
  room: string;
  activity: string;
  source: string;
  text?: string;
  image?: string;
};
export type SavedItem = SavedContent & { id: string; createdAt: string };

export const PRIVACY_WARNING =
  "Saved items stay in this browser on this device. Anyone with access to this device or browser may be able to view them. Clearing browser data may erase them. Avoid saving sensitive content on a shared or monitored device.";
export const STORAGE_ERROR =
  "Browser storage is unavailable or full. Nothing new was saved. You can continue using every Portal activity without saving.";

const DATABASE = "wellness-portal-saved-items";
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") return reject(new Error(STORAGE_ERROR));
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore("items", { keyPath: "id" });
      request.result.createObjectStore("preferences");
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error(STORAGE_ERROR));
    request.onblocked = () => reject(new Error(STORAGE_ERROR));
  });
}

async function transaction<T>(
  store: string,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, mode);
    const request = operation(tx.objectStore(store));
    tx.oncomplete = () => {
      db.close();
      resolve(request.result);
    };
    tx.onabort = tx.onerror = () => {
      db.close();
      reject(new Error(STORAGE_ERROR));
    };
  });
}

export const savedItemsStore = {
  async preference(): Promise<SavingPreference | null> {
    const value = await transaction<unknown>("preferences", "readonly", (s) => s.get("saving"));
    return value === "device" || value === "none" ? value : null;
  },
  async setPreference(value: SavingPreference) {
    await transaction("preferences", "readwrite", (s) => s.put(value, "saving"));
  },
  async list(): Promise<SavedItem[]> {
    const items = await transaction<SavedItem[]>("items", "readonly", (s) => s.getAll());
    return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async save(content: SavedContent, preference: SavingPreference | null): Promise<SavedItem> {
    if (preference !== "device")
      throw new Error("Choose Save on This Device before saving an item.");
    const item = { ...content, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    await transaction("items", "readwrite", (s) => s.add(item));
    return item;
  },
  async remove(id: string, confirmed: boolean) {
    if (!confirmed) throw new Error("Deletion needs confirmation.");
    await transaction("items", "readwrite", (s) => s.delete(id));
  },
  async clear(confirmed: boolean) {
    if (!confirmed) throw new Error("Deletion needs confirmation.");
    await transaction("items", "readwrite", (s) => s.clear());
  },
};

export function collectionBlob(items: SavedItem[]): Blob {
  // A self-contained, readable collection; images are embedded, never remotely loaded.
  const escape = (s: string) =>
    s.replace(
      /[&<>"']/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c,
    );
  const sections = items
    .map(
      (item) =>
        `<article><h2>${escape(item.room)} — ${escape(item.activity)}</h2><p>${escape(item.createdAt)}</p><pre>${escape(item.text ?? "")}</pre>${item.image?.startsWith("data:image/png;base64,") ? `<img alt="Saved artwork" src="${escape(item.image)}">` : ""}</article>`,
    )
    .join("");
  return new Blob(
    [
      `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>My Saved Items — Wellness Portal</title><style>body{font-family:system-ui;max-width:800px;margin:32px auto;padding:16px}article{border-bottom:1px solid;padding:16px 0}pre{white-space:pre-wrap;overflow-wrap:anywhere;font-family:inherit}img{max-width:100%;background:#eee}</style><h1>My Saved Items</h1><p>${escape(PRIVACY_WARNING)}</p>${sections}</html>`,
    ],
    { type: "text/html;charset=utf-8" },
  );
}

export async function deliverCollection(blob: Blob) {
  const file = new File([blob], "wellness-portal-saved-items.html", { type: blob.type });
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
