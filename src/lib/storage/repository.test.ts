import "fake-indexeddb/auto"; // installs IDBRequest etc. globals idb relies on
import { IDBFactory } from "fake-indexeddb";
import { strFromU8, unzipSync } from "fflate";
import { beforeEach, describe, expect, it } from "vitest";
import { DATABASE_NAME } from "./db";
import { StorageError, toStorageError } from "./errors";
import { createSavedItemsRepository, type SavedItemsRepository } from "./repository";
import type { SaveInput } from "./schema";

const reflection: SaveInput = {
  kind: "reflection",
  roomId: "journals",
  activityId: "letting-go",
  room: "Healing Journals",
  activity: "Letting go",
  source: "/journals",
  payload: { text: "My private reflection" },
};
// 1x1 transparent PNG
const PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
const artwork: SaveInput = {
  kind: "artwork",
  roomId: "art-room",
  activityId: "stage-1",
  room: "Art Room",
  activity: "Why I Left",
  source: "/art-room",
  payload: { image: PNG },
};

// jsdom's Blob has no arrayBuffer(); read it the way older browsers would.
const bytes = (blob: Blob) =>
  new Promise<Uint8Array>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });

let repo: SavedItemsRepository;
beforeEach(() => {
  globalThis.indexedDB = new IDBFactory(); // fresh, isolated database per test
  repo = createSavedItemsRepository();
});

async function enableSaving() {
  await repo.setPreference("device");
}

describe("saving preference", () => {
  it("has no preference until the visitor chooses", async () => {
    expect(await repo.getPreference()).toBeNull();
  });
  it("enabling saving does not create any items", async () => {
    await enableSaving();
    expect(await repo.getSavedItems()).toEqual([]);
  });
  it("refuses to save without Save on This Device", async () => {
    await expect(repo.saveItem(reflection)).rejects.toMatchObject({ code: "not-enabled" });
    await repo.setPreference("none");
    await expect(repo.saveItem(reflection)).rejects.toMatchObject({ code: "not-enabled" });
    expect(await repo.getSavedItems()).toEqual([]);
  });
  it("turning saving off keeps existing items", async () => {
    await enableSaving();
    await repo.saveItem(reflection);
    await repo.setPreference("none");
    expect(await repo.getSavedItems()).toHaveLength(1);
  });
});

describe("saveItem / getSavedItem", () => {
  beforeEach(enableSaving);
  it("persists an explicitly saved item and survives a new connection (reload)", async () => {
    const saved = await repo.saveItem(reflection);
    expect(saved).toMatchObject({ ...reflection, schemaVersion: 2 });
    const afterReload = createSavedItemsRepository();
    expect(await afterReload.getSavedItem(saved.id)).toEqual(saved);
  });
  it("lists newest first", async () => {
    const a = await repo.saveItem(reflection);
    await new Promise((r) => setTimeout(r, 5));
    const b = await repo.saveItem(artwork);
    expect((await repo.getSavedItems()).map((x) => x.id)).toEqual([b.id, a.id]);
  });
  it("throws not-found for a missing id", async () => {
    await expect(repo.getSavedItem(crypto.randomUUID())).rejects.toMatchObject({
      code: "not-found",
    });
  });
  it.each([
    ["external source URL", { ...reflection, source: "https://evil.example" }],
    ["protocol-relative source", { ...reflection, source: "//evil.example" }],
    ["javascript: source", { ...reflection, source: "javascript:alert(1)" }],
    ["oversized text", { ...reflection, payload: { text: "x".repeat(50_001) } }],
    ["non-image data URL", { ...artwork, payload: { image: "data:text/html;base64,PGI+" } }],
    ["remote image URL", { ...artwork, payload: { image: "https://example.com/a.png" } }],
    ["unknown payload field", { ...reflection, payload: { text: "a", extra: 1 } }],
    ["bad room id", { ...reflection, roomId: "Not A Slug" }],
  ])("rejects %s", async (_label, input) => {
    await expect(repo.saveItem(input as SaveInput)).rejects.toMatchObject({ code: "invalid" });
    expect(await repo.getSavedItems()).toEqual([]);
  });
});

describe("delete", () => {
  beforeEach(enableSaving);
  it("deletes one item", async () => {
    const a = await repo.saveItem(reflection);
    const b = await repo.saveItem(artwork);
    await repo.deleteSavedItem(a.id);
    expect((await repo.getSavedItems()).map((x) => x.id)).toEqual([b.id]);
  });
  it("clears all items but keeps the preference", async () => {
    await repo.saveItem(reflection);
    await repo.saveItem(artwork);
    await repo.clearSavedItems();
    expect(await repo.getSavedItems()).toEqual([]);
    expect(await repo.getPreference()).toBe("device");
  });
});

describe("migration and corrupt data", () => {
  async function seedV1(records: object[]) {
    await new Promise<void>((resolve, reject) => {
      const req = indexedDB.open(DATABASE_NAME, 1);
      req.onupgradeneeded = () => {
        const items = req.result.createObjectStore("items", { keyPath: "id" });
        req.result.createObjectStore("preferences").put("device", "saving");
        records.forEach((r) => items.put(r));
      };
      req.onsuccess = () => {
        req.result.close();
        resolve();
      };
      req.onerror = () => reject(req.error);
    });
  }
  it("migrates Lovable v1 records to v2 on open", async () => {
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    await seedV1([
      {
        id,
        createdAt,
        room: "Calm Room",
        activity: "Breathing exercise",
        source: "/calm-room",
        text: "Done",
      },
      {
        id: crypto.randomUUID(),
        createdAt,
        room: "Art Room",
        activity: "Why I Left",
        source: "/art-room",
        image: PNG,
      },
    ]);
    const items = await repo.getSavedItems();
    expect(items).toHaveLength(2);
    expect(items.find((x) => x.id === id)).toMatchObject({
      schemaVersion: 2,
      kind: "reflection",
      roomId: "calm-room",
      activityId: "breathing-exercise",
      payload: { text: "Done" },
    });
    expect(items.find((x) => x.kind === "artwork")?.payload).toEqual({ image: PNG });
    expect(await repo.getPreference()).toBe("device");
  });
  it("skips corrupt or tampered records instead of failing", async () => {
    const createdAt = new Date().toISOString();
    await seedV1([
      {
        id: crypto.randomUUID(),
        createdAt,
        room: "Calm Room",
        activity: "Ok",
        source: "/calm-room",
        text: "fine",
      },
      {
        id: crypto.randomUUID(),
        createdAt,
        room: "X",
        activity: "Y",
        source: "https://evil.example",
        text: "bad",
      },
      { id: "not-a-uuid", nonsense: true },
    ]);
    const items = await repo.getSavedItems();
    expect(items).toHaveLength(1);
    expect(items[0]?.payload.text).toBe("fine");
  });
});

describe("storage failures", () => {
  it("reports unavailable storage (e.g. private mode) as a typed error", async () => {
    const original = globalThis.indexedDB;
    Object.defineProperty(globalThis, "indexedDB", { value: undefined, configurable: true });
    try {
      const noStorage = createSavedItemsRepository();
      await expect(noStorage.getPreference()).rejects.toMatchObject({ code: "unavailable" });
      await expect(noStorage.saveItem(reflection)).rejects.toBeInstanceOf(StorageError);
    } finally {
      Object.defineProperty(globalThis, "indexedDB", { value: original, configurable: true });
    }
  });
  it("maps QuotaExceededError to quota", () => {
    expect(toStorageError(new DOMException("full", "QuotaExceededError")).code).toBe("quota");
  });
  it("never puts saved content in error messages", async () => {
    const failing = createSavedItemsRepository(async () => {
      throw new Error("My private reflection");
    });
    const error = await failing.getSavedItems().catch((e: unknown) => e);
    expect(String((error as Error).message)).not.toContain("private reflection");
  });
});

describe("exportSavedItems", () => {
  beforeEach(enableSaving);
  it("builds a ZIP with readable HTML, manifest and image files", async () => {
    await repo.saveItem({ ...reflection, payload: { text: "<script>alert(1)</script>" } });
    await new Promise((r) => setTimeout(r, 5)); // distinct createdAt for a stable order
    await repo.saveItem(artwork);
    const blob = await repo.exportSavedItems();
    expect(blob.type).toBe("application/zip");
    const files = unzipSync(await bytes(blob));
    // Newest first, so the artwork (saved last) is item 001.
    expect(Object.keys(files).sort()).toEqual(["images/001.png", "index.html", "manifest.json"]);

    const html = strFromU8(files["index.html"]!);
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).not.toContain("<script>alert");
    expect(html).toContain('src="images/001.png"');

    const manifest = JSON.parse(strFromU8(files["manifest.json"]!));
    expect(manifest.formatVersion).toBe(1);
    expect(manifest.items).toHaveLength(2);
    expect(JSON.stringify(manifest)).not.toContain("base64"); // images live in files, not JSON
    expect(files["images/001.png"]![0]).toBe(0x89); // PNG signature
  });
  it("exports an empty collection without failing", async () => {
    const files = unzipSync(await bytes(await repo.exportSavedItems()));
    expect(strFromU8(files["index.html"]!)).toContain("No saved items.");
  });
});
