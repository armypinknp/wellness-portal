# Army Pink Wellness Portal

A trauma-informed, anonymous wellness portal for survivors of domestic violence.
No accounts, no backend. Visitors can choose to save items in their own browser
(IndexedDB) only.

- Stack: React 19 · TanStack Start (SPA mode) · Vite 8 · Tailwind v4 · shadcn/ui · Zod · idb
- Hosting: Vercel (static output, see `vercel.json`)
- Architecture & decisions: [`docs/architecture/0001-audit-and-gap-analysis.md`](docs/architecture/0001-audit-and-gap-analysis.md)

## Local development

Requires **Node 22+ and npm 11+** (npm 10 crashes resolving this dependency tree).

```sh
npm install -g npm@11   # once
npm ci
npm run dev             # http://localhost:3000
```

| Script              | Purpose                                                                 |
| ------------------- | ----------------------------------------------------------------------- |
| `npm run dev`       | Dev server with hot reload                                              |
| `npm run build`     | Static production build → `dist/client`                                 |
| `npm run preview`   | Serve the build like Vercel does (rewrites + security headers) on :4173 |
| `npm run typecheck` | TypeScript, strict                                                      |
| `npm run lint`      | ESLint + Prettier                                                       |
| `npm run format`    | Apply Prettier                                                          |
| `npm test`          | Vitest unit + component tests                                           |

## Where things live

| Path                                 | What                                                                                               |
| ------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `src/routes/`                        | One file per page (TanStack file routes). Keep routes thin.                                        |
| `src/components/portal/`             | Shared Portal UI: Shell (header, Quick Exit, language), PrivacyChoice, SaveActions, SavingProvider |
| `src/components/ui/`                 | shadcn/Radix primitives                                                                            |
| `src/lib/storage/`                   | **The only code that touches IndexedDB**: schema (Zod), db (migrations), repository, typed errors  |
| `src/lib/export/`                    | Client-side ZIP export of My Saved Items                                                           |
| `src/lib/analytics.ts`               | Deliberate no-op until the Analytics Event Dictionary is approved                                  |
| `src/lib/prefs.tsx`, `src/lib/es.ts` | Language prefs and (draft) Spanish strings                                                         |
| `src/data/portal.ts`                 | Placeholder content (to become typed JSON, ticket AP-13)                                           |

## Saving an item from a feature

Use `<SaveActions item={...} />`. Never write to storage directly.

```tsx
<SaveActions
  item={{
    kind: "reflection", // reflection | artwork | exercise | resource
    roomId: "journals", // kebab-case slug
    activityId: "letting-go",
    room: "Healing Journals", // English display label (translated at render)
    activity: "Letting go",
    source: "/journals", // internal path used by "Return to activity"
    payload: { text },
  }}
/>
```

## Privacy rules for contributors

- Never send saved content, typed text, artwork or search terms to the network, analytics, logs or error messages.
- Never put personal content in URLs or query strings.
- Saving happens only when the visitor clicks Save. No autosave of reflections or drawings.
- Destructive actions need a confirmation dialog.
- No `dangerouslySetInnerHTML` with user content.
- No new third-party requests (fonts, CDNs, embeds): the CSP in `vercel.json` blocks them.
