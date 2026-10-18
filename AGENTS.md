<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

## Wellness Portal prototype

- Frontend-only clickable prototype: no backend, auth, or live analytics — client requirements forbid them at this stage.
- `src/lib/analytics.ts` `track()` is a deliberate no-op; call sites mark future events so wiring later is one change.
- UI strings live in the `src/lib/prefs.tsx` dictionary; feature text is translated via `useTx()` with draft Spanish in `src/lib/es.ts` (falls back to English). Sensitive survivor guidance stays untranslated until approved.
- Shared chrome (Quick Exit, language, theme, status tags) lives in `src/components/portal/Shell.tsx`; page content data in `src/data/portal.ts`.
- PIN locks, encryption and full offline operation are simulated via `src/components/portal/Simulated.tsx` (in-memory PIN, nothing stored) and must always show a SimulatedBadge — prototype must not imply real security.

- Optional personal-content saving uses IndexedDB behind SavingProvider and explicit SaveActions only; never send saved content to telemetry or network, because visitors must control device-only retention. Saved snapshots reopen in My Saved Items; source links return to the original activity without restoring security simulations.
- Saving context identity survives hot refresh; missing-provider states allow no-save exploration but refuse writes/deletions, so remounts cannot blank the Portal or falsely report successful storage.
