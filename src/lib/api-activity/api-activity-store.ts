import "server-only";

import {
  getApiActivityCookieMaxAgeSeconds,
  getApiActivityFeatureState,
} from "@/lib/api-activity/api-activity-config";

import type {
  ApiActivityEntry,
  ApiActivityEntrySummary,
} from "@/lib/api-activity/api-activity-types";

type ApiActivitySelectedEntryCacheRecord = {
  entry: ApiActivityEntry;
  selectedAt: number;
};

declare global {
  var __apiActivityEntries__: ApiActivityEntry[] | undefined;
  var __apiActivitySelectedEntries__:
    | Map<string, ApiActivitySelectedEntryCacheRecord>
    | undefined;
}

export function addApiActivityEntry(entry: ApiActivityEntry) {
  const entries = getEntriesStore();

  entries.unshift(entry);
  pruneEntries(entries);
}

export function cacheApiActivitySelectedEntry({
  entry,
  sessionKey,
}: {
  entry: ApiActivityEntry;
  sessionKey: string;
}) {
  const selectedEntries = pruneCachedSelectedEntries(getSelectedEntriesStore());

  selectedEntries.set(sessionKey, {
    entry,
    selectedAt: Date.now(),
  });
}

export function clearApiActivityEntries() {
  getEntriesStore().length = 0;
}

export function clearCachedApiActivitySelectedEntry(sessionKey: string) {
  const selectedEntries = pruneCachedSelectedEntries(getSelectedEntriesStore());

  selectedEntries.delete(sessionKey);
}

export function getApiActivityEntries({
  limit,
}: {
  limit?: number;
} = {}) {
  const entries = pruneEntries(getEntriesStore());

  return (limit != null ? entries.slice(0, Math.max(1, limit)) : entries).map(
    getEntrySummary
  );
}

export function getApiActivityEntryById(id: string) {
  const entries = pruneEntries(getEntriesStore());

  return entries.find((entry) => entry.id === id) ?? null;
}

export function getCachedApiActivitySelectedEntry({
  id,
  sessionKey,
}: {
  id: string;
  sessionKey: string;
}) {
  const selectedEntries = pruneCachedSelectedEntries(getSelectedEntriesStore());
  const cachedSelectedEntry = selectedEntries.get(sessionKey);

  if (!cachedSelectedEntry || cachedSelectedEntry.entry.id !== id) {
    return null;
  }

  return cachedSelectedEntry.entry;
}

function getEntriesStore() {
  globalThis.__apiActivityEntries__ ??= [];
  return globalThis.__apiActivityEntries__;
}

function getEntrySummary(entry: ApiActivityEntry): ApiActivityEntrySummary {
  return {
    action: entry.action,
    durationMs: entry.durationMs,
    endedAt: entry.endedAt,
    feature: entry.feature,
    hasError: Boolean(entry.error),
    id: entry.id,
    method: entry.request.method,
    service: entry.service,
    startedAt: entry.startedAt,
    status: entry.response?.status ?? null,
    target: entry.target,
  };
}

function getRecordedAt(entry: ApiActivityEntry) {
  return Date.parse(entry.endedAt || entry.startedAt);
}

function getSelectedEntriesStore() {
  globalThis.__apiActivitySelectedEntries__ ??= new Map();
  return globalThis.__apiActivitySelectedEntries__;
}

function pruneCachedSelectedEntries(
  selectedEntries: Map<string, ApiActivitySelectedEntryCacheRecord>
) {
  const threshold = Date.now() - getApiActivityCookieMaxAgeSeconds() * 1_000;

  for (const [sessionKey, record] of selectedEntries) {
    if (record.selectedAt < threshold) {
      selectedEntries.delete(sessionKey);
    }
  }

  return selectedEntries;
}

function pruneEntries(entries: ApiActivityEntry[]) {
  const { maxEntries, retentionMs } = getApiActivityFeatureState();
  const threshold = Date.now() - retentionMs;
  let writeIndex = 0;

  for (const entry of entries) {
    const recordedAt = getRecordedAt(entry);

    if (!Number.isNaN(recordedAt) && recordedAt < threshold) {
      continue;
    }

    if (writeIndex >= maxEntries) {
      continue;
    }

    entries[writeIndex] = entry;
    writeIndex += 1;
  }

  entries.length = writeIndex;

  return entries;
}
