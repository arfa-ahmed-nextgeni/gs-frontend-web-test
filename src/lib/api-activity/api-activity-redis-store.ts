import { promisify } from "node:util";
import { constants, gunzip, gzip } from "node:zlib";

import type {
  ApiActivityEntry,
  ApiActivityEntrySummary,
} from "@/lib/api-activity/api-activity-types";

const API_ACTIVITY_KEY_PREFIX = "api-activity:v1:";
const API_ACTIVITY_INDEX_KEY = `${API_ACTIVITY_KEY_PREFIX}index`;
const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

export type ApiActivityRedisClient = {
  getBuffer(key: string): Promise<Buffer | null>;
  mget(...keys: string[]): Promise<Array<null | string>>;
  pipeline(): ApiActivityRedisPipeline;
  zcard(key: string): Promise<number>;
  zrange(key: string, start: number, stop: number): Promise<string[]>;
  zrangebyscore(
    key: string,
    min: number | string,
    max: number | string
  ): Promise<string[]>;
  zrevrange(key: string, start: number, stop: number): Promise<string[]>;
};

type ApiActivityRedisPipeline = {
  del(...keys: string[]): ApiActivityRedisPipeline;
  exec(): Promise<Array<[Error | null, unknown]>>;
  expire(key: string, seconds: number): ApiActivityRedisPipeline;
  set(
    key: string,
    value: Buffer | string,
    mode: "EX",
    duration: number
  ): ApiActivityRedisPipeline;
  zadd(key: string, score: number, member: string): ApiActivityRedisPipeline;
  zrem(key: string, ...members: string[]): ApiActivityRedisPipeline;
};

type ApiActivityStoreLimits = {
  maxEntries: number;
  retentionMs: number;
};

export function createApiActivityRedisStore(redis: ApiActivityRedisClient) {
  return {
    async add(
      entry: ApiActivityEntry,
      summary: ApiActivityEntrySummary,
      limits: ApiActivityStoreLimits
    ) {
      const retentionSeconds = getRetentionSeconds(limits.retentionMs);
      const recordedAt = getRecordedAt(entry);
      const compressedEntry = await gzipAsync(
        Buffer.from(JSON.stringify(entry)),
        {
          level: constants.Z_BEST_SPEED,
        }
      );
      const results = await redis
        .pipeline()
        .set(
          getSummaryKey(entry.id),
          JSON.stringify(summary),
          "EX",
          retentionSeconds
        )
        .set(getEntryKey(entry.id), compressedEntry, "EX", retentionSeconds)
        .zadd(API_ACTIVITY_INDEX_KEY, recordedAt, entry.id)
        .expire(API_ACTIVITY_INDEX_KEY, retentionSeconds)
        .exec();

      assertPipelineSucceeded(results);
      await pruneRedisEntries(redis, limits);
    },

    async clear() {
      const ids = await redis.zrange(API_ACTIVITY_INDEX_KEY, 0, -1);
      const pipeline = redis.pipeline().del(API_ACTIVITY_INDEX_KEY);

      if (ids.length > 0) {
        pipeline.del(
          ...ids.flatMap((id) => [getSummaryKey(id), getEntryKey(id)])
        );
      }

      assertPipelineSucceeded(await pipeline.exec());
    },

    async getById(id: string) {
      const compressedEntry = await redis.getBuffer(getEntryKey(id));

      if (!compressedEntry) {
        await removeRedisEntries(redis, [id]);
        return null;
      }

      try {
        const entry = JSON.parse(
          (await gunzipAsync(compressedEntry)).toString()
        ) as ApiActivityEntry;

        if (entry.id !== id) {
          throw new Error("Stored API Activity entry ID does not match key.");
        }

        return entry;
      } catch {
        await removeRedisEntries(redis, [id]);
        return null;
      }
    },

    async list(
      limits: ApiActivityStoreLimits,
      { limit }: { limit?: number } = {}
    ) {
      await pruneRedisEntries(redis, limits);

      const resultLimit =
        limit == null
          ? limits.maxEntries
          : Math.min(limits.maxEntries, Math.max(1, limit));
      const ids = await redis.zrevrange(
        API_ACTIVITY_INDEX_KEY,
        0,
        resultLimit - 1
      );

      if (ids.length === 0) {
        return [];
      }

      const values = await redis.mget(...ids.map(getSummaryKey));
      const staleIds: string[] = [];
      const entries = values.flatMap((value, index) => {
        if (!value) {
          staleIds.push(ids[index]);
          return [];
        }

        try {
          const summary = JSON.parse(value) as ApiActivityEntrySummary;

          if (summary.id !== ids[index]) {
            throw new Error(
              "Stored API Activity summary ID does not match key."
            );
          }

          return [summary];
        } catch {
          staleIds.push(ids[index]);
          return [];
        }
      });

      if (staleIds.length > 0) {
        await removeRedisEntries(redis, staleIds);
      }

      return entries;
    },
  };
}

function assertPipelineSucceeded(results: Array<[Error | null, unknown]>) {
  const failedResult = results.find(([error]) => error);

  if (failedResult?.[0]) {
    throw failedResult[0];
  }
}

function getEntryKey(id: string) {
  return `${API_ACTIVITY_KEY_PREFIX}entry:${id}`;
}

function getRecordedAt(entry: ApiActivityEntry) {
  const recordedAt = Date.parse(entry.endedAt || entry.startedAt);

  return Number.isNaN(recordedAt) ? Date.now() : recordedAt;
}

function getRetentionSeconds(retentionMs: number) {
  return Math.max(1, Math.ceil(retentionMs / 1_000));
}

function getSummaryKey(id: string) {
  return `${API_ACTIVITY_KEY_PREFIX}summary:${id}`;
}

async function pruneRedisEntries(
  redis: ApiActivityRedisClient,
  { maxEntries, retentionMs }: ApiActivityStoreLimits
) {
  const threshold = Date.now() - retentionMs;
  const expiredIds = await redis.zrangebyscore(
    API_ACTIVITY_INDEX_KEY,
    "-inf",
    threshold
  );

  if (expiredIds.length > 0) {
    await removeRedisEntries(redis, expiredIds);
  }

  const overflowCount =
    (await redis.zcard(API_ACTIVITY_INDEX_KEY)) - maxEntries;

  if (overflowCount <= 0) {
    return;
  }

  const overflowIds = await redis.zrange(
    API_ACTIVITY_INDEX_KEY,
    0,
    overflowCount - 1
  );

  if (overflowIds.length > 0) {
    await removeRedisEntries(redis, overflowIds);
  }
}

async function removeRedisEntries(
  redis: ApiActivityRedisClient,
  ids: string[]
) {
  const uniqueIds = [...new Set(ids)];

  if (uniqueIds.length === 0) {
    return;
  }

  const results = await redis
    .pipeline()
    .zrem(API_ACTIVITY_INDEX_KEY, ...uniqueIds)
    .del(...uniqueIds.flatMap((id) => [getSummaryKey(id), getEntryKey(id)]))
    .exec();

  assertPipelineSucceeded(results);
}
