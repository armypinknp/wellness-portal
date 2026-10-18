import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { collectionBlob, savedItemsStore } from "@/lib/saved-items";

const content = { room: "Art Room", activity: "Artwork", source: "/art-room", text: "My reflection" };
beforeEach(async () => { await savedItemsStore.clear(true); await savedItemsStore.setPreference("none"); });

describe("Explicit browser saving", () => {
  it("does not create personal items when enabling saving", async () => {
    await savedItemsStore.setPreference("device");
    expect(await savedItemsStore.list()).toEqual([]);
  });
  it("does not save when continuing without saving", async () => {
    await expect(savedItemsStore.save(content, "none")).rejects.toThrow();
    expect(await savedItemsStore.list()).toEqual([]);
  });
  it("persists only an explicitly saved snapshot", async () => {
    const saved = await savedItemsStore.save(content, "device");
    expect((await savedItemsStore.list())[0]).toEqual(saved);
    expect(saved.text).toBe("My reflection");
  });
  it("changing preference does not silently delete saved content", async () => {
    await savedItemsStore.save(content, "device");
    await savedItemsStore.setPreference("none");
    expect(await savedItemsStore.preference()).toBe("none");
    expect(await savedItemsStore.list()).toHaveLength(1);
  });
  it("requires confirmation for individual deletion", async () => {
    const saved = await savedItemsStore.save(content, "device");
    await expect(savedItemsStore.remove(saved.id, false)).rejects.toThrow();
    expect(await savedItemsStore.list()).toHaveLength(1);
    await savedItemsStore.remove(saved.id, true);
    expect(await savedItemsStore.list()).toHaveLength(0);
  });
  it("requires confirmation for deleting all items", async () => {
    await savedItemsStore.save(content, "device");
    await expect(savedItemsStore.clear(false)).rejects.toThrow();
    expect(await savedItemsStore.list()).toHaveLength(1);
    await savedItemsStore.clear(true);
    expect(await savedItemsStore.list()).toHaveLength(0);
  });
  it("exports the stored reflection in a nonempty collection", async () => {
    await savedItemsStore.save(content, "device");
    const blob = collectionBlob(await savedItemsStore.list());
    expect(blob.type).toBe("text/html;charset=utf-8");
    expect(blob.size).toBeGreaterThan(0);
  });
  it("reports unavailable browser storage without saving", async () => {
    const original = globalThis.indexedDB;
    Object.defineProperty(globalThis, "indexedDB", { value: undefined, configurable: true });
    try { await expect(savedItemsStore.save(content, "device")).rejects.toThrow("Browser storage is unavailable or full"); }
    finally { Object.defineProperty(globalThis, "indexedDB", { value: original, configurable: true }); }
    expect(await savedItemsStore.list()).toHaveLength(0);
  });
});