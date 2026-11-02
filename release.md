# Release Guide — Quran Studio

This document covers the full release process: desktop installers (Windows /
macOS / Linux via GitHub Actions) and the web deployment (Vercel).

## 1. Versioning

Keep these four in sync before tagging a release:

| File                        | Field                                                         |
| --------------------------- | ------------------------------------------------------------- |
| `package.json`              | `"version"`                                                   |
| `src-tauri/tauri.conf.json` | `"version"`                                                   |
| `src-tauri/Cargo.toml`      | `version` under `[package]`                                   |
| `src/config/app-info.json`  | `"version"` (displayed in the About overlay, e.g. `"v1.0.0"`) |

## 2. Desktop releases (GitHub Actions)

### How it works

`.github/workflows/release.yml` runs when you push a git tag starting with
`v` (e.g. `v1.0.0`), or manually via **Actions → Release → Run workflow**.
It builds on four runners in parallel:

- Windows (`x86_64-pc-windows-msvc`) → `.msi` / `.exe` (NSIS)
- macOS Apple Silicon (`aarch64-apple-darwin`) → `.dmg`
- macOS Intel (`x86_64-apple-darwin`, cross-compiled) → `.dmg`
- Linux (`x86_64-unknown-linux-gnu`) → `.AppImage` / `.deb`

Each job downloads the matching `ffmpeg`/`ffprobe` sidecar binaries
(`scripts/fetch-ffmpeg.mjs`), prepares the Tauri sidecar names
(`scripts/prepare-ffmpeg.mjs`), then builds with `tauri-action`. The result
is a **draft** GitHub Release containing every installer plus the
auto-updater artifacts (`latest.json` + signature files).

The in-app updater (`src-tauri/tauri.conf.json` → `plugins.updater`) polls
`https://github.com/DashingMZA/quran-video-maker/releases/latest/download/latest.json`,
so publishing the draft release is what ships the update to existing
desktop installs.

### One-time setup: signing keys

The updater artifacts must be signed. Generate a keypair once on your own
machine (never commit these files):

```bash
pnpm tauri signer generate -w ~/.tauri/quran-video-maker.key
```

This prints the **public key** — it must match the `pubkey` already stored
in `src-tauri/tauri.conf.json` (`plugins.updater.pubkey`). If you generate
a fresh keypair, update that field and commit it.

For local signed builds, export these as **real OS environment variables**
in the shell that runs the build (the Tauri CLI does not read `.env`
files). PowerShell example:

```powershell
$env:TAURI_SIGNING_PRIVATE_KEY="C:/path/to/your/quran-video-maker.key"
$env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD=""  # only if you set one
pnpm app:build
```

(`TAURI_SIGNING_PRIVATE_KEY` accepts the key file path or the raw key
content.)

### One-time setup: GitHub Secrets

Repository → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret                               | Value                                                  |
| ------------------------------------ | ------------------------------------------------------ |
| `TAURI_SIGNING_PRIVATE_KEY`          | Contents (or path contents) of the private `.key` file |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | The password set at generation time (empty if none)    |

`GITHUB_TOKEN` is provided automatically; the workflow already requests
`permissions: contents: write` so it can create the release.

### Triggering a release

```bash
# 1. Make sure the working tree is clean and versions are bumped (see §1)
# 2. Commit and push to master
git push origin master

# 3. Tag and push the tag — this starts the workflow
git tag v1.0.0
git push origin v1.0.0
```

Then:

1. Watch progress under **Actions → Release**.
2. When all four jobs finish, open **Releases** — you'll find a **draft**
   release named `Quran Studio v1.0.0` with all installers attached.
3. Review the artifacts, edit the release notes if needed, and click
   **Publish release**. Publishing makes `latest.json` live, which is what
   the auto-updater reads.

> **Note:** `pnpm install --frozen-lockfile` runs in CI, so `pnpm-lock.yaml`
> must be committed and in sync with `package.json`, otherwise the workflow
> fails before building.

## 3. Web deployment (Vercel)

The web version is a static Vite SPA. `vercel.json` already sets:

- Build command: `pnpm build`
- Output directory: `dist`
- Install command: `pnpm install` (Vercel also auto-detects pnpm via
  `packageManager` + `pnpm-lock.yaml`)

Steps:

1. In Vercel, **Add New → Project → Import** this repository.
2. Framework preset is auto-detected as **Vite** — keep the defaults.
3. Add the environment variable **`VITE_PIXABAY_API_KEY`** (Project
   Settings → Environment Variables) so the Image/Video background tabs
   can fetch from Pixabay. The app runs without it, but those tabs will be
   empty.
4. Deploy. Every push to `master` redeploys automatically (can be changed
   in the Vercel project settings).

The app detects Tauri vs. web at runtime
(`src/shared/utils/platform.ts` → `isTauri()`), so the identical build
output runs on Vercel and inside the desktop shell — no separate web
codebase is needed.

## 4. Web deploy — Cloudflare Workers (alternative to Vercel)

The web build is a static SPA, so it also runs on Cloudflare Workers via
**static assets** (`wrangler.toml` — no Worker code required).
`wrangler.toml` sets `not_found_handling = "single-page-application"`,
so deep links fall back to `index.html`.

`VITE_PIXABAY_API_KEY` is baked into the bundle at **build time** — it
must be present wherever the build runs, otherwise the Image/Video
background tabs will be empty.

### Option A — Dashboard, git-connected (recommended)

Every push to `master` builds and deploys automatically. One-time setup:

1. Cloudflare dashboard → **Workers & Pages → Create → Connect to Git**
   (a.k.a. "Import from Git").
2. Authorize GitHub if asked, select **`DashingMZA/quran-video-maker`**.
3. Configure the build (field-by-field):

   | Field             | Value                                                               |
   | ----------------- | ------------------------------------------------------------------- |
   | Project name      | `quran-video-maker` (matches `wrangler.toml`)                            |
   | Production branch | **`master`** (this repo's default branch)                           |
   | Root directory    | `/` (repository root — leave default)                               |
   | Build command     | `pnpm build` (dependency install is automatic via `pnpm-lock.yaml`) |
   | Deploy command    | `npx wrangler deploy` (leave default)                               |

4. **Before the first deploy**, add build variables under
   **Settings → Variables** (or on the setup screen):

   | Variable               | Value    | Why                                 |
   | ---------------------- | -------- | ----------------------------------- |
   | `NODE_VERSION`         | `24`     | `package.json` requires Node ≥ 24   |
   | `PNPM_VERSION`         | `12.9.1` | matches the repo's pnpm pin         |
   | `VITE_PIXABAY_API_KEY` | your key | baked into the bundle at build time |

   (`.node-version` = `24` is also committed at the repo root as a
   fallback signal.)

5. **Save and Deploy.** The site goes live at
   `https://quran-video-maker.<your-subdomain>.workers.dev`.
6. Custom domain (optional): Worker's **Settings → Domains & Routes**.

### Option B — CLI from your machine

```bash
pnpm exec wrangler login   # one-time, opens a browser window
pnpm deploy:cf             # runs pnpm build first, then wrangler deploy
```

Export `VITE_PIXABAY_API_KEY` in your shell (or `.env`) before building.

## 5. Checklist before tagging

- [ ] Versions bumped in all four files (§1)
- [ ] `pnpm install` clean, `pnpm-lock.yaml` committed
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm build`, `pnpm test` all pass
- [ ] Desktop smoke test via `pnpm app:dev` (if a Rust toolchain is available)
- [ ] Release notes drafted (what's new / fixed)
