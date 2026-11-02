# AGENTS.md — Quran Studio

Shared operating instructions for every AI agent working in this repository.
Read this file **and** `MEMORY.md` before starting any task. When operating
through Claude Code, also read `CLAUDE.md`.

## Project identity

**Quran Studio** (`quran-video-studio`, v1.0.0) — a client-side web + desktop
app for creating Quran recitation videos (surah/ayah selection, reciter audio
with word timings, typography and background controls, MP4 export for
YouTube 16:9 / Instagram 1:1 / TikTok-Reels 9:16).

- **Repo:** `github.com/DashingMZA/quran-video-maker` · default branch **`master`**
  (not `main`). Owner: Muhammad Zaheer Ahmad (DashingMZA).
- **License:** GPL-3.0-only (`LICENSE`). Do not add "All rights reserved"
  notices or proprietary metadata anywhere.
- **Stack (verified from `package.json`):** React 19.3.1, Vite 8.3.4,
  TypeScript 6.0.3 (strict), Tailwind CSS 3.4.x, Tauri 2.12 (desktop shell),
  mediabunny 1.61.6 (MP4 muxing via WebCodecs), jszip 3.10.2 (project
  export), lucide-react 1.58.0 (**brand icons removed upstream** — use the
  SVGs in `public/social_media/`), vitest 5 + jsdom (zero test files exist).
- **Package manager: pnpm 12.9.1 only.** `package.json` pins
  `"packageManager": "pnpm@12.9.1"` and `"engines": {"node": ">=24"}`.
  Lockfile is `pnpm-lock.yaml`. There is no `package-lock.json` and no
  `node_modules` committed — never reintroduce npm artifacts. pnpm is
  strict: every imported package must be a declared dependency.
- **No backend, no database, no auth.** Pure client-side app + Tauri shell.
  External data only: `api.quran.com` v4 (Quran text, Urdu translation,
  reciter audio, word timings), Pixabay API (background images/video;
  requires `VITE_PIXABAY_API_KEY`), Quran fonts via jsDelivr CDN.
  Desktop builds bundle ffmpeg/ffprobe as Tauri sidecars, downloaded at
  build time by `scripts/fetch-ffmpeg.mjs` — never commit the binaries.

### Structure

```text
src/
  app/App.tsx                 App shell (state, error boundary, layout)
  index.tsx / index.css       Entry point, Tailwind styles
  config/app-info.json        App name, version, author, social links
  features/
    quran/                    Surah data, useQuranData (api.quran.com fetching + cache)
    audio/                    useAudioRecorder, CustomAudioStudio, audio player
    video-editor/             VideoCanvas, useVideoExporter (mediabunny),
                              useProjectExporter (jszip), asset/font loaders,
                              drawing + render strategies, pixabay utils
  layouts/                    LeftSidebar, RightSidebar, sidebar panels
  shared/                     components (incl. AboutOverlay, brand-icon SVGs usage),
                              constants (RECITERS, FONTS, CANVAS_SIZES), utils
                              (platform.ts isTauri/isWeb, tauri-fs.ts, ffmpeg.ts)
src-tauri/                    Tauri 2 app: tauri.conf.json, main.rs
                              (get_app_export_path command), capabilities,
                              binaries/ (ffmpeg/ffprobe sidecars — gitignored)
scripts/                      fetch-ffmpeg.mjs, prepare-ffmpeg.mjs
public/                       fonts, icons, social_media SVGs, robots.txt, sitemap.xml
.github/workflows/release.yml Tag-triggered desktop release (win/mac/linux)
```

Entry points: `index.html` → `src/index.tsx` → `src/app/App.tsx`.
Web-vs-desktop branching goes through `src/shared/utils/platform.ts`
(`isTauri()`); never import `@tauri-apps/*` at module top level in code
that must run on the web.

## Development rules

1. **pnpm only.** Run `pnpm install`, `pnpm dev`, `pnpm build`, etc. Never
   use `npm`/`yarn`/`bun` commands or lockfiles here. CI
   (`.github/workflows/release.yml`) uses `pnpm install --frozen-lockfile`,
   so `pnpm-lock.yaml` must be committed and in sync.
2. **Type safety is the gate.** `pnpm build` runs `tsc --noEmit` first;
   strict mode is on (`noUnusedLocals`, `noUnusedParameters`). React 19
   types: `useRef<T>(null)` yields `RefObject<T | null>` — type ref props
   accordingly, don't cast it away.
3. **Keep diffs minimal.** One task, one focused change. No unrelated
   refactoring, no new dependencies without justification, no dependency
   major bumps without checking breakage (see the open Dependabot
   tailwindcss 3→4 PR — do not auto-merge).
4. **No secrets in the repo.** `.env*` is gitignored (except `.env.example`,
   which must contain placeholders only — never real paths, keys, or
   passwords). Tauri signing keys live outside the repo; CI reads them from
   GitHub Secrets (`TAURI_SIGNING_PRIVATE_KEY`,
   `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`).
5. **Tauri config hygiene.** `src-tauri/tauri.conf.json` ships inside
   installers — keep `identifier`, `publisher`, `copyright`,
   `shortDescription`/`longDescription` accurate and GPL-consistent. Never
   leave another product's metadata in it.
6. **Desktop-only code stays behind `isTauri()`.** The Vite web build must
   work with no Tauri globals. ffmpeg sidecars are build-time downloads,
   not source files.
7. **Docs match code.** If you change the stack, scripts, or setup flow,
   update `README.md` in the same change. Never commit merge-conflict
   markers.
8. **Tests:** vitest + jsdom is configured but there are no test files yet.
   When adding behavior with pure logic (utils, constants), add a colocated
   `*.test.ts`. Don't delete tests to make a suite pass.
9. **i18n/RTL awareness.** The UI mixes English/Arabic/Urdu strings and
   Arabic-script fonts. Keep user-visible strings as they are unless the
   task is about copy; don't hardcode new English-only assumptions into
   shared components.
10. **Commit discipline.** Single focused commits after a task is complete
    and verified. Never commit `dist/`, `node_modules/`,
    `src-tauri/target/`, `src-tauri/binaries/ffmpeg*`, or `.env`.

## Lessons learned

- **Tauri `visible: false` needs a JS `show()` call.** `tauri.conf.json`
  sets the main window `visible: false` to avoid a white flash. If nothing
  calls `getCurrentWindow().show()`, the app launches invisible (hit
  2026-10-16 — user installed the .exe and saw nothing). The call lives in
  `src/index.tsx` at module load, gated behind `isTauri()`.
- **Tauri v2 updater needs four pieces, not one.** `plugins.updater` in
  `tauri.conf.json` alone does nothing. Also required (hit 2026-10-16):
  `tauri-plugin-updater = "2"` in `Cargo.toml`,
  `.plugin(tauri_plugin_updater::Builder::new().build())` in `main.rs`,
  and `"updater:default"` in `capabilities/default.json`.
- **Tauri v2 moved `relaunch`/`exit` out of `@tauri-apps/api`.** There is
  no `@tauri-apps/api/process` module (verified against 2.12.4). Use
  `@tauri-apps/plugin-process` (JS) + `tauri-plugin-process = "2"`
  (Cargo.toml) + `.plugin(tauri_plugin_process::init())` (main.rs) +
  `"process:default"` capability (hit 2026-10-16).
- **Desktop-only UI stays behind `isTauri()`.** `DesktopAboutOverlay`,
  `UpdateBanner`, and the About button render nothing on web. `@tauri-apps/*`
  plugin imports must be dynamic (`await import(...)`) inside
  `isTauri()`-gated code paths, never at module top level.
- **`pnpm add` reformats `pnpm-lock.yaml` quote style.** Cosmetic churn
  only (hit 2026-10-16: 4800-line diff, zero version changes). Verify with
  `git diff` that the only real change is the added package.
- **Git Data API pushes (sandbox has no git-https credentials).** PAT works
  only on `api.github.com`. Use full SHAs everywhere (short SHAs 404 on
  `/git/commits`). When comparing recursive trees, filter to
  `type == "blob"` — directory entries legitimately change. Build the new
  tree on the *current* remote tip, not the last-known one; re-check the
  tip immediately before the ref update.

## Required workflow

Every agent must:

1. Read `AGENTS.md` and `MEMORY.md` before starting; read `CLAUDE.md`
   under Claude Code.
2. Check `git status` / `git log` first — never clobber uncommitted work.
3. Inspect the relevant source files before proposing changes; follow
   existing patterns instead of inventing new abstractions.
4. Define scope and acceptance criteria; keep the change minimal.
5. Run the relevant checks: `pnpm typecheck`, `pnpm lint`, `pnpm build`
   (and `pnpm test` once tests exist). A dev-server starting is not proof
   a production build passes.
6. Record actual results — including failures and checks not run. Never
   fabricate a passing build/test.
7. Update `MEMORY.md` at completion or at meaningful checkpoints.
8. Report: files changed, behavior changes, verification results with
   exact commands, remaining risks, pending work.

Explicitly forbidden:

- Claiming a build/test passed without running it.
- Silencing linter/type warnings without understanding the cause.
- Removing or weakening tests just to get green.
- Bumping major dependency versions without justification and a test run.
- Committing secrets, keys, tokens, passwords, or real `.env` files.
- `git reset --hard`, `git clean -fdx`, force-push, or history rewrites
  without explicit user authorization.
- Reverting or discarding the user's uncommitted changes.
- Re-doing completed work without checking `MEMORY.md`/git history first.
- Pushing to the remote unless the user asked for it.
