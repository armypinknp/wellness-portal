import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import { SCHEMA_VERSION, toSlug, type SavedItem, type SavingPreference } from "./schema";
import { StorageError, toStorageError } from "./errors";

export const DATABASE_NAME = "wellness-portal-saved-items";
/** IndexedDB version. v1 = Lovable prototype records; v2 = typed SavedItem. */
export const DATABASE_VERSION = 2;

interface PortalDB extends DBSchema {
  items: { key: string; value: SavedItem; indexes: { roomId: string; createdAt: string } };
  preferences: { key: "saving"; value: SavingPreference };
}
export type PortalDatabase = IDBPDatabase<PortalDB>;

/** Shape written by the Lovable prototype (database version 1). */
type V1Item = {
  id: string;
  createdAt: string;
  room: string;
  activity: string;
  source: string;
  text?: string;
  image?: string;
};

const isV1Item = (v: unknown): v is V1Item => {
  const r = v as Partial<Record<keyof V1Item, unknown>> | null;
  return (
    typeof r?.id === "string" &&
    typeof r.createdAt === "string" &&
    typeof r.room === "string" &&
    typeof r.activity === "string" &&
    typeof r.source === "string"
  );
};

export function migrateV1Item(old: V1Item): SavedItem {
  const base = {
    id: old.id,
    schemaVersion: SCHEMA_VERSION,
    createdAt: old.createdAt,
    updatedAt: old.createdAt,
    roomId: toSlug(old.room),
    activityId: toSlug(old.activity),
    room: old.room,
    activity: old.activity,
    source: old.source,
  } as const;
  return old.image
    ? {
        ...base,
        kind: "artwork",
        payload: { image: old.image, ...(old.text ? { text: old.text } : {}) },
      }
    : { ...base, kind: "reflection", payload: { text: old.text ?? "" } };
}

export async function openPortalDatabase(onClose?: () => void): Promise<PortalDatabase> {
  if (typeof indexedDB === "undefined") throw new StorageError("unavailable");
  try {
    const db: PortalDatabase = await openDB<PortalDB>(DATABASE_NAME, DATABASE_VERSION, {
      async upgrade(db, oldVersion, _newVersion, tx) {
        if (oldVersion < 1) {
          db.createObjectStore("items", { keyPath: "id" });
          db.createObjectStore("preferences");
        }
        if (oldVersion < 2) {
          const items = tx.objectStore("items");
          items.createIndex("roomId", "roomId");
          items.createIndex("createdAt", "createdAt");
          if (oldVersion === 1) {
            for (let cursor = await items.openCursor(); cursor; cursor = await cursor.continue()) {
              // Unreadable records are left as-is; reads skip anything invalid.
              const value: unknown = cursor.value;
              if (isV1Item(value)) await cursor.update(migrateV1Item(value));
            }
          }
        }
      },
      // A newer Portal version in another tab needs to upgrade: step aside.
      blocking() {
        db.close();
        onClose?.();
      },
      terminated: () => onClose?.(),
    });
    return db;
  } catch (error) {
    throw toStorageError(error);
  }
}
