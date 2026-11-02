# MEMORY.md — Quran Studio

Durable project history and current state. Rules live in `AGENTS.md`;
Claude workflow in `CLAUDE.md`. This file records facts, work, decisions,
and status. Append new entries; don't silently rewrite history. Mark
uncertain items UNKNOWN / UNVERIFIED / PROPOSED.

## 1. Project Overview

Quran Studio (`quran-video-studio`, v1.0.0) is a client-side web + desktop
application for creating Quran recitation videos. Users pick a surah and
ayah range, choose a reciter, adjust typography/colors/backgrounds, preview
on canvas, and export MP4 (16:9 YouTube, 1:1 Instagram, 9:16 TikTok/Reels)
— rendered locally at 30 fps (H.264 + AAC) with no server upload.

- **Repo:** `github.com/DashingMZA/quran-video-maker`, created 2026-10-16,
  default branch **`master`**. Owner: Muhammad Zaheer Ahmad (DashingMZA).
- **License:** GPL-3.0-only. No backend, no database, no auth.
- **External data (all client-side):** `api.quran.com` v4 (Uthmani text,
  Urdu translation id 131, reciter audio, per-word timings);
  Pixabay API (image/video backgrounds; needs `VITE_PIXABAY_API_KEY`);
  Quran font files via jsDelivr CDN (see `FONT_BASE_URLS` in
  `src/shared/constants/index.ts`).
- **Desktop:** Tauri 2 shell (`src-tauri/`) producing Windows/macOS/Linux
  installers with an auto-updater pointed at GitHub releases
  (`.../releases/latest/download/latest.json`). ffmpeg/ffprobe ship as
  Tauri sidecar binaries, downloaded at build time, never committed.
- **Origin note:** README credits `github.com/quran8vs/Quran-Video-Studio`
  as the inspiring work ("Created with thanks for this work"). That repo
  (created 2026-03-04) lists **no license** — UNVERIFIED how much code, if
  any, is derived from it. If derivation is real, GPL-3.0-only labeling
  needs a rights check (see §14 P1).

## 2. Current Project State

- **Branch:** `master`, remote at `f5a019e` (2026-10-16, "feat(desktop):
  fix blank window, wire updater, add desktop About page"). Working tree
  CLEAN and content-identical to remote (verified by tree SHA).
- **Remote history since `69a81ab` ("1.0.0"):** `97b797d` (pnpm migration
  + full fix batch) → `69134a2` (user, web UI: "Create .env.local" —
  contained the REAL Pixabay API key; SECURITY INCIDENT, see §12) →
  `da19a5c` (Cloudflare dashboard git-deploy docs) → `da6842c` (user, web
  UI: "Delete .env.local") → `68acc50` (wrangler.toml name →
  `quran-video-makers`) → `0b6a0c0` (user merge of their local `74784f9`
  "1.0.0" + `2278ce6` "Update wrangler.toml", which reverted the worker
  name to `quran-video-maker` and set the user's OWN Tauri updater pubkey +
  Cargo changes) → `4af67d2` (prettier format, 15 files) → `776189b`
  (vitest `__dirname` → `import.meta.dirname`) → `b15e1eb` (scripts
  simplified) → `f5a019e` (desktop updater + About page).
- **Last verified checks (2026-10-16, sandbox) — ALL GREEN:**
  `pnpm typecheck`, `pnpm lint`, `pnpm test` (4/4), `pnpm build`
  (tsc + vite, dist/ emitted). Desktop native compile still BLOCKED in
  sandbox (no Rust toolchain); covered by release.yml CI.
- **Desktop status (user-reported):** user built the .exe locally,
  installed and opened it. Two issues found and fixed in `f5a019e`:
  (1) window opened invisible (`visible: false` with no `show()` call);
  (2) updater plugin never registered in `main.rs`. User has generated
  their own Tauri signing keypair (pubkey in `tauri.conf.json`) and is
  preparing the first desktop release (`v1.0.0` tag → release.yml).
- **Cloudflare status:** user is doing dashboard Connect-to-Git setup
  themselves (worker `quran-video-maker`). Build vars: `NODE_VERSION=24`,
  `PNPM_VERSION=12.9.1`; `VITE_PIXABAY_API_KEY` intentionally left blank
  for now (app builds/runs without it); no database needed (pure static
  SPA — unlike repos with D1/R2 bindings, the dashboard DB prompt can be
  skipped).

## 3. Architecture and Directory Map

```text
index.html → src/index.tsx → src/app/App.tsx   (app shell, error boundary)
src/
  config/app-info.json        Displayed name/version/author/social links
  features/quran/             data/surahs.ts, hooks/useQuranData.ts (fetch+cache),
                              types.ts
  features/audio/             hooks/useAudioRecorder.ts,
                              components/CustomAudioStudio.tsx
  features/video-editor/      components/VideoCanvas.tsx,
                              hooks/useVideoExporter.ts (mediabunny MP4),
                              hooks/useProjectExporter.ts (jszip),
                              hooks/useAssetLoader.ts, hooks/useFontLoader.ts,
                              utils/drawing-utils.ts, utils/render-strategies.ts,
                              utils/pixabay.ts, types.ts
  layouts/                    LeftSidebar.tsx, RightSidebar.tsx, Sidebar.tsx,
                              sidebar/{SidebarAudio,SidebarFormat,SidebarLayout,
                              SidebarSelection,SidebarStyle,SidebarTypography}.tsx
  shared/                     components/{AboutOverlay,ColorPicker,
                              DesktopAboutOverlay (desktop-only About page),
                              DesktopControls,ToggleSwitch,Tooltip,
                              UpdateBanner (desktop update notification)}.tsx,
                              constants/index.ts (RECITERS, FONTS,
                              FONT_BASE_URLS, CANVAS_SIZES),
                              hooks/useAppUpdater.ts (desktop updater logic),
                              utils/{platform.ts (isTauri/isWeb),
                              tauri-fs.ts, ffmpeg.ts}, types/index.ts
  index.css                   Tailwind + custom styles
src-tauri/
  tauri.conf.json             Product/bundle metadata, updater, sidecars
  src/main.rs                 get_app_export_path command
                              (Download/Documents → Quran_Video_Maker folder)
  capabilities/default.json   Tauri capability grants
  binaries/                   ffmpeg/ffprobe sidecars (gitignored, build-time)
  icons/                      App icons (icns/ico/png)
scripts/
  fetch-ffmpeg.mjs            Downloads platform ffmpeg/ffprobe from
                              descriptinc/ffmpeg-ffprobe-static (GitHub releases)
  prepare-ffmpeg.mjs          Renames them to Tauri sidecar naming
public/
  fonts/                      LateefSwashes, surah_al_qadr, surah_names_v2
  social_media/               Brand SVGs (fill="currentColor")
  icon/                       Favicons, web manifest
.github/workflows/release.yml Tag (`v*`) / workflow_dispatch → draft release
```

Data flow: `useQuranData` fetches surah text + reciter audio/timings from
api.quran.com (in-memory `Map` cache) → `VideoCanvas` renders frames →
`useVideoExporter` re-renders frames offscreen at 30fps into mediabunny
`Output` (MP4) → saved via browser download (web) or Tauri fs dialog
(desktop, `tauri-fs.ts`).

## 4. Technology Versions and Constraints

Verified from `package.json` / lockfile / configs (2026-10-16):

| Item                 | Version                              | Notes                                                  |
| -------------------- | ------------------------------------ | ------------------------------------------------------ |
| pnpm                 | 12.9.1 (pinned via `packageManager`) | ONLY package manager; `pnpm-lock.yaml` is the lockfile |
| node                 | >= 24 (`engines`)                    | Sandbox ran 24.20.0                                    |
| react / react-dom    | 19.3.1                               | Ref types are `RefObject<T \| null>`                   |
| vite                 | 8.3.4                                | dev port 3000                                          |
| typescript           | 6.0.3                                | `strict`, `noUnusedLocals/Parameters`                  |
| tailwindcss          | 3.4.x                                | v3 config style; v4 upgrade is breaking (open PR)      |
| @tauri-apps/api etc. | 2.12.x / 2.7.x                       | Tauri 2; NOTE: `@tauri-apps/api` has NO `process` module —      |
|                      |                                        | `relaunch`/`exit` live in `@tauri-apps/plugin-process` (^2.4.0) |
|                      |                                        | + `tauri-plugin-process = "2"` (Cargo)                         |
| mediabunny           | 1.61.6                               | MP4 muxing (successor of mp4-muxer)                    |
| lucide-react         | 1.58.0                               | **No brand icons** — use `public/social_media/*.svg`   |
| vitest               | 5.0.5 + jsdom                        | Configured; zero test files                            |
| @types/node          | ^24.19.2                             | Added during pnpm migration                            |

Constraints: pnpm strict resolution (declare every direct import);
`tsconfig.json` `"types": ["vite/client", "dom-webcodecs"]` — the
`dom-webcodecs` entry currently breaks typecheck under pnpm (see §9);
eslint `--max-warnings 0`; `pnpm-workspace.yaml` carries
`minimumReleaseAgeExclude` for `lucide-react@1.58.0` and
`mediabunny@1.61.6`.

## 5. Setup and Development Commands

```bash
pnpm install            # install (CI uses pnpm install --frozen-lockfile)
pnpm dev                # vite dev server → http://localhost:3000
pnpm build              # tsc --noEmit && vite build → dist/
pnpm preview            # serve the production build locally
pnpm typecheck           # tsc --noEmit
pnpm lint               # eslint .  (simplified 2026-10-16; was --report-unused-disable-directives --max-warnings 0)
pnpm format             # prettier --write "src/**/*.{ts,tsx,css}"  (scoped to src 2026-10-16; was --write .)
pnpm test               # vitest run
pnpm tauri              # tauri CLI passthrough (added 2026-10-16; binary from @tauri-apps/cli)
pnpm fetch:ffmpeg       # download platform ffmpeg/ffprobe → src-tauri/binaries/
pnpm prepare:ffmpeg     # fetch + rename to Tauri sidecar names
pnpm app:dev            # prepare:ffmpeg && tauri dev   (needs Rust + webview deps)
pnpm app:build          # prepare:ffmpeg && tauri build (needs Rust + webview deps)
pnpm deploy:cf          # pnpm build && wrangler deploy → Cloudflare Workers (static assets)
```

Web targets: `vercel.json` (Vercel, Vite preset) and `wrangler.toml`
(Cloudflare Workers static assets, SPA fallback). `VITE_PIXABAY_API_KEY`
is baked in at build time — set before building/deploying.
Dashboard git-deploys: Workers & Pages → Connect to Git, production
branch `master`, build `pnpm build`, deploy `npx wrangler deploy`,
build vars `NODE_VERSION=24`, `PNPM_VERSION=12.9.1`
(`.node-version` = `24` committed as fallback). Full steps in
`release.md` §4.

Environment: copy `.env.example` → `.env`. Only `VITE_PIXABAY_API_KEY`
matters for web. Tauri signing vars (`TAURI_SIGNING_PRIVATE_KEY[...]`)
are local-only / GitHub Secrets — never committed.
Release: `git tag vX.Y.Z && git push origin vX.Y.Z` (or workflow_dispatch)
triggers `.github/workflows/release.yml` → draft GitHub release with
installers + updater artifacts.

## 6. Architecture Decisions and Rationale

- **Client-side MP4 via mediabunny/WebCodecs** (not a server, not
  ffmpeg.wasm in browser): keeps videos private, no upload, no backend
  cost. Consequence: export requires a WebCodecs-capable browser and an
  active tab; long exports are CPU-heavy.
- **Tauri 2 over Electron:** smaller binaries, Rust sidecars for ffmpeg.
  Consequence: desktop builds need per-OS CI (release.yml matrix) and a
  signing key for the updater.
- **ffmpeg as downloaded sidecar, not committed:** binaries are ~130 MB
  each, over GitHub's 100 MB/file limit. `fetch-ffmpeg.mjs` pulls them
  from `descriptinc/ffmpeg-ffprobe-static` at build/CI time.
- **api.quran.com v4 as data source:** free, has word-level timings needed
  for highlighted recitation. Consequence: app needs network for text and
  audio; no offline mode (see §13).
- **pnpm 12.9.1 + node ≥ 24** (2026-10-16 migration): owner's standard
  toolchain across repos; strict resolution catches undeclared deps
  (it caught the `dom-webcodecs` gap).
- **Brand icons as local SVGs:** lucide-react removed brand glyphs, so
  `AboutOverlay` renders `public/social_media/*.svg`
  (`fill="currentColor"`) instead.
- **`pnpm-workspace.yaml` `minimumReleaseAgeExclude`** for lucide-react
  and mediabunny: pnpm's supply-chain recency policy would otherwise hold
  back these pinned versions. (Added during migration; rationale recorded
  here so it isn't removed blindly.)

## 7. Completed Work

### 2026-10-16 — Repository review (round 1)

- **Objective:** thoroughly check the repo at owner's request.
- **Findings (all evidence-backed):** app purpose/stack identified; 10 TS
  errors found (`pnpm`/`npm` typecheck); `tauri.conf.json` contained
  leftover metadata from an unrelated commercial app ("Jadoo" by cSofts:
  `shortDescription`/`longDescription`, `publisher`, `copyright`,
  `identifier com.csofts.quranvideostudio`); `README.md` had committed
  merge-conflict markers (lines 240–244) and stale info (React 18/Bun/
  mp4-muxer vs actual React 19/npm/mediabunny); `.env.example` contained a
  real local path (`C:/Users/XeeBee/.tauri/quran-video-maker.key`); no
  `.github/` dir at the time; zero test files; `package.json` license
  GPL-3.0-only.
- **Verification:** `npm install` PASS; `npm run typecheck` FAIL (10
  errors: 6× React 19 `RefObject` null types, 4× removed lucide brand
  icons).

### 2026-10-16 — TypeScript fixes (uncommitted)

- **Objective:** fix the 10 typecheck errors.
- **Implementation:** widened ref prop/param types to
  `React.RefObject<HTMLCanvasElement | null>` /
  `React.RefObject<HTMLAudioElement | null>` in `src/app/App.tsx`
  (call sites), `features/video-editor/hooks/useVideoExporter.ts`,
  `features/video-editor/hooks/useProjectExporter.ts`,
  `features/video-editor/components/VideoCanvas.tsx`,
  `features/audio/hooks/useAudioRecorder.ts`,
  `features/audio/components/CustomAudioStudio.tsx`
  (`LiveAudioVisualizer` props); replaced lucide `Github/Linkedin/
Twitter/Instagram` imports in `shared/components/AboutOverlay.tsx`
  with a `SOCIAL_SVG` map rendering `public/social_media/*.svg`;
  downloaded `linkedin.svg`, `tiktok.svg`, `x.svg` from simple-icons
  (jsDelivr) and normalized all six brand SVGs to `fill="currentColor"`.
- **Files changed:** the 6 source files above + 3 modified SVGs
  (github/facebook/instagram) + 3 new SVGs (linkedin/tiktok/x).
- **Verification:** typecheck re-run — the 10 errors are gone; one NEW
  error surfaced (see §9, `dom-webcodecs`).

### 2026-10-16 — pnpm migration (uncommitted, in progress)

- **Objective:** switch repo from npm to pnpm per owner directive.
- **Implementation:** `package.json`: added
  `"packageManager": "pnpm@12.9.1"`, `"engines": {"node": ">=24"}`,
  `"@types/node": "^24.19.2"` (devDeps); `app:dev`/`app:build` scripts
  changed `npm run prepare:ffmpeg` → `pnpm prepare:ffmpeg`; deleted
  `package-lock.json` and `node_modules`; `pnpm install` generated
  `pnpm-lock.yaml`; created `pnpm-workspace.yaml` with
  `minimumReleaseAgeExclude` for lucide-react/mediabunny.
- **Verification:** `pnpm install` PASS. `pnpm typecheck` FAIL
  (`dom-webcodecs`, §9). `pnpm build/lint/test/dev` NOT RUN yet.
- **Note:** remote `release.yml` already assumed pnpm
  (`pnpm/action-setup`, `pnpm install --frozen-lockfile`) before this
  migration landed — the workflow was written ahead of the repo state.

### 2026-10-16 — Owner-side commits (remote, by DashingMZA)

- `316f145`, `144f28c`, `0b7fd81`, `69a81ab` ("1.0.0"): added
  `.github/workflows/release.yml`; fixed tauri `shortDescription`/
  `longDescription` to Quran Studio wording and removed the stray
  `sample-videos.json` resource; bumped versions to 1.0.0
  (`package.json`, `src-tauri/Cargo.toml`, `tauri.conf.json`).

### 2026-10-16 — pnpm migration + fix batch pushed (`97b797d`)

- Single commit to `master` via Git Data API (git-https with PAT fails in
  this sandbox; PAT is api.github.com-only). Tree SHA verified
  byte-identical to local before the ref update.

### 2026-10-16 — Cloudflare Workers hosting (`a6978f1`, `da19a5c`)

- Pure static SPA → Workers Static Assets, no Worker code. Added
  `wrangler.toml` (`[assets]` → `./dist`, SPA fallback), `wrangler@4`
  devDep, `predeploy:cf`/`deploy:cf` scripts, `.node-version` (`24`).
  `release.md` §4 documents the dashboard Connect-to-Git flow (production
  branch `master`, build `pnpm build`, deploy `npx wrangler deploy`,
  build vars `NODE_VERSION=24`, `PNPM_VERSION=12.9.1`,
  `VITE_PIXABAY_API_KEY`). User is doing the dashboard setup themselves;
  key left blank for now, no database needed (no bindings).

### 2026-10-16 — Scripts verified + prettier format (`4af67d2`)

- All 6 scripts verified working (`typecheck`/`lint`/`test`/`preview`
  pass). `pnpm format` found style drift in 15 files; fixed and pushed
  on top of the user's merge (`0b6a0c0`) — only the 15 files changed,
  user's `tauri.conf.json` pubkey + Cargo changes preserved.

### 2026-10-16 — vitest config warning fix (`776189b`)

- `vitest.config.ts`: `__dirname` → `import.meta.dirname` (silences the
  Vite native `configLoader` warning; Node ≥ 20.11, repo requires 24).

### 2026-10-16 — Scripts simplified (`b15e1eb`, owner-directed)

- `lint` → `eslint .`, `format` → scoped to `src/**/*.{ts,tsx,css}`,
  added `"tauri": "tauri"` script (binary already provided by
  `@tauri-apps/cli` devDep).

### 2026-10-16 — Desktop updater + About page (`f5a019e`)

- **Root cause 1 (blank window):** `tauri.conf.json` sets the main window
  `visible: false`, but no code ever called `show()` — the installed .exe
  opened invisible. Fixed: `src/index.tsx` calls
  `getCurrentWindow().show()` at bundle load (desktop only).
- **Root cause 2 (updater dead):** `tauri-plugin-updater` was in
  `Cargo.toml` and `plugins.updater` in `tauri.conf.json`, but the plugin
  was never registered in `main.rs` and the `updater:default` capability
  was missing. Added both, plus `tauri-plugin-process` /
  `@tauri-apps/plugin-process` (`^2.4.0`) for `relaunch` (Tauri v2 moved
  it out of `@tauri-apps/api`; no `process` module exists there) with
  `process:default` capability.
- **New:** `src/shared/hooks/useAppUpdater.ts` (desktop-gated
  check/download/install with progress); `UpdateBanner.tsx` (startup
  update notification ~4s after launch, one-click install + relaunch);
  `DesktopAboutOverlay.tsx` (desktop-only About page: Information tab
  with name/version/author/license, Updates tab with version,
  check-for-updates, release notes, progress); About `Info` button in
  `App.tsx` controls (desktop only). Web build unaffected.
- **Verification:** typecheck/lint/test/build all green.

## 8. In-Progress Work

Nothing in progress. All batches pushed; tree clean and in sync with
remote `f5a019e`. (Historical note: this section previously tracked the
uncommitted pnpm migration — completed and pushed as `97b797d` on
2026-10-16.)

## 9. Bugs and Troubleshooting

- **`TS2688: Cannot find type definition file for 'dom-webcodecs'`
  (FIXED, 2026-10-16).** `tsconfig.json` `"types"` includes
  `dom-webcodecs`, which is not a declared dependency. Resolved under
  npm's flat `node_modules`, invisible to pnpm's strict layout.
  Fixed: added `@types/dom-webcodecs@0.1.13` (pinned to mediabunny's
  requirement) as a devDependency. Verified: typecheck passes.
- **10 TS errors (FIXED, 2026-10-16).** 6× React 19 `RefObject<T | null>`
  mismatches in App/exporter/canvas/audio files; 4× lucide-react removed
  brand icon exports in `AboutOverlay.tsx`. Fixed by widening ref types
  and switching to local SVGs (see §7). Verified: errors gone.
- **`tauri.conf.json` foreign metadata (FIXED, 2026-10-16).**
  `identifier` → `com.dashingmza.quranstudio`, `publisher` → `DashingMZA`,
  `copyright` → GPL-3.0-consistent line; `beforeDevCommand`/
  `beforeBuildCommand` → `pnpm dev`/`pnpm build`. Safe to change: no
  release has ever shipped under the old identifier.
- **`release.yml` `releaseName: "Jadoo …"` (FIXED, 2026-10-16).** Now
  `"Quran Studio ${{ github.ref_name }}"`.
- **`README.md` committed merge-conflict markers (FIXED, 2026-10-16).**
  Markers removed; full rewrite: React 19, pnpm, mediabunny, coherent
  Tauri section (no `tauri init` — `src-tauri/` ships configured),
  fixed license line, new Vercel + release-process sections.
- **`.env.example` contained a real local path (FIXED, 2026-10-16).**
  Now `/path/to/your/quran-video-maker.key` placeholder. (Path only, no key
  material was ever exposed.)
- **Desktop window opened invisible (FIXED, 2026-10-16).** `tauri.conf.json`
  sets `visible: false` but no code called `show()`. Fixed in
  `src/index.tsx` (show at bundle load, desktop only).
- **Updater plugin never registered (FIXED, 2026-10-16).** Config
  (`plugins.updater`) and Cargo dep existed, but `main.rs` lacked
  `.plugin(tauri_plugin_updater::Builder::new().build())` and the
  `updater:default` capability was missing. Both added; also added
  `tauri-plugin-process` for `relaunch`.
- **`@tauri-apps/api/process` does not exist (FIXED, 2026-10-16).**
  `relaunch`/`exit` moved to `@tauri-apps/plugin-process` in Tauri v2
  (verified against `@tauri-apps/api@2.12.4`). See AGENTS.md lessons.

## 10. Failed Attempts and Lessons Learned

- **npm-first verification:** the repo was first checked with `npm
install`; npm rewrote `package-lock.json` as a side effect (had to be
  `git checkout`ed). Lesson: match the repo's intended package manager
  before installing — now pnpm-only.
- **pnpm 12 flag drift:** `pnpm install --no-fund` is rejected in pnpm 12
  (unknown option). Use plain `pnpm install`.
- **pnpm strictness surfaced a latent bug:** `dom-webcodecs` in tsconfig
  `types` worked only by accident under npm's flat layout. Lesson: keep
  tsconfig `types` in sync with declared dependencies.

## 11. Testing and Quality Status

| Check                                       | Status (2026-10-16) | Notes                                       |
| ------------------------------------------- | ------------------- | ------------------------------------------- |
| `pnpm install`                              | PASS                | pnpm-lock.yaml in sync                      |
| `pnpm typecheck`                             | PASS                | incl. new updater/About code                |
| `pnpm build`                                | PASS                | tsc + vite build, dist/ emitted             |
| `pnpm lint`                                 | PASS                | simplified `eslint .`                       |
| `pnpm test`                                 | PASS                | 4/4, constants.test.ts                      |
| `pnpm dev` / `preview` smoke                | PASS                | HTTP 200, correct title                     |
| `tauri info` / fetch-ffmpeg                 | PASS                | CLI 2.12.3, config valid, binaries download |
| `pnpm app:dev` / `app:build` native compile | BLOCKED             | No Rust toolchain / webview deps in sandbox |
| release.yml end-to-end                      | NOT RUN             | Needs `v*` tag push (owner preparing v1.0.0)|
| Desktop updater flow                        | NOT RUN             | Needs published release with `latest.json`  |

## 12. Security and Operational Considerations

- Secrets: `.env*` gitignored; `.env.example` is the template
  (placeholders only). Tauri updater private key must live in GitHub
  Secrets, never in the repo. No secret values are recorded in this file.
- **INCIDENT 2026-10-16 — Pixabay API key committed to the public repo.**
  Owner pushed `69134a2` ("Create .env.local") via the GitHub web UI
  containing the REAL `VITE_PIXABAY_API_KEY` (bypasses `.gitignore`).
  Owner deleted the file at the tip via `da6842c` ("Delete .env.local"),
  but the key remains in git history — **revocation/rotation on Pixabay
  is still required.** Lesson: never create `.env.local` via the web UI;
  it lives only on the local machine.
- Updater trust: `tauri.conf.json` embeds a minisign public key and the
  releases endpoint — rotating the key requires coordinated config +
  secret updates. NOTE: the pubkey currently in `tauri.conf.json` is the
  owner's own keypair (set 2026-10-16 during first-release prep).
- Updater trust: `tauri.conf.json` embeds a minisign public key and the
  releases endpoint — rotating the key requires coordinated config +
  secret updates.
- Supply chain: pnpm 12 verifies the lockfile against supply-chain
  policies on install (`✓ Lockfile passes supply-chain policies` observed).
  `minimumReleaseAgeExclude` in `pnpm-workspace.yaml` pins two packages
  past the recency gate — review before removing.
- Desktop sandboxing: Tauri capabilities in
  `src-tauri/capabilities/default.json` scope fs/dialog/shell/updater —
  keep grants minimal when touching them.
- Web export taint: canvas MP4 export needs same-origin/CORS-clean
  assets; Pixabay URLs are remote — export behavior with remote
  backgrounds is UNVERIFIED.

## 13. Known Limitations and Technical Debt

- One vitest test file (`constants.test.ts`); updater/About code has no
  tests (Tauri APIs are hard to unit-test; manual desktop QA needed).
- No offline mode: Quran text/audio/fonts all require network.
- Export requires WebCodecs + active tab; long videos are CPU-bound in
  the renderer tab.
- Window is frameless/transparent (`decorations: false`) with custom
  `DesktopControls` — native window behavior on all OSes UNVERIFIED.
- Dependabot PR #1 (postcss-selector-parser + tailwindcss 3.4.19 → 4.3.3)
  is open and breaking-by-design — do not auto-merge.
- UNVERIFIED: updater `latest.json` end-to-end flow, installer signing,
  macOS/Windows/Linux build success, Cloudflare deployment.

## 14. Pending Tasks and Priorities

- **P0:** Owner is preparing the first desktop release: GitHub Secrets
  (`TAURI_SIGNING_PRIVATE_KEY[...]`) → `git tag v1.0.0` → release.yml
  builds 4 installers → draft release → test installers → publish.
  All four version fields are in sync at 1.0.0.
- **P0:** Revoke/rotate the Pixabay API key exposed in `69134a2` (§12).
- **P1:** License-derivation check: README credits
  `quran8vs/Quran-Video-Studio` (no license listed upstream). Confirm how
  much code is derived and whether GPL-3.0-only labeling is sound.
- **P2:** Verify the desktop updater end-to-end once a release with
  `latest.json` is published (About page → check → install → relaunch).
- **P2:** Cloudflare Workers deploy via dashboard Connect-to-Git (owner
  doing it; build vars documented in `release.md` §4).
- **P2:** Vercel deploy (add `VITE_PIXABAY_API_KEY` env when wanted).
- **P3:** Dependabot tailwindcss v4 PR — evaluate separately, never as a
  drive-by.
- Older completed items: pnpm migration + fix batch (P0, done), Tauri
  branding cleanup (P1, done), first vitest test (P2, done), Vercel setup
  (P2, done).

## 15. Important References

- `package.json` — scripts, deps, pnpm pin
- `src-tauri/tauri.conf.json` — installer/updater metadata
- `.github/workflows/release.yml` — desktop release pipeline
- `wrangler.toml` / `vercel.json` — web deploy targets (Cloudflare / Vercel)
- `scripts/fetch-ffmpeg.mjs`, `scripts/prepare-ffmpeg.mjs` — sidecars
- `src/shared/constants/index.ts` — reciters, fonts, canvas sizes
- `src/features/video-editor/hooks/useVideoExporter.ts` — export core
- `src/config/app-info.json` — displayed app metadata
- `.agents/skills/` — `frontend-design`, `shadcn`,
  `vercel-react-best-practices`, `make-interfaces-feel-better`
- Open PR: dependabot "Bump postcss-selector-parser and tailwindcss" (#1)

## 16. Memory Maintenance Log

- **2026-10-16:** Created `AGENTS.md`, `CLAUDE.md`, `MEMORY.md` from
  direct repo inspection (package.json, tsconfig, tauri.conf.json,
  release.yml, .env.example, README, src tree, git log/status, GitHub API
  for repo metadata + open PRs). Documented the in-progress pnpm
  migration and TS fixes as uncommitted work; recorded all verified open
  issues. No application source was modified for this task; nothing
  committed or pushed.
- **2026-10-16:** Updated after the fix batch completed: all checks
  green (typecheck/lint/build/test/dev/preview), `dom-webcodecs` fixed
  via `@types/dom-webcodecs@0.1.13`, Tauri metadata + release.yml +
  README + `.env.example` fixed, `vercel.json` + `release.md` added,
  first vitest test added. §2/§8/§9/§11/§14 brought current.
- **2026-10-16 (catch-up):** Full rewrite of stale sections after owner
  pointed out MEMORY.md wasn't being updated per change. Recorded:
  remote history `97b797d`→`f5a019e` (incl. the `.env.local` Pixabay key
  exposure `69134a2` and its tip-deletion `da6842c` — revocation still
  required); Cloudflare Workers setup + dashboard flow; scripts
  verification/simplification; prettier format; vitest
  `import.meta.dirname` fix; desktop updater wiring + About page +
  UpdateBanner + window `show()` fix; `@tauri-apps/plugin-process`
  lesson. AGENTS.md gained a "Lessons learned" section (Tauri
  visible/show, updater 4-piece wiring, plugin-process, pnpm lockfile
  churn, Git Data API notes). §§2–5, 7–9, 11–14, 16 current; tree clean,
  in sync with remote.
- **2026-10-16:** `.env.example` signing section rewritten: the Tauri CLI
  does NOT read `.env` files — `TAURI_SIGNING_PRIVATE_KEY[_PASSWORD]`
  must be real OS env vars (owner hit "no private key" despite having
  the path in `.env.local`). Pushed as `0eed45a`.
- **2026-10-16:** `release.md` local-signing section corrected: Tauri CLI
  ignores `.env` — the signing vars must be real OS env vars (PowerShell
  example added). Owner directive going forward: local env file is `.env`
  (not `.env.local`); never create it via the GitHub web UI.
- **2026-10-17:** Window `visible` set to `true` in `tauri.conf.json`
  (was `false` + JS `show()` in index.tsx — too fragile; user still
  reported no window). Belt and suspenders: JS `show()` kept (no-op if
  already visible).
- **2026-10-17:** `DesktopAboutOverlay` Information tab now shows the real
  app icon (`/icon/web-app-manifest-512x512.png`) instead of the generic
  lucide `Info` glyph (owner request).
- **2026-10-17:** `DesktopControls` (minimize/maximize/close) moved from
  `fixed` top-right of the window into the middle player column
  (`absolute` inside the preview area) — owner: it was overlapping the
  right sidebar's "Styling" header.
- **2026-10-17:** Added `SECURITY.md` (owner request): vulnerability
  reporting, supported versions, client-side security model, Pixabay key
  handling (client-visible by design), Tauri signing-key rules, updater
  signature verification, capability least-privilege, supply-chain notes.
- **2026-10-17:** Owner decision: keep BOTH `wrangler.toml` and
  `wrangler.jsonc` (both configure the same Worker: name `quran-video-maker`,
  static assets `./dist`, SPA fallback). Note: when both exist, Wrangler
  prefers `wrangler.jsonc`.
