import { z } from "zod";

/** Current on-disk record version. Bump with a migration in db.ts. */
export const SCHEMA_VERSION = 2;

export const LIMITS = {
  text: 50_000,
  label: 200,
  // Data URLs are ~1.37x the image size; this caps one artwork at roughly 6 MB.
  imageDataUrl: 8_000_000,
} as const;

/** Stable id from a display label, e.g. "Safety & Stability" -> "safety-stability". */
export const toSlug = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "") || "unknown";

const slug = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

// Only same-origin app paths: saved records are reopened with <Link to>, so a
// tampered record must never be able to point outside the Portal (ADR 0001, S4).
const internalPath = z
  .string()
  .max(300)
  .regex(/^\/(?!\/)[A-Za-z0-9/_-]*$/);

const imageDataUrl = z
  .string()
  .max(LIMITS.imageDataUrl)
  .regex(/^data:image\/(png|jpeg);base64,[A-Za-z0-9+/]+=*$/);

const text = z.string().max(LIMITS.text);

export const savedItemKinds = ["reflection", "artwork", "exercise", "resource"] as const;
export type SavedItemKind = (typeof savedItemKinds)[number];

const common = {
  roomId: slug,
  activityId: slug,
  /** Display labels (English source strings, translated at render). */
  room: z.string().min(1).max(LIMITS.label),
  activity: z.string().min(1).max(LIMITS.label),
  source: internalPath,
};

/** What a feature passes to saveItem(). */
export const saveInputSchema = z.discriminatedUnion("kind", [
  z.object({ ...common, kind: z.literal("reflection"), payload: z.object({ text }).strict() }),
  z.object({
    ...common,
    kind: z.literal("artwork"),
    payload: z.object({ image: imageDataUrl, text: text.optional() }).strict(),
  }),
  z.object({
    ...common,
    kind: z.literal("exercise"),
    payload: z.object({ text: text.optional() }).strict(),
  }),
  z.object({
    ...common,
    kind: z.literal("resource"),
    payload: z.object({ text: text.optional() }).strict(),
  }),
]);
export type SaveInput = z.infer<typeof saveInputSchema>;

const meta = z.object({
  id: z.string().uuid(),
  schemaVersion: z.literal(SCHEMA_VERSION),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const savedItemSchema = z.intersection(saveInputSchema, meta);
export type SavedItem = z.infer<typeof savedItemSchema>;

export type SavingPreference = "device" | "none";
export const savingPreferenceSchema = z.enum(["device", "none"]);

/** Text shown for an item, regardless of kind. */
export function itemText(item: SavedItem): string | undefined {
  return item.payload.text;
}

export function itemImage(item: SavedItem): string | undefined {
  return item.kind === "artwork" ? item.payload.image : undefined;
}
