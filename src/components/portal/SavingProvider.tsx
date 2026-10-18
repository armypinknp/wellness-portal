import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { STORAGE_ERROR, toStorageError } from "@/lib/storage/errors";
import { savedItemsRepository, type SavedItemsRepository } from "@/lib/storage/repository";
import type { SaveInput, SavedItem, SavingPreference } from "@/lib/storage/schema";

type SavingContext = {
  ready: boolean;
  preference: SavingPreference | null;
  items: SavedItem[];
  error: string;
  choose: (value: SavingPreference) => Promise<boolean>;
  save: (input: SaveInput) => Promise<void>;
  remove: (id: string | null, confirmed: boolean) => Promise<void>;
  exportCollection: () => Promise<Blob>;
};
// Keep the same context identity when this module is refreshed while the root
// provider is still mounted. Otherwise refreshed consumers lose their provider.
const Context =
  (import.meta.hot?.data?.savingContext as
    ReturnType<typeof createContext<SavingContext | null>> | undefined) ??
  createContext<SavingContext | null>(null);
if (import.meta.hot?.data) import.meta.hot.data.savingContext = Context;

const DELETE_ERROR =
  "Could not delete saved items. They may still be in this browser. Please try again.";

export function SavingProvider({
  children,
  repository = savedItemsRepository,
}: {
  children: ReactNode;
  repository?: SavedItemsRepository;
}) {
  const [ready, setReady] = useState(false);
  const [preference, setPreference] = useState<SavingPreference | null>(null);
  const [items, setItems] = useState<SavedItem[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    Promise.all([repository.getPreference(), repository.getSavedItems()])
      .then(([p, saved]) => {
        if (active) {
          setPreference(p);
          setItems(saved);
        }
      })
      .catch(() => {
        if (active) setError(STORAGE_ERROR);
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, [repository]);

  const value: SavingContext = {
    ready,
    preference,
    items,
    error,
    choose: async (next) => {
      try {
        await repository.setPreference(next);
        setPreference(next);
        setError("");
        return true;
      } catch {
        setError(STORAGE_ERROR);
        // Storage failure must never block exploring without saving.
        if (next === "none") {
          setPreference("none");
          return true;
        }
        return false;
      }
    },
    save: async (input) => {
      try {
        const item = await repository.saveItem(input);
        setItems((old) => [item, ...old]);
        setError("");
      } catch (e) {
        const storageError = toStorageError(e);
        setError(storageError.message);
        throw storageError;
      }
    },
    remove: async (id, confirmed) => {
      if (!confirmed) return;
      try {
        if (id) await repository.deleteSavedItem(id);
        else await repository.clearSavedItems();
        setItems((old) => (id ? old.filter((x) => x.id !== id) : []));
        setError("");
      } catch {
        setError(DELETE_ERROR);
        throw new Error(DELETE_ERROR);
      }
    },
    exportCollection: () => repository.exportSavedItems(),
  };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useSaving() {
  const context = useContext(Context);
  const [temporaryPreference, setTemporaryPreference] = useState<SavingPreference | null>(null);
  // Fail closed during remounts or isolated previews: exploration still works,
  // but never claim a save/deletion succeeded without an active provider.
  const unavailable: SavingContext = {
    ready: true,
    preference: temporaryPreference,
    items: [],
    error:
      "Saving is temporarily unavailable. You can continue without saving or reload the page to try again.",
    choose: async (value) => {
      if (value !== "none") return false;
      setTemporaryPreference("none");
      return true;
    },
    save: async () => {
      throw new Error(STORAGE_ERROR);
    },
    remove: async () => {
      throw new Error(
        "Deletion is temporarily unavailable. Your saved items have not been deleted.",
      );
    },
    exportCollection: async () => {
      throw new Error(STORAGE_ERROR);
    },
  };
  return context ?? unavailable;
}
