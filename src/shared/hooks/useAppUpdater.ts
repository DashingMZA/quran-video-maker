import { useCallback, useRef, useState } from "react";
import { isTauri } from "../utils/platform";

export type UpdateStatus =
  | "idle"
  | "checking"
  | "available"
  | "downloading"
  | "up-to-date"
  | "error";

export interface UpdateInfo {
  version: string;
  currentVersion: string;
  date?: string;
  body?: string;
}

/**
 * Desktop-only app updater (Tauri v2 updater plugin).
 * All methods are no-ops on web — calls are gated behind isTauri().
 */
export function useAppUpdater() {
  const [status, setStatus] = useState<UpdateStatus>("idle");
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const checkingRef = useRef(false);

  const checkForUpdates = useCallback(async (): Promise<UpdateInfo | null> => {
    if (!isTauri() || checkingRef.current) return null;
    checkingRef.current = true;
    setStatus("checking");
    setError(null);
    try {
      const { check } = await import("@tauri-apps/plugin-updater");
      const update = await check();
      if (!update) {
        setStatus("up-to-date");
        setUpdateInfo(null);
        return null;
      }
      const info: UpdateInfo = {
        version: update.version,
        currentVersion: update.currentVersion,
        date: update.date ?? undefined,
        body: update.body ?? undefined,
      };
      setUpdateInfo(info);
      setStatus("available");
      return info;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStatus("error");
      return null;
    } finally {
      checkingRef.current = false;
    }
  }, []);

  const downloadAndInstall = useCallback(async (): Promise<void> => {
    if (!isTauri()) return;
    setStatus("downloading");
    setProgress(0);
    setError(null);
    try {
      const { check } = await import("@tauri-apps/plugin-updater");
      const { relaunch } = await import("@tauri-apps/plugin-process");
      const update = await check();
      if (!update) {
        setStatus("up-to-date");
        return;
      }
      let downloaded = 0;
      let total = 0;
      await update.downloadAndInstall((event) => {
        if (event.event === "Started") {
          total = event.data.contentLength ?? 0;
          downloaded = 0;
          setProgress(0);
        } else if (event.event === "Progress") {
          downloaded += event.data.chunkLength;
          if (total > 0) {
            setProgress(Math.min(99, Math.round((downloaded / total) * 100)));
          }
        } else if (event.event === "Finished") {
          setProgress(100);
        }
      });
      await relaunch();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStatus("error");
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setUpdateInfo(null);
    setProgress(0);
    setError(null);
  }, []);

  return {
    status,
    updateInfo,
    progress,
    error,
    checkForUpdates,
    downloadAndInstall,
    reset,
  };
}
