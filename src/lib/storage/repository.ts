import { openPortalDatabase, type PortalDatabase } from "./db";
import { StorageError, toStorageError } from "./errors";
import {
  SCHEMA_VERSION,
  saveInputSchema,
  savedItemSchema,
  savingPreferenceSchema,
  type SaveInput,
  type SavedItem,
  type SavingPreference,
} from "./schema";
import { buildCollectionZip } from "@/lib/export/collection";

/**
 * The single device-only store for everything a visitor explicitly keeps.
 * Nothing here touches the network, analytics or logs (ADR 0001).
 * Confirmation of destructive actions belongs to the UI (SavingProvider).
 */
export interface SavedItemsRepository {
  saveItem(input: SaveInput): Promise<SavedItem>;
  getSavedItems(): Promise<SavedItem[]>;
  getSavedItem(id: string): Promise<SavedItem>;
  deleteSavedItem(id: string): Promise<void>;
  clearSavedItems(): Promise<void>;
  exportSavedItems(): Promise<Blob>;
  getPreference(): Promise<SavingPreference | null>;
  setPreference(value: SavingPreference): Promise<void>;
}

export function createSavedItemsRepository(
  open: (onClose: () => void) => Promise<PortalDatabase> = openPortalDatabase,
): SavedItemsRepository {
  let connection: Promise<PortalDatabase> | undefined;
  const db = () => {
    connection ??= open(() => (connection = undefined)).catch((error) => {
      connection = undefined; // allow a retry after transient failures
      throw error;
    });
    return connection;
  };
  const run = async <T>(operation: (db: PortalDatabase) => Promise<T>): Promise<T> => {
    try {
      return await operation(await db());
    } catch (error) {
      throw toStorageError(error);
    }
  };

  // Corrupt or tampered records are skipped rather than crashing the page.
  const valid = (value: unknown): SavedItem | undefined => {
    const parsed = savedItemSchema.safeParse(value);
    return parsed.success ? parsed.data : undefined;
  };

  const repository: SavedItemsRepository = {
    async saveItem(input) {
      const parsed = saveInputSchema.safeParse(input);
      if (!parsed.success) throw new StorageError("invalid");
      if ((await repository.getPreference()) !== "device") throw new StorageError("not-enabled");
      const now = new Date().toISOString();
      const item: SavedItem = {
        ...parsed.data,
        id: crypto.randomUUID(),
        schemaVersion: SCHEMA_VERSION,
        createdAt: now,
        updatedAt: now,
      };
      // Resolves only after the transaction commits, so success is never premature.
      await run((d) => d.add("items", item));
      return item;
    },
    async getSavedItems() {
      const all = await run((d) => d.getAll("items"));
      return all
        .map(valid)
        .filter((x): x is SavedItem => x !== undefined)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    async getSavedItem(id) {
      const item = valid(await run((d) => d.get("items", id)));
      if (!item) throw new StorageError("not-found");
      return item;
    },
    async deleteSavedItem(id) {
      await run((d) => d.delete("items", id));
    },
    async clearSavedItems() {
      await run((d) => d.clear("items"));
    },
    async exportSavedItems() {
      return buildCollectionZip(await repository.getSavedItems());
    },
    async getPreference() {
      const parsed = savingPreferenceSchema.safeParse(
        await run((d) => d.get("preferences", "saving")),
      );
      return parsed.success ? parsed.data : null;
    },
    async setPreference(value) {
      await run((d) => d.put("preferences", value, "saving"));
    },
  };
  return repository;
}

export const savedItemsRepository = createSavedItemsRepository();
