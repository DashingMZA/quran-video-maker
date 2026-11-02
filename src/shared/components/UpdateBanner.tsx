import { X, Download, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { isTauri } from "../utils/platform";
import type { UpdateStatus, UpdateInfo } from "../hooks/useAppUpdater";

interface UpdateBannerProps {
  status: UpdateStatus;
  updateInfo: UpdateInfo | null;
  progress: number;
  error: string | null;
  onUpdate: () => void;
  onDismiss: () => void;
}

/**
 * In-app update notification (desktop only). Appears when the startup
 * update check finds a newer version in latest.json.
 */
export default function UpdateBanner({
  status,
  updateInfo,
  progress,
  error,
  onUpdate,
  onDismiss,
}: UpdateBannerProps) {
  if (!isTauri()) return null;
  if (status !== "available" && status !== "downloading" && status !== "error") {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[min(480px,90vw)]">
      <div className="bg-studio-panel border border-studio-accent/50 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.6)] p-4 flex items-start gap-3">
        {status === "error" ? (
          <AlertCircle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
        ) : status === "available" ? (
          <Download className="w-6 h-6 text-studio-accent shrink-0 mt-0.5" />
        ) : (
          <Loader2 className="w-6 h-6 text-studio-accent shrink-0 mt-0.5 animate-spin" />
        )}

        <div className="flex-1 min-w-0">
          {status === "available" && updateInfo && (
            <>
              <p className="text-sm font-semibold text-studio-text">
                New version available: v{updateInfo.version}
              </p>
              <p className="text-xs text-studio-textMuted mt-0.5">
                You have v{updateInfo.currentVersion}. Click below to download
                and install.
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={onUpdate}
                  className="px-4 py-1.5 rounded-full bg-studio-accent hover:bg-studio-accentHover text-white text-xs font-bold transition-colors"
                >
                  Update now
                </button>
                <button
                  onClick={onDismiss}
                  className="px-4 py-1.5 rounded-full bg-zinc-700 hover:bg-zinc-600 text-studio-text text-xs font-semibold transition-colors"
                >
                  Later
                </button>
              </div>
            </>
          )}

          {status === "downloading" && (
            <>
              <p className="text-sm font-semibold text-studio-text">
                Downloading update…
              </p>
              <div className="h-2 bg-zinc-700 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-studio-accent rounded-full transition-[width]"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-studio-textMuted mt-1 tabular-nums">
                {progress}% — the app will restart when finished.
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <p className="text-sm font-semibold text-studio-text">
                Update failed
              </p>
              <p className="text-xs text-studio-textMuted mt-0.5 break-words">
                {error ?? "Unknown error"}
              </p>
            </>
          )}
        </div>

        <button
          onClick={onDismiss}
          className="text-studio-textMuted hover:text-studio-text transition-colors shrink-0"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {status === "available" && (
        <div className="flex items-center justify-center gap-1.5 mt-2 text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span className="text-[11px] font-medium">
            Signed update verified against the release key
          </span>
        </div>
      )}
    </div>
  );
}
