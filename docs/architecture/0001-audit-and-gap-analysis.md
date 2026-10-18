# 0001 — Lovable Codebase Audit & Gap Analysis

Date: 2026-10-18 · Source: `ap-wellnessportal-prototype.zip` · Reference: *WP Project Plan (18 Oct 2026)*

## 1. Existing codebase audit

### Stack (as exported)

| Concern | Found | Notes |
|---|---|---|
| Framework | **TanStack Start 1.168** (React 19 + Vite 8, SSR via Nitro 3 beta) | Not plain React/Vite SPA. File-based routes in `src/routes`, generated `routeTree.gen.ts`. |
| Build config | `@lovable.dev/vite-tanstack-config` | Lovable wrapper hides plugin list. **Nitro preset defaults to `cloudflare-module`** — not Vercel. |
| Language | TypeScript, `strict: true` | Typecheck fails only in one test file (missing `@testing-library/dom` peer). |
| Styling | Tailwind v4 + shadcn/ui (Radix) + custom tokens in `src/styles.css` | 46 shadcn components; most unused. Keep. |
| State | React context: `PrefsProvider` (lang/theme), `SavingProvider` (saving) | Matches plan's "context + hooks". |
| Persistence | Raw IndexedDB API in `src/lib/saved-items.ts` | Works; no `idb`, no schema version, no validation, no migrations. |
| Content | TypeScript constants in `src/data/portal.ts` + inline arrays in routes | Plan requires typed JSON. |
| i18n | `useT()` keyed UI dict (`prefs.tsx`) + `useTx()` English-string-keyed dict (`es.ts`, draft Spanish) | Works; English-as-key is fragile but functional. |
| Analytics | `src/lib/analytics.ts` — deliberate no-op `track()` with typed event names | Good foundation for allowlist adapter. |
| Tests | Vitest + RTL + `fake-indexeddb`; 3 files | 9 tests pass; 1 file fails to load (missing peer dep). No Playwright, no axe, no CI. |
| Lint | ESLint 9 + Prettier | **745 problems** (730 auto-fixable Prettier formatting). |
| Package manager | `bun.lock` committed; `npm install` crashes (`edgesOut`) unless `--legacy-peer-deps` | Pick one manager. |

### Baseline results (executed 2026-10-18, Node 22.21.1)

- `npm install --legacy-peer-deps` — OK (plain `npm install` fails).
- `tsc --noEmit` — 3 errors, all in `src/test/saving-provider.test.tsx`.
- `vitest run` — 2 files / 9 tests pass, 1 file fails to import.
- `eslint .` — 730 errors, 15 warnings.
- `vite build` — succeeds, output is a **Cloudflare Worker** bundle (`.wrangler/`, `.output/`).

### Routes already implemented (22)

`/` (landing + 7-step intro overlay) · `/art-room` (3-stage canvas, basic brush/eraser/undo, save) · `/gallery` (art carousel) · `/calm-room`, `/calm-room/$id` · `/recovery-rooms`, `/recovery-rooms/$slug` · `/library`, `/library/$category`, `/resource/$id` · `/not-broken`, `/not-broken/$module` · `/opportunities`, `/opportunities/$id` · `/partners`, `/partner-sessions` · `/journals` · `/decision-support` · `/toolkit` · `/saved-items` · `/privacy`

### What already works

- **YOUR PRIVACY, YOUR CHOICE** screen with exactly *Save on This Device* / *Continue Without Saving* and the device-visibility/clearing warning (`PrivacyChoice.tsx`). No Skip on that step.
- Shared `SaveActions` component; saving is explicit only; prompts for privacy choice if not yet enabled.
- My Saved Items: list, room filter, open, delete one, delete all (AlertDialog confirm), HTML export download (Web Share on touch devices), change saving choice.
- Storage failure falls back to non-saving mode with a content-free message.
- Quick Exit button (header + floating) and Esc key → `location.replace(weather.com)`; privacy page correctly says it does not erase history.
- Shell: skip link, language toggle (EN/ES), mobile nav, status tags (Confirmed / Provisional / Placeholder / Needs approval).
- `robots: noindex`.

### Placeholder / incomplete

- All library resources, calm media, modules, opportunities, partners are generated sample data.
- Art Room prompts are placeholders; canvas is basic.
- PIN lock / encryption is simulated (`Simulated.tsx`, clearly badged).
- Intro video placeholder. FAQ answers "need approval". "99+ resources" count is placeholder.

## 2. Architecture gap analysis

| Plan requirement | Current state | Gap |
|---|---|---|
| Retain React framework | TanStack Start (React) | ✅ Retain. SSR is not needed; see Decision D1. |
| Vercel hosting | Nitro Cloudflare preset | ❌ Configure Vercel preset or SPA/static output. |
| IndexedDB via `idb`, versioned schema | Raw IDB, v1, untyped records | ❌ Rewrite internals behind same provider API. |
| `SavedItem` with `schemaVersion`, `kind`, `roomId`, `activityId`, `updatedAt`, `payload` | `{room, activity, source, text, image}` (display strings) | ❌ New contract + migration from v1 records. |
| Repository: save/get/list/delete/clear/export | list/save/remove/clear (no get, export separate) | ⚠️ Extend. |
| Zod validation, payload/size limits | None | ❌ Add. |
| Typed errors (unavailable, quota, corrupt, not-enabled) | Single generic string | ❌ Add. |
| Export: ZIP with manifest + JSON/text + images | Single self-contained HTML file | ⚠️ Decision D3. |
| Content as typed JSON, `content/{en,es}` | TS constants, inline arrays | ❌ Phase 3 migration. |
| Feature folders `features/*`, `lib/{storage,analytics,validation,export}` | Flat `components/portal`, `lib` | ⚠️ Incremental move. |
| Analytics allowlist adapter | Typed no-op | ⚠️ Add enum props + tests; keep disabled. |
| Security headers / CSP | None | ❌ `vercel.json` headers. |
| Playwright, axe, CI | None | ❌ Add. |
| No third-party requests | Google Fonts loaded from googleapis | ❌ Self-host Montserrat. |
| Quick Exit | Works; Esc is global | ⚠️ Esc also closes dialogs → accidental exits. Decision D4. |
| Error reporting free of content | Lovable reporter + global `console.error` override | ❌ Remove Lovable telemetry hooks for production. |

## 3. Security findings

| # | Severity | Finding | Fix |
|---|---|---|---|
| S1 | High | `lovable-error-reporting.ts` forwards errors + pathname to `window.__lovableEvents` / `__lovableReportRuntimeError`. Only active in Lovable editor, but it is a telemetry path. | Remove from production build; replace with sanitized local error category. |
| S2 | High | `error-capture.ts` monkey-patches global `console.error` and serializes full error causes/objects (could include payloads). | Remove (SSR-only diagnostic for Lovable); if SSR kept, log error codes only. |
| S3 | Medium | Google Fonts fetched from third party on every visit (IP + referrer to Google) — contradicts footer "No trackers". | Self-host font files. |
| S4 | Medium | Saved-item `source` from IndexedDB is passed to `<Link to>`; `image` to `<img src>` with no validation. Tampered/corrupt records could point anywhere. | Zod-validate on read; `source` must be an internal path; image must be `data:image/png|jpeg` or Blob. |
| S5 | Medium | No CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors`. | `vercel.json` headers (strict CSP feasible once fonts self-hosted). |
| S6 | Medium | Global Esc → Quick Exit fires while a dialog/select is open or while typing in a reflection. Risk of losing unsaved work and confusing UX. | Founder decision; suggestion: ignore Esc when a dialog is open or a text field is focused, or use double-Esc. |
| S7 | Low | `localStorage` stores `wp-lang`/`wp-theme`; `sessionStorage` stores intro-seen. Non-sensitive but reveals Portal use on a shared device. | Document in privacy page; consider only persisting when saving enabled. |
| S8 | Low | Quick Exit destination hard-coded (weather.com), unapproved. | Move to config; get approval. |
| S9 | Low | `dangerouslySetInnerHTML` used only in shadcn `chart.tsx` (unused). Export HTML escapes all fields. | Delete unused shadcn components or leave; export ✅. |
| S10 | Info | No secrets found in repo. `.gitignore` covers `.env*.local`-style `*.local`, `.dev.vars`. | Add explicit `.env*`. |
| S11 | Info | `@tanstack/react-query`, `recharts`, `input-otp`, `react-day-picker`, `cmdk`, etc. unused. | Prune to shrink attack surface. |

## 4. Decisions needed (before/while implementing)

- **D1 – Deployment mode.** Recommended: keep TanStack Start but build as **SPA/static (prerender) for Vercel** — no server needed, simplest CSP, no Nitro beta at runtime. Alternative: Nitro `vercel` preset (keeps SSR). *Not a framework migration*, but a build-target change — needs your OK.
- **D2 – Lovable sync.** The repo is Lovable-connected. Moving away from `@lovable.dev/vite-tanstack-config` breaks Lovable editing. Recommended: keep the wrapper for now, override the Nitro preset; decide later whether Lovable stays the prototyping tool on a separate branch.
- **D3 – Export format.** Current HTML file is readable by survivors on any device without unzipping. Plan proposes ZIP. Recommended: ZIP containing `index.html` (current readable view) + `manifest.json` + images — adds one dependency (`fflate`, ~8 kB).
- **D4 – Esc key behaviour** (S6).
- **D5 – Disable-saving semantics.** Current behaviour matches plan proposal (keep existing items until deleted). Needs founder copy approval.
- **D6 – Intro "skip" links.** Earlier intro steps have Skip, which jumps to the privacy choice (no bypass of the choice). Confirm this satisfies "remove separate Skip".

### Decisions recorded 2026-10-18

| ID | Decision |
|---|---|
| D1 | **Static SPA** on Vercel. Keep TanStack Router/React and drop SSR/Nitro from production. |
| D2 | **Detach from Lovable now.** Replace `@lovable.dev/vite-tanstack-config` with an explicit Vite config and remove the Lovable-only files (`.lovable/`, error reporter, AGENTS.md Lovable block). |
| D3 | **ZIP export**: readable `index.html` + `manifest.json` + image files (`fflate`). |
| D4 | **Esc exits except** when a dialog is open (Esc closes it) or a text field/canvas has focus. The Quick Exit button always works. |
| D5 | Switching to Continue Without Saving while items exist shows a **confirmation: "Keep my saved items" / "Delete them now"** (delete still confirmed). Copy needs founder approval. |
| D6 | Intro Skip links stay and are renamed **"Skip intro"**. They always lead to the privacy choice. |

## 5. Proposed changes

**Preserve:** all 22 routes and URLs, visual design/tokens, Shell, PrivacyChoice, SaveActions API shape, SavingProvider/`useSaving()` API, My Saved Items UI, status tags, analytics event names, existing tests.

**Refactor:** `saved-items.ts` → `lib/storage/` (idb, schema v2, Zod, typed errors, migration v1→v2); content constants → typed JSON (Phase 3); move portal components into `features/*` gradually.

**Implement:** `getSavedItem`, `exportSavedItems`, Vercel config + headers, Playwright + axe, CI workflow, self-hosted font.

**Remove:** Lovable error-reporting/console override from production path, Cloudflare/wrangler build target, unused dependencies (after confirmation).

## 6. Implementation backlog

| ID | Pri | Workstream | Ticket | Acceptance criteria |
|---|---|---|---|---|
| AP-01 | P0 | Platform | Repo bootstrap | Code pushed to feature branch on GitHub; one package manager; `npm ci` works; README rewritten for volunteers. |
| AP-02 | P0 | Platform | Fix tooling baseline | `typecheck`, `lint`, `test`, `build` all green; Prettier applied in one isolated commit. |
| AP-03 | P0 | Platform | Vercel build target (D1) | `vercel build` succeeds; preview deploy renders all 22 routes; deep-link refresh works. |
| AP-04 | P0 | Storage | `SavedItem` v2 contract + Zod | `schemaVersion`, `kind`, `roomId`, `activityId`, timestamps, per-kind payload; 2 MB image cap; unit tests. |
| AP-05 | P0 | Storage | idb repository | `saveItem/getSavedItems/getSavedItem/deleteSavedItem/clearSavedItems/exportSavedItems`; v1→v2 migration; typed errors for unavailable/quota/corrupt/not-enabled; corrupt records skipped not crashing. |
| AP-06 | P0 | Storage | SavingProvider on repository | Existing `useSaving()` consumers unchanged; success only after transaction resolves. |
| AP-07 | P1 | Saved | My Saved Items upgrade | Group by room+activity; reopen via validated internal path; empty/error states; RTL tests. |
| AP-08 | P1 | Saved | Export (D3) | Download built client-side; Playwright asserts zero network requests during export. |
| AP-09 | P1 | Security | Remove Lovable telemetry & console override; self-host font; `vercel.json` headers | No third-party requests on load (Playwright network check); securityheaders grade A. |
| AP-10 | P1 | QA | Playwright + axe | E2E: anonymous nav, save, reload/reopen, delete, export, Quick Exit; axe zero serious/critical on all routes. |
| AP-11 | P1 | Platform | GitHub Actions CI + branch protection | PR runs typecheck/lint/unit/e2e; `main` protected. |
| AP-12 | P2 | Analytics | Allowlist adapter | Enum-only props, rejects unknown events/free text; stays no-op until dictionary approved. |
| AP-13 | P2 | Content | Typed JSON content + loaders | `content/{en,es}/*.json` validated by Zod at build/test; `data/portal.ts` removed. |
| AP-14 | P2 | Rooms | Recovery/Calm/Journals use shared SaveButton + `kind` | ≥2 rooms save via repository (plan acceptance). |
| AP-15 | P2 | i18n | Key-based translations | No English-as-key for new strings; ES review flag per string. |
| AP-16 | P3 | Art Room | Full canvas experience | After AP-04–08 stable; Blob storage; reduced motion; keyboard alternative. |

## 7. Recommended file structure (based on actual code)

```
src/
  routes/                 # unchanged TanStack file routes (thin: compose features)
  components/
    ui/                   # shadcn primitives (keep)
    layout/               # Shell, PageShell, Header, Footer, QuickExit, LangToggle
    privacy/              # PrivacyChoice, PrivacyWarning, SaveActions
  features/
    saved/  art-room/  calm-room/  recovery/  library/  learning/  opportunities/  journals/
  content/en/*.json  content/es/*.json
  lib/
    storage/              # db.ts (idb), schema.ts (zod), repository.ts, errors.ts, migrations
    export/               # collection export
    analytics/            # allowlist adapter
    i18n/                 # prefs, dictionaries
  test/                   # unit + component (vitest)
e2e/                      # playwright
docs/architecture/  docs/decisions/  docs/runbooks/
```

## 8. Workstreams & dependencies

1. **Foundation & shared components** (AP-01–03, layout move) → unblocks everyone.
2. **IndexedDB & My Saved Items** (AP-04–08) → depends on 1; contract (AP-04) unblocks 3–5.
3. **Recovery Rooms & Calm Room** (AP-14) → needs AP-06.
4. **Library, learning, Opportunities** (AP-13) → needs content schema; independent of storage except bookmarks.
5. **Art Room** (AP-16) → needs 2 complete.
6. **Security, a11y, testing, deploy** (AP-09–12) → starts with 1, runs continuously.
