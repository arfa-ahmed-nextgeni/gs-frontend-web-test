import "server-only";

import {
  getApiActivityCookieMaxAgeSeconds,
  getApiActivityFeatureState,
} from "@/lib/api-activity/api-activity-config";
import {
  type ApiActivityRedisClient,
  createApiActivityRedisStore,
} from "@/lib/api-activity/api-activity-redis-store";

import { getApiActivityRedisClient } from "../../../cache-runtime.mjs";

import type {
  ApiActivityEntry,
  ApiActivityEntrySummary,
} from "@/lib/api-activity/api-activity-types";

const ERROR_LOG_THROTTLE_MS = 30_000;
const lastErrorLoggedAt = new Map<string, number>();

type ApiActivitySelectedEntryCacheRecord = {
  entry: ApiActivityEntry;
  selectedAt: number;
};

declare global {
  var __apiActivityEntries__: ApiActivityEntry[] | undefined;
  var __apiActivityRedisStore__:
    | ReturnType<typeof createApiActivityRedisStore>
    | undefined;
  var __apiActivitySelectedEntries__:
    | Map<string, ApiActivitySelectedEntryCacheRecord>
    | undefined;
}

export async function addApiActivityEntry(entry: ApiActivityEntry) {
  try {
    const redisStore = getRedisStore();

    if (redisStore) {
      await redisStore.add(
        entry,
        getEntrySummary(entry),
        getApiActivityStoreLimits()
      );
      return;
    }

    const entries = getEntriesStore();

    entries.unshift(entry);
    pruneEntries(entries);
  } catch (error) {
    logStoreFailure("write", error);
  }
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

export async function clearApiActivityEntries() {
  const redisStore = getRedisStore();

  if (redisStore) {
    await redisStore.clear();
    return;
  }

  getEntriesStore().length = 0;
}

export function clearCachedApiActivitySelectedEntry(sessionKey: string) {
  const selectedEntries = pruneCachedSelectedEntries(getSelectedEntriesStore());

  selectedEntries.delete(sessionKey);
}

export async function getApiActivityEntries({
  limit,
}: {
  limit?: number;
} = {}) {
  try {
    const redisStore = getRedisStore();

    if (redisStore) {
      return await redisStore.list(getApiActivityStoreLimits(), { limit });
    }

    const entries = pruneEntries(getEntriesStore());

    return (limit != null ? entries.slice(0, Math.max(1, limit)) : entries).map(
      getEntrySummary
    );
  } catch (error) {
    logStoreFailure("read-list", error);
    return [];
  }
}

export async function getApiActivityEntryById(id: string) {
  try {
    const redisStore = getRedisStore();

    if (redisStore) {
      return await redisStore.getById(id);
    }

    const entries = pruneEntries(getEntriesStore());

    return entries.find((entry) => entry.id === id) ?? null;
  } catch (error) {
    logStoreFailure("read-entry", error);
    return null;
  }
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

function getApiActivityStoreLimits() {
  const { maxEntries, retentionMs } = getApiActivityFeatureState();

  return {
    maxEntries,
    retentionMs,
  };
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

function getRedisStore() {
  if (globalThis.__apiActivityRedisStore__) {
    return globalThis.__apiActivityRedisStore__;
  }

  const redis = getApiActivityRedisClient() as ApiActivityRedisClient | null;

  if (!redis) {
    return null;
  }

  globalThis.__apiActivityRedisStore__ = createApiActivityRedisStore(redis);
  return globalThis.__apiActivityRedisStore__;
}

function getSelectedEntriesStore() {
  globalThis.__apiActivitySelectedEntries__ ??= new Map();
  return globalThis.__apiActivitySelectedEntries__;
}

function logStoreFailure(operation: string, error: unknown) {
  const now = Date.now();
  const previous = lastErrorLoggedAt.get(operation) ?? 0;

  if (now - previous < ERROR_LOG_THROTTLE_MS) {
    return;
  }

  lastErrorLoggedAt.set(operation, now);
  console.warn(`[api-activity] Storage ${operation} failed.`, error);
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
  const { maxEntries, retentionMs } = getApiActivityStoreLimits();
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
