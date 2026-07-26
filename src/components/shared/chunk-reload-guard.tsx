"use client";

import { useEffect } from "react";

/**
 * Recovers users from a `ChunkLoadError` after a deploy.
 *
 * When a new build ships, a browser still holding the previous build's HTML
 * shell may lazily request an old JS chunk that is no longer served (404/403
 * from S3/CDN) — surfacing as a `ChunkLoadError` that breaks the page. This
 * listens for that error and performs a one-time `location.reload()`, which
 * fetches fresh HTML referencing the current build's chunks, turning a hard
 * break into an invisible refresh.
 *
 * This is a recovery net, NOT a fix for missing chunks — the real fix is
 * additive asset uploads + retention on the CDN. The timestamp guard prevents
 * a reload loop: if a chunk error recurs within RELOAD_GUARD_MS of the last
 * reload, the fresh build is genuinely broken, so we stop reloading and let
 * the error surface instead of looping forever.
 */
const RELOAD_GUARD_KEY = "chunkReloadAt";
const RELOAD_GUARD_MS = 10_000;

export function ChunkReloadGuard() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      if (isChunkLoadError(event.error) || isChunkLoadError(event.message)) {
        reloadOnce();
      }
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      if (isChunkLoadError(event.reason)) {
        reloadOnce();
      }
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}

function isChunkLoadError(reason: unknown): boolean {
  if (!reason) return false;

  const name =
    typeof reason === "object" && reason !== null && "name" in reason
      ? String((reason as { name?: unknown }).name)
      : "";
  const message =
    typeof reason === "string"
      ? reason
      : typeof reason === "object" && reason !== null && "message" in reason
        ? String((reason as { message?: unknown }).message)
        : "";

  return (
    name === "ChunkLoadError" ||
    /ChunkLoadError/i.test(message) ||
    /Loading chunk [^\s]+ failed/i.test(message) ||
    /Failed to load chunk/i.test(message) ||
    /error loading dynamically imported module/i.test(message)
  );
}

function reloadOnce() {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_GUARD_KEY) ?? "0");
    if (Date.now() - last < RELOAD_GUARD_MS) {
      // We reloaded very recently and the chunk still fails to load — the
      // current build is genuinely broken. Stop, don't loop.
      return;
    }
    sessionStorage.setItem(RELOAD_GUARD_KEY, String(Date.now()));
  } catch {
    // sessionStorage unavailable (private mode / blocked) — reload anyway;
    // the browser's own error UI is the backstop against a tight loop.
  }

  window.location.reload();
}
