import React from "react";
import ReactDOM from "react-dom/client";
import { isTauri } from "./shared/utils/platform";

// The Tauri window starts with `visible: false` (tauri.conf.json) to avoid a
// white flash — show it as soon as the bundle loads (desktop only).
if (isTauri()) {
  import("@tauri-apps/api/window")
    .then(({ getCurrentWindow }) => getCurrentWindow().show())
    .catch(() => {});
}

// Prevent context menu (right-click) globally for native feel
document.addEventListener("contextmenu", (event) => event.preventDefault());

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

function showBootError(err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  const stack = err instanceof Error ? (err.stack ?? "") : "";
  console.error("BOOT ERROR:", err);
  rootElement!.innerHTML = `
    <div style="padding:24px;font-family:system-ui,sans-serif;background:#09090b;color:#f4f4f5;min-height:100vh;box-sizing:border-box;">
      <h1 style="color:#f87171;margin:0 0 12px;font-size:20px;">App failed to start</h1>
      <pre style="white-space:pre-wrap;background:#18181b;padding:16px;border-radius:8px;border:1px solid #27272a;font-size:13px;overflow:auto;max-height:70vh;">${message}

${stack}</pre>
      <p style="color:#a1a1aa;margin-top:16px;">Open DevTools (F12) → Console. Copy the full red error and share it.</p>
    </div>
  `;
}

async function boot() {
  try {
    // Load CSS (non-fatal if it fails)
    try {
      await import("./index.css");
    } catch (cssErr) {
      console.warn("CSS failed to load:", cssErr);
    }

    const { default: App } = await import("./app/App");
    const root = ReactDOM.createRoot(rootElement!);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
  } catch (err) {
    showBootError(err);
  }
}

boot();

window.addEventListener("error", (e) => {
  console.error("Window error:", e.error || e.message);
});
window.addEventListener("unhandledrejection", (e) => {
  console.error("Unhandled rejection:", e.reason);
});
