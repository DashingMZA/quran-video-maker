import { useEffect, useState } from "react";
import {
  X,
  RefreshCw,
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { isTauri } from "../utils/platform";
import { useAppUpdater } from "../hooks/useAppUpdater";
import appInfo from "../../config/app-info.json";

interface DesktopAboutOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Desktop-only About page (never rendered on web).
 * Shows app information, the installed version, and the updater:
 * check for updates, download & install, relaunch.
 */
export default function DesktopAboutOverlay({
  isOpen,
  onClose,
}: DesktopAboutOverlayProps) {
  const [activeTab, setActiveTab] = useState<"info" | "updates">("info");
  const [appVersion, setAppVersion] = useState<string>(appInfo.version);
  const [appName, setAppName] = useState<string>(appInfo.appName);
  const updater = useAppUpdater();
  const { status, updateInfo, progress, error, checkForUpdates, downloadAndInstall } =
    updater;

  useEffect(() => {
    if (isOpen && isTauri()) {
      import("@tauri-apps/api/app")
        .then(async ({ getVersion, getName }) => {
          try {
            setAppVersion(`v${await getVersion()}`);
          } catch {
            /* keep fallback */
          }
          try {
            setAppName(await getName());
          } catch {
            /* keep fallback */
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  // Desktop only — never render on web.
  if (!isOpen || !isTauri()) return null;

  const renderUpdatesTab = () => (
    <div className="space-y-4">
      <div className="bg-zinc-800/60 border border-studio-border rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-studio-textMuted">Installed version</p>
            <p className="text-lg font-bold text-studio-text tabular-nums">
              {appVersion}
            </p>
          </div>
          <button
            onClick={() => checkForUpdates()}
            disabled={status === "checking" || status === "downloading"}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-studio-accent hover:bg-studio-accentHover disabled:opacity-50 text-white text-sm font-bold transition-colors"
          >
            {status === "checking" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Check for updates
          </button>
        </div>
      </div>

      {status === "checking" && (
        <p className="text-sm text-studio-textMuted flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Checking for updates…
        </p>
      )}

      {status === "up-to-date" && (
        <p className="text-sm text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> You are on the latest version.
        </p>
      )}

      {status === "available" && updateInfo && (
        <div className="bg-zinc-800/60 border border-studio-accent/40 rounded-xl p-4 space-y-3">
          <p className="text-sm font-semibold text-studio-text">
            Version v{updateInfo.version} is available
          </p>
          {updateInfo.date && (
            <p className="text-xs text-studio-textMuted">
              Released: {new Date(updateInfo.date).toLocaleDateString()}
            </p>
          )}
          {updateInfo.body && (
            <pre className="text-xs text-studio-textMuted whitespace-pre-wrap max-h-32 overflow-auto bg-black/30 rounded-lg p-3">
              {updateInfo.body}
            </pre>
          )}
          <button
            onClick={downloadAndInstall}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-studio-accent hover:bg-studio-accentHover text-white text-sm font-bold transition-colors"
          >
            <Download className="w-4 h-4" /> Download & install
          </button>
          <p className="text-[11px] text-studio-textMuted">
            The app will restart automatically after installation.
          </p>
        </div>
      )}

      {status === "downloading" && (
        <div className="bg-zinc-800/60 border border-studio-border rounded-xl p-4 space-y-2">
          <p className="text-sm font-semibold text-studio-text">
            Downloading update…
          </p>
          <div className="h-2.5 bg-zinc-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-studio-accent rounded-full transition-[width]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-studio-textMuted tabular-nums">
            {progress}%
          </p>
        </div>
      )}

      {status === "error" && (
        <p className="text-sm text-red-400 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="break-words">{error ?? "Update failed."}</span>
        </p>
      )}

      <p className="text-[11px] text-studio-textMuted leading-relaxed">
        Updates are fetched from the official GitHub releases and verified
        against the release signing key before installation.
      </p>
    </div>
  );

  const renderInfoTab = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <img
          src="/icon/web-app-manifest-512x512.png"
          alt="Quran Video Studio icon"
          className="w-16 h-16 rounded-2xl shadow-lg"
        />
        <div>
          <h3 className="text-xl font-bold text-studio-text">{appName}</h3>
          <p className="text-sm text-studio-textMuted tabular-nums">
            Version {appVersion} · Desktop
          </p>
        </div>
      </div>

      <p className="text-sm text-studio-textMuted leading-relaxed">
        {appInfo.description}
      </p>

      <div className="bg-zinc-800/60 border border-studio-border rounded-xl divide-y divide-studio-border">
        <div className="flex justify-between px-4 py-2.5">
          <span className="text-xs text-studio-textMuted">Author</span>
          <span className="text-xs font-semibold text-studio-text">
            {appInfo.author}
          </span>
        </div>
        <div className="flex justify-between px-4 py-2.5">
          <span className="text-xs text-studio-textMuted">License</span>
          <span className="text-xs font-semibold text-studio-text">GPL-3.0</span>
        </div>
        <div className="flex justify-between px-4 py-2.5">
          <span className="text-xs text-studio-textMuted">Platform</span>
          <span className="text-xs font-semibold text-studio-text">Desktop</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-[min(520px,94vw)] max-h-[86vh] overflow-hidden bg-studio-panel border border-studio-border rounded-2xl shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-studio-border">
          <h2 className="text-base font-bold text-studio-text">About</h2>
          <button
            onClick={onClose}
            className="text-studio-textMuted hover:text-studio-text transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-1 px-5 pt-3">
          {(["info", "updates"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                activeTab === tab
                  ? "bg-studio-accent text-white"
                  : "text-studio-textMuted hover:text-studio-text hover:bg-zinc-700/60"
              }`}
            >
              {tab === "info" ? "Information" : "Updates"}
            </button>
          ))}
        </div>

        <div className="p-5 overflow-y-auto">
          {activeTab === "info" ? renderInfoTab() : renderUpdatesTab()}
        </div>
      </div>
    </div>
  );
}
