// ffmpeg.exe/ffprobe.exe GIT mein commit NAHI karne (GitHub ka 100MB/file
// limit hai, aur ye files ~136MB each hain) — iski jagah ye script khud
// current platform ke liye sahi binaries download kar leta hai, ek real
// maintained project se: descriptinc/ffmpeg-ffprobe-static
// (https://github.com/descriptinc/ffmpeg-ffprobe-static — GPL-3.0, Mac/
// Linux/Windows teeno ke static builds, 19.5k weekly npm downloads).
//
// CI (.github/workflows/release.yml) mein `prepare-ffmpeg.mjs` se PEHLE
// chalta hai. Local dev mein bhi chala sakte ho agar khud manually ffmpeg
// download/rakhna nahi chahte: `node scripts/fetch-ffmpeg.mjs`
//
// Agar file already maujood hai (chahe isi script ne daali ho ya aapne khud
// kahin se li ho) to dobara download nahi karta — bas skip kar deta hai.

import { existsSync, mkdirSync, writeFileSync, chmodSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const binariesDir = join(__dirname, "..", "src-tauri", "binaries");

const REPO = "descriptinc/ffmpeg-ffprobe-static";

// process.platform/arch -> us project ke release-asset suffix ka mapping
const ASSET_SUFFIX = {
  "darwin-arm64": "darwin-arm64",
  "darwin-x64": "darwin-x64",
  "win32-x64": "win32-x64",
  "linux-x64": "linux-x64",
};

// Rust target-triple -> asset suffix. CI mein macOS ka Intel (x86_64-apple-darwin)
// leg ek Apple-Silicon (arm64) runner PE cross-compile hota hai — us waqt
// process.arch "arm64" hi dikhayega jabke humein x64 binaries chahiye.
// Isliye TARGET_TRIPLE env var (workflow se) host-detection se hamesha
// override karta hai, agar set ho.
const TRIPLE_TO_SUFFIX = {
  "aarch64-apple-darwin": "darwin-arm64",
  "x86_64-apple-darwin": "darwin-x64",
  "x86_64-pc-windows-msvc": "win32-x64",
  "x86_64-unknown-linux-gnu": "linux-x64",
};

function currentSuffix() {
  const triple = process.env.TARGET_TRIPLE;
  if (triple) {
    const suffix = TRIPLE_TO_SUFFIX[triple];
    if (!suffix) {
      throw new Error(
        `[fetch-ffmpeg] TARGET_TRIPLE "${triple}" ke liye koi mapping nahi hai.`,
      );
    }
    return suffix;
  }

  // Fallback: local dev (koi cross-compiling nahi) — host se guess karo.
  const key = `${process.platform}-${process.arch}`;
  const suffix = ASSET_SUFFIX[key];
  if (!suffix) {
    throw new Error(
      `[fetch-ffmpeg] ${key} ke liye koi mapping nahi hai. Khud ffmpeg/ffprobe ` +
        `binaries src-tauri/binaries/ mein daal do (dekho binaries/README.md).`,
    );
  }
  return suffix;
}

async function latestReleaseTag() {
  const headers = { "User-Agent": "quran-video-maker-build-script" };
  // CI (GitHub Actions) mein GITHUB_TOKEN hamesha available hota hai — isse
  // use karne par rate-limit 60/hr se badh kar 1000+/hr ho jati hai.
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/releases/latest`,
    { headers },
  );
  if (!res.ok)
    throw new Error(
      `[fetch-ffmpeg] GitHub release info nahi mil saka: HTTP ${res.status}`,
    );
  const data = await res.json();
  return data.tag_name;
}

async function downloadAsset(tag, assetName, outPath) {
  const url = `https://github.com/${REPO}/releases/download/${tag}/${assetName}`;
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok)
    throw new Error(
      `[fetch-ffmpeg] ${assetName} download nahi ho saka: HTTP ${res.status} (${url})`,
    );
  const bytes = Buffer.from(await res.arrayBuffer());
  writeFileSync(outPath, bytes);
  if (process.platform !== "win32") chmodSync(outPath, 0o755);
  console.log(`[fetch-ffmpeg] ${assetName} -> ${outPath}`);
}

async function main() {
  mkdirSync(binariesDir, { recursive: true });
  const ext = process.platform === "win32" ? ".exe" : "";
  const ffmpegOut = join(binariesDir, `ffmpeg${ext}`);
  const ffprobeOut = join(binariesDir, `ffprobe${ext}`);

  if (existsSync(ffmpegOut) && existsSync(ffprobeOut)) {
    console.log(
      "[fetch-ffmpeg] ffmpeg/ffprobe already maujood hain, download skip.",
    );
    return;
  }

  const suffix = currentSuffix();
  const tag = await latestReleaseTag();
  console.log(
    `[fetch-ffmpeg] ${REPO}@${tag} (${suffix}) se download ho raha hai...`,
  );

  if (!existsSync(ffmpegOut))
    await downloadAsset(tag, `ffmpeg-${suffix}`, ffmpegOut);
  if (!existsSync(ffprobeOut))
    await downloadAsset(tag, `ffprobe-${suffix}`, ffprobeOut);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
