# FFmpeg / FFprobe Sidecars

Ye folder Tauri ke external binaries (sidecars) ke liye hai.

## Automatic Download (Recommended)

Manually download karne ki zaroorat nahi. Neeche wali command chalao:

```bash
npm run prepare:ffmpeg
# ya
npm run fetch:ffmpeg
```

Ye script (`scripts/fetch-ffmpeg.mjs`) current platform ke liye **static** ffmpeg + ffprobe download kar legi  
source: [descriptinc/ffmpeg-ffprobe-static](https://github.com/descriptinc/ffmpeg-ffprobe-static)

Phir `prepare-ffmpeg.mjs` unhe Tauri ke required naam (target-triple suffix) mein copy kar dega.

### App commands (auto prepare)

```bash
npm run app:dev     # automatically prepare:ffmpeg karke tauri dev chalata hai
npm run app:build   # automatically prepare:ffmpeg karke tauri build
```

## Manual Placement (agar auto nahi chahiye)

Agar aap khud binaries rakhna chahte ho to yeh naam use karein:

| Platform            | Plain name (script ke liye) | Final name (Tauri ke liye)          |
| ------------------- | --------------------------- | ----------------------------------- |
| Windows x64         | `ffmpeg.exe`                | `ffmpeg-x86_64-pc-windows-msvc.exe` |
| Linux x64           | `ffmpeg`                    | `ffmpeg-x86_64-unknown-linux-gnu`   |
| macOS Apple Silicon | `ffmpeg`                    | `ffmpeg-aarch64-apple-darwin`       |
| macOS Intel         | `ffmpeg`                    | `ffmpeg-x86_64-apple-darwin`        |

Same pattern `ffprobe` ke liye bhi.

## Notes

- Binaries ko **git mein commit mat karo** (size bohot badi hoti hai ~100MB+).
- `.gitignore` mein already ignore hona chahiye.
- Static builds prefer kiye gaye hain taake users ko extra libraries na chahiye.
