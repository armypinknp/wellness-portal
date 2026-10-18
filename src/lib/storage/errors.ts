/**
 * Storage failures carry a category only. Messages are fixed strings so no
 * saved content can leak into logs, toasts or error reporting.
 */
export type StorageErrorCode =
  | "unavailable" // IndexedDB missing, blocked or denied (e.g. some private modes)
  | "quota" // browser storage full
  | "not-enabled" // visitor has not chosen Save on This Device
  | "invalid" // payload failed validation or exceeds size limits
  | "not-found"
  | "unknown";

const messages: Record<StorageErrorCode, string> = {
  unavailable:
    "Browser storage is unavailable or full. Nothing new was saved. You can continue using every Portal activity without saving.",
  quota:
    "Browser storage is unavailable or full. Nothing new was saved. You can continue using every Portal activity without saving.",
  "not-enabled": "Choose Save on This Device before saving an item.",
  invalid: "This item could not be saved because it is too large or incomplete.",
  "not-found": "This saved item is no longer in this browser.",
  unknown: "Something went wrong with browser storage. Nothing new was saved.",
};

export class StorageError extends Error {
  override readonly name = "StorageError";
  constructor(readonly code: StorageErrorCode) {
    super(messages[code]);
  }
}

/** Map any thrown value to a content-free StorageError. */
export function toStorageError(error: unknown): StorageError {
  if (error instanceof StorageError) return error;
  const name = error instanceof DOMException || error instanceof Error ? error.name : "";
  if (name === "QuotaExceededError") return new StorageError("quota");
  if (["SecurityError", "InvalidStateError", "UnknownError", "NotFoundError"].includes(name))
    return new StorageError("unavailable");
  return new StorageError("unknown");
}

export const STORAGE_ERROR = messages.unavailable;
