# Security Policy — Quran Studio

## Reporting a vulnerability

If you find a security issue, **do not open a public issue**. Report it
privately via [GitHub Security Advisories](../../security/advisories/new)
for this repository. Include:

- What you found and where (file/URL/commit)
- Steps to reproduce
- What an attacker could gain

We aim to acknowledge within 72 hours and will keep you updated until the
issue is resolved.

## Supported versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

Only the latest release line receives security fixes.

## Security model

Quran Studio is a **pure client-side application** — there is no backend,
no database, no user accounts, and no telemetry. What runs on your machine
or in your browser is exactly what you see in this repo, plus:

- Quran text/audio/timings from `api.quran.com` (v4)
- Background images/video from the Pixabay API (needs a key, see below)
- Quran font files from the jsDelivr CDN

No personal data is collected, stored, or transmitted by the app itself.
Video exports are rendered locally on your device.

## Secrets and keys

- **Pixabay API key (`VITE_PIXABAY_API_KEY`).** This is a *client-side*
  key: it is baked into the web/desktop bundle at build time and is
  visible to anyone who inspects the shipped files. Treat it as
  public-by-design — restrict it in the Pixabay dashboard if possible
  and rotate it if it ever appears in git history or logs. **Never
  commit `.env` / `.env.local`** — both are gitignored. For local builds,
  copy `.env.example` to `.env` on your own machine only.
- **Tauri updater signing key.** Desktop updates are signed with minisign.
  The public key lives in `src-tauri/tauri.conf.json`
  (`plugins.updater.pubkey`). The private key must **never** enter the
  repo: for local builds it is a real OS environment variable
  (`TAURI_SIGNING_PRIVATE_KEY`, plus `_PASSWORD` if set — the Tauri CLI
  does not read `.env` files); in CI it comes from GitHub repository
  Secrets. Losing the private key means shipping a new public key with
  the next release.

## Desktop updater integrity

The in-app updater (`About → Updates`, and the startup check) downloads
`latest.json` from this repo's GitHub Releases and verifies every
artifact against the release signing key **before** installing. A
tampered or unsigned update is rejected. Keep the `pubkey` in
`tauri.conf.json` in sync with the private key used by CI.

## Tauri capabilities (least privilege)

`src-tauri/capabilities/default.json` grants only what the app needs
(fs, dialog, shell-open, sidecar ffmpeg/ffprobe execution, updater,
process relaunch). When adding features, add the narrowest permission
that works — never `fs:allow-*` wildcards or `shell:allow-execute`
without an explicit binary allow-list.

## Supply chain

- **pnpm 12.9.1** with a committed `pnpm-lock.yaml`; CI installs with
  `--frozen-lockfile`. Do not introduce npm/yarn artifacts.
- **CodeQL** scans `javascript-typescript`, `rust`, and `actions` on
  every push to `master` (see `.github/workflows/codeql.yml`).
- Do not auto-merge dependency PRs that cross a major version boundary
  (e.g. the open tailwindcss 3→4 PR) — review breaking changes first.
- ffmpeg/ffprobe sidecars are downloaded at build time from pinned
  release artifacts (`scripts/fetch-ffmpeg.mjs`), never committed.
