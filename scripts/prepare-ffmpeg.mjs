// `npm run app:dev` / `npm run app:build` se pehle chalta hai.
//
// User `src-tauri/binaries/ffmpeg(.exe)` aur `ffprobe(.exe)`
// plain naam ke sath rakhta hai.
//
// Tauri sidecars ko target-triple suffix chahiye hota hai:
//
//   ffmpeg-x86_64-pc-windows-msvc.exe
//   ffprobe-x86_64-pc-windows-msvc.exe
//   ffmpeg-aarch64-apple-darwin
//   ffprobe-aarch64-apple-darwin
//
// CI mein TARGET_TRIPLE environment variable actual build target
// provide karta hai (zaroori hai — warna macOS Intel cross-compile leg
// apne Apple-Silicon HOST ka triple use kar leta, jo galat hota). Local
// development mein agar TARGET_TRIPLE set na ho to Rust host triple
// use hota hai.

import { execSync } from "node:child_process";
import { existsSync, copyFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const binariesDir = join(__dirname, "..", "src-tauri", "binaries");

function getTargetTriple() {
  // GitHub Actions / cross-compilation: hamesha explicit build target ko
  // priority do.
  if (process.env.TARGET_TRIPLE) {
    return process.env.TARGET_TRIPLE.trim();
  }

  // Local development: Rust host triple pe fallback.
  try {
    return execSync("rustc --print host-tuple").toString().trim();
  } catch {
    // Older rustc fallback.
    const out = execSync("rustc -Vv").toString();
    const match = /host:\s*(\S+)/.exec(out);

    if (!match) {
      throw new Error(
        "Target triple nahi mil saka (rustc --print host-tuple / rustc -Vv se).",
      );
    }

    return match[1];
  }
}

function prepare(baseName) {
  const ext = process.platform === "win32" ? ".exe" : "";

  const plain = join(binariesDir, `${baseName}${ext}`);

  if (!existsSync(plain)) {
    console.warn(
      `[prepare-ffmpeg] ${plain} nahi mili — is naam se rakho: src-tauri/binaries/${baseName}${ext}`,
    );
    return;
  }

  const triple = getTargetTriple();

  if (!triple) {
    throw new Error(
      `[prepare-ffmpeg] Target triple empty hai. TARGET_TRIPLE set karo ya Rust install karo.`,
    );
  }

  const target = join(binariesDir, `${baseName}-${triple}${ext}`);

  copyFileSync(plain, target);

  console.log(
    `[prepare-ffmpeg] ${baseName}${ext} -> ${baseName}-${triple}${ext}`,
  );
}

prepare("ffmpeg");
prepare("ffprobe");
