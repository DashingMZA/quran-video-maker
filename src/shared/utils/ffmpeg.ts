/**
 * FFmpeg Sidecar helper for Tauri 2
 * Uses the bundled ffmpeg binary via @tauri-apps/plugin-shell
 */

import { Command } from "@tauri-apps/plugin-shell";

export interface FFmpegResult {
  code: number;
  stdout: string;
  stderr: string;
}

/**
 * Run ffmpeg with the given arguments
 * @example
 * await runFFmpeg(["-i", "input.mp4", "-c:v", "libx264", "output.mp4"]);
 */
export async function runFFmpeg(args: string[]): Promise<FFmpegResult> {
  const command = Command.sidecar("binaries/ffmpeg", args);
  const output = await command.execute();

  return {
    code: output.code ?? -1,
    stdout: output.stdout,
    stderr: output.stderr,
  };
}

/**
 * Run ffprobe with the given arguments
 */
export async function runFFprobe(args: string[]): Promise<FFmpegResult> {
  const command = Command.sidecar("binaries/ffprobe", args);
  const output = await command.execute();

  return {
    code: output.code ?? -1,
    stdout: output.stdout,
    stderr: output.stderr,
  };
}

/**
 * Get media duration in seconds using ffprobe
 */
export async function getMediaDuration(filePath: string): Promise<number> {
  const result = await runFFprobe([
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    filePath,
  ]);

  if (result.code !== 0) {
    throw new Error(`ffprobe failed: ${result.stderr}`);
  }

  const duration = parseFloat(result.stdout.trim());
  if (isNaN(duration)) {
    throw new Error("Could not parse duration");
  }

  return duration;
}

/**
 * Simple video conversion example
 * (You can expand this as needed)
 */
export async function convertVideo(
  inputPath: string,
  outputPath: string,
  options: {
    videoCodec?: string;
    audioCodec?: string;
    crf?: number;
    preset?: string;
  } = {},
): Promise<FFmpegResult> {
  const {
    videoCodec = "libx264",
    audioCodec = "aac",
    crf = 23,
    preset = "medium",
  } = options;

  const args = [
    "-y", // overwrite
    "-i",
    inputPath,
    "-c:v",
    videoCodec,
    "-preset",
    preset,
    "-crf",
    String(crf),
    "-c:a",
    audioCodec,
    "-b:a",
    "128k",
    outputPath,
  ];

  return runFFmpeg(args);
}
