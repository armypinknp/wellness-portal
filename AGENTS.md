# Notes for AI coding agents

Read `README.md` and `docs/architecture/0001-audit-and-gap-analysis.md` first.

- Frontend-only static SPA: no backend, auth or live analytics.
- All persistence goes through `src/lib/storage/repository.ts`; features call `useSaving()` / `<SaveActions>`.
- Saved content must never reach network, telemetry, logs, URLs or error messages.
- PIN locks/encryption are simulated (`Simulated.tsx`) and must keep their SimulatedBadge.
- Sensitive survivor guidance stays untranslated until an approved translation exists.
- Do not invent clinical content, partner organizations or translations.
