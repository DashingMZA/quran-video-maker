# CLAUDE.md — Quran Studio (Claude Code operating manual)

Companion to `AGENTS.md` (shared rules) and `MEMORY.md` (project history).
Read all three before acting.

## A. Startup protocol

1. Read `AGENTS.md`, then `MEMORY.md` (check "Current Project State" and
   "In-Progress Work" — another session may have left work half-done).
2. Run `git status -sb` and `git log --oneline -5`. Note the branch
   (**`master`**, not `main`) and any uncommitted changes — inspect them
   before editing anything nearby.
3. Check whether `MEMORY.md` already records the requested work (completed,
   in progress, or failed). Don't redo it blind.
4. Locate the implementation, configs, and any tests touching the task
   area (see directory map in `MEMORY.md` §3).
5. Confirm the package manager state: `pnpm --version` should be 12.9.1,
   `node --version` ≥ 24, `pnpm-lock.yaml` present and in sync
   (`pnpm install --frozen-lockfile` must succeed in CI).

## B. Project knowledge

- **What it is:** client-side Quran recitation video studio. React 19 +
  Vite + TS (strict) + Tailwind 3 + Tauri 2 desktop shell. No backend, no
  DB, no auth.
- **Verified versions:** pnpm 12.9.1 · node ≥ 24 · react 19.3.1 ·
  vite 8.3.4 · typescript 6.0.3 · tailwindcss 3.4.x · tauri apps/api 2.12.x ·
  mediabunny 1.61.6 · lucide-react 1.58.0 (no brand icons) · vitest 5.
  Don't assume other versions; check `package.json` when in doubt.
- **Key files:** `package.json` (scripts), `vite.config.ts` (dev port
  3000), `tsconfig.json` (strict; note the `types` array),
  `src-tauri/tauri.conf.json` (installer metadata + updater),
  `src-tauri/src/main.rs` (`get_app_export_path` command; updater + process plugins),
  `scripts/fetch-ffmpeg.mjs` / `prepare-ffmpeg.mjs` (sidecar download),
  `.github/workflows/release.yml` (tag-triggered desktop release),
  `.env.example` (placeholders only), `src/config/app-info.json`
  (displayed name/version/author/social links).
- **Commands:**
  - `pnpm install` / `pnpm dev` (http://localhost:3000) / `pnpm build`
    (`tsc --noEmit && vite build`) / `pnpm preview`
  - `pnpm typecheck` · `pnpm lint` (`--max-warnings 0`) · `pnpm format`
  - `pnpm test` / `pnpm test:watch` (vitest; currently zero test files)
  - `pnpm fetch:ffmpeg` / `pnpm prepare:ffmpeg` (downloads platform
    ffmpeg/ffprobe into `src-tauri/binaries/`, gitignored)
  - `pnpm app:dev` / `pnpm app:build` (need Rust toolchain + OS webview
    deps; not verified in this environment)
- **Environment:** copy `.env.example` → `.env`; only
  `VITE_PIXABAY_API_KEY` is needed for the web app (backgrounds degrade
  without it — verify current behavior before claiming). Tauri signing
  vars are local-only / GitHub Secrets, never committed.
- **Release:** push a `v*` tag (or `workflow_dispatch`) →
  `.github/workflows/release.yml` builds Windows/macOS/Linux installers +
  updater artifacts (`latest.json`) as a **draft** GitHub release.
  Requires `TAURI_SIGNING_PRIVATE_KEY` (+ optional password) secrets.
- **Repo skills:** `.agents/skills/` contains `frontend-design`,
  `shadcn`, `vercel-react-best-practices`, `make-interfaces-feel-better`
  — consult them for UI work; they are the project's approved UI
  guidance, not general web advice.
- **Compatibility constraints:** pnpm strict resolution (declare every
  direct import); React 19 ref types (`RefObject<T | null>`); Tailwind v3
  config style (`tailwind.config.ts`) — the open Dependabot PR to
  Tailwind v4 is breaking, do not merge casually.

## C. Task execution protocol

1. Translate the request into concrete requirements + acceptance criteria.
2. Inspect current implementation and related configs/tests.
3. Identify risks, affected modules, and whether the change touches
   installer metadata, the release workflow, or the web/desktop split.
4. Plan proportionally to task size; for multi-step work, set milestones.
5. Implement with existing conventions (feature folders under
   `src/features/`, shared UI under `src/shared/`).
6. Review the full diff for regressions and unintended changes
   (`git diff --check` for whitespace).
7. Run relevant verification (typecheck/lint/build at minimum for code
   changes) and fix regressions you introduced.
8. Update `MEMORY.md`: what changed, why, verification results, remaining
   risks/pending work. Checkpoint long tasks instead of waiting until the
   end.
9. Final report: files changed, behavior changes, exact commands run with
   outcomes, what was NOT verified, next recommended step.

## D. Truthful verification policy

Label every check exactly one of:

- **NOT RUN** — no verification performed (say why).
- **PASS** — command completed successfully (give the command).
- **FAIL** — command failed (give the command + error).
- **BLOCKED** — could not proceed; name the specific blocker.
- **PARTIAL** — only part of the required verification succeeded.

Rules: a running dev server ≠ a passing production build. A passing
typecheck ≠ passing tests. `pnpm build` failing at `tsc` means the Vite
bundle was never exercised — say so. Never mark a task "fully verified"
while required checks are missing; list them as NOT RUN/BLOCKED instead.

## E. Memory maintenance policy

`MEMORY.md` is the durable record. At every meaningful checkpoint and on
task completion, record: objective, implementation + files changed,
decisions + rationale, exact commands run and outcomes, errors with
confirmed (or unconfirmed) root causes, unresolved issues/blockers,
pending tasks + next action, and current version/status changes. Append —
don't silently rewrite history; if an old entry is wrong, mark it
corrected and explain. Never invent timestamps, hashes, or results.

## F. Skills, subagents, and tool usage

- Prefer the repo's `.agents/skills/` for UI/design tasks.
- Do not assume any MCP server, plugin, or subagent exists — verify first.
- When delegating: hand over the task requirements, the relevant
  `MEMORY.md` entries, and require the delegate to report files
  inspected/changed, evidence-backed findings, checks actually run, and
  open issues. You reconcile and write the memory update.

## G. Git safety

- Branch is `master`. Never force-push or rewrite history without explicit
  user authorization. No `reset --hard`, no `clean -fdx` on the user's
  tree.
- Don't commit or push unless the user asked. If they did: single focused
  commits, and verify `git status` is clean of unintended files first
  (never `dist/`, `node_modules/`, `src-tauri/target/`,
  `src-tauri/binaries/ffmpeg*`, `.env`).
- Record commit hashes only after they exist.
