# Contributing

Read `README.md`, `AGENTS.md` and `docs/architecture/0001-audit-and-gap-analysis.md` first.

## Weekly workflow

1. **Monday:** the lead assigns tickets for the week's milestone (Wk1–Wk7) on the project board. Pick only issues in **Ready** that are assigned to you.
2. Move your card to **In progress** and create a branch (see below).
3. Open a draft PR early. Fill in the PR template, including `Closes #N`.
4. When CI is green, mark the PR ready and move the card to **In review**. One approving review is required.
5. The reviewer merges (squash). The card moves to **Done** when the issue closes.
6. **Friday:** anything unfinished goes back to the lead for next week. Blocked? Add the `blocked` label and say on the issue what you are waiting for.

Check "Depends on #N" in the issue before you start: don't begin work whose dependency is still open unless the lead says so.

## Branch naming

`ap-NN-short-slug`, using the backlog ticket number, e.g. `ap-07-saved-items-grouping`. For work with no AP number, use `issue-N-short-slug`.

Never push to `main`; never force-push a shared branch.

## Local checks (same as CI)

```bash
npx -y npm@11 ci        # npm 10 crashes on this tree
npm run typecheck
npm run lint
npm test
npx playwright install chromium
npm run test:e2e
```

Use Node 22.

## Ground rules

- No backend, auth or live analytics. The app is a static SPA.
- All persistence goes through `src/lib/storage/repository.ts`; features use `useSaving()` / `<SaveActions>`.
- Saved content must never reach the network, telemetry, logs, URLs or error messages.
- Don't invent clinical content, partner organizations or translations. Survivor-facing copy needs founder approval (`needs-founder-approval` label); sensitive guidance stays untranslated until an approved translation exists.
- Never paste real survivor data into issues, PRs or screenshots.
