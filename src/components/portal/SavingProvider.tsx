import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  savedItemsStore,
  STORAGE_ERROR,
  type SavedContent,
  type SavedItem,
  type SavingPreference,
} from "@/lib/saved-items";

type SavingContext = {
  ready: boolean;
  preference: SavingPreference | null;
  items: SavedItem[];
  error: string;
  choose: (value: SavingPreference) => Promise<boolean>;
  save: (content: SavedContent) => Promise<void>;
  remove: (id: string | null, confirmed: boolean) => Promise<void>;
};
// Keep the same context identity when this module is refreshed while the root
// provider is still mounted. Otherwise refreshed consumers lose their provider.
const Context =
  (import.meta.hot?.data?.savingContext as
    ReturnType<typeof createContext<SavingContext | null>> | undefined) ??
  createContext<SavingContext | null>(null);
if (import.meta.hot?.data) import.meta.hot.data.savingContext = Context;

export function SavingProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [preference, setPreference] = useState<SavingPreference | null>(null);
  const [items, setItems] = useState<SavedItem[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    Promise.all([savedItemsStore.preference(), savedItemsStore.list()])
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
  }, []);
  const choose = async (value: SavingPreference) => {
    try {
      await savedItemsStore.setPreference(value);
      setPreference(value);
      setError("");
      return true;
    } catch {
      setError(STORAGE_ERROR);
      if (value === "none") {
        setPreference("none");
        return true;
      }
      return false;
    }
  };
  const save = async (content: SavedContent) => {
    try {
      const item = await savedItemsStore.save(content, preference);
      setItems((old) => [item, ...old]);
      setError("");
    } catch {
      setError(STORAGE_ERROR);
      throw new Error(STORAGE_ERROR);
    }
  };
  const remove = async (id: string | null, confirmed: boolean) => {
    if (!confirmed) return;
    try {
      if (id) await savedItemsStore.remove(id, true);
      else await savedItemsStore.clear(true);
      setItems((old) => (id ? old.filter((x) => x.id !== id) : []));
      setError("");
    } catch {
      setError(
        "Could not delete saved items. They may still be in this browser. Please try again.",
      );
      throw new Error("Could not delete saved items.");
    }
  };
  return (
    <Context.Provider value={{ ready, preference, items, error, choose, save, remove }}>
      {children}
    </Context.Provider>
  );
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
  };
  return context ?? unavailable;
}
