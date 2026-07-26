import Redis from "ioredis";

const API_ACTIVITY_CLIENT_SYMBOL = Symbol.for(
  "magnext.api-activity.redis-client"
);
const CLIENTS_SYMBOL = Symbol.for("magnext.valkey.clients");
const CACHE_KEY_PATTERNS = [
  "nextjs:data-cache:*",
  "nextjs:tags:*",
  "nextjs:server-cache:*",
  "nextjs:server-tags:*",
];
const LOG_THROTTLE_MS = 30_000;
const THROTTLED_EVENTS = new Set(["close", "error", "reconnecting"]);

export async function clearRedisCache(redis) {
  let deleted = 0;

  for (const pattern of CACHE_KEY_PATTERNS) {
    let cursor = "0";

    do {
      const [nextCursor, keys] = await redis.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        500
      );
      cursor = nextCursor;

      if (keys.length > 0) {
        deleted += await redis.del(...keys);
      }
    } while (cursor !== "0");
  }

  return deleted;
}

export function createRedisAdapter(redis) {
  return {
    del: (...keys) => redis.del(...keys),
    exists: (...keys) => redis.exists(...keys),
    get: (key) => redis.get(key),
    hGet: (key, field) => redis.hget(key, field),
    hGetAll: (key) => redis.hgetall(key),
    hSet: (key, field, value) => redis.hset(key, field, value),
    set: (key, value, ...args) => redis.set(key, value, ...args),
    ttl: (key) => redis.ttl(key),
  };
}

export function getApiActivityRedisClient() {
  const source = resolveApiActivityRedisSource();

  if (source.type === "memory") {
    return null;
  }

  if (!globalThis[API_ACTIVITY_CLIENT_SYMBOL]) {
    const client =
      source.type === "redis-url"
        ? new Redis(source.url, createApiActivityRedisOptions())
        : getSharedRedisClient(source.endpoint).duplicate({
            connectionName: "magnext-api-activity",
          });

    globalThis[API_ACTIVITY_CLIENT_SYMBOL] = attachConnectionLogging(
      client,
      "Valkey:api-activity"
    );
  }

  return globalThis[API_ACTIVITY_CLIENT_SYMBOL];
}

export function getCacheBackend() {
  return getCacheBackendFromEnv(process.env);
}

export function getSharedRedisClient(endpoint) {
  const env = process.env;
  const key = JSON.stringify({
    endpoint,
    port: parsePort(env.ELASTICACHE_PORT),
    tls: env.ELASTICACHE_TLS !== "false",
  });
  const clients = getClientRegistry();

  if (!clients.has(key)) {
    clients.set(key, createRedisClient(endpoint));
  }

  return clients.get(key);
}

function attachConnectionLogging(client, label = "Valkey") {
  const log = createConnectionLogger(label);

  for (const event of ["ready", "close", "end"]) {
    client.on(event, () => log(event));
  }

  client.on("reconnecting", (delay) => log("reconnecting", { delay }));
  client.on("error", (error) => log("error", error));

  return client;
}

function createApiActivityRedisOptions() {
  return {
    commandTimeout: 3_000,
    connectionName: "magnext-api-activity",
    connectTimeout: 10_000,
    enableOfflineQueue: false,
    keepAlive: 10_000,
    maxRetriesPerRequest: 1,
    reconnectOnError: redisReconnectOnError,
    retryStrategy: redisRetryStrategy,
  };
}

function createConnectionLogger(label) {
  const lastLoggedAt = new Map();

  return (event, detail) => {
    const now = Date.now();
    const previous = lastLoggedAt.get(event) || 0;

    if (THROTTLED_EVENTS.has(event) && now - previous < LOG_THROTTLE_MS) {
      return;
    }
    lastLoggedAt.set(event, now);

    const message = `[${label}] ${event}`;
    if (event === "error") {
      console.warn(message, detail);
      return;
    }

    console.info(message, detail ?? "");
  };
}

function createRedisClient(endpoint) {
  const client = new Redis(createRedisOptions(endpoint));
  return attachConnectionLogging(client);
}

function createRedisOptions(endpoint) {
  const env = process.env;
  const password =
    env.ELASTICACHE_AUTH_TOKEN || env.REDIS_PASSWORD || undefined;
  const tlsEnabled = env.ELASTICACHE_TLS !== "false";

  return {
    commandTimeout: 3_000,
    connectTimeout: 10_000,
    enableOfflineQueue: false,
    host: endpoint,
    keepAlive: 10_000,
    maxRetriesPerRequest: 1,
    password,
    port: parsePort(env.ELASTICACHE_PORT),
    reconnectOnError: redisReconnectOnError,
    retryStrategy: redisRetryStrategy,
    tls: tlsEnabled ? {} : undefined,
  };
}

function getCacheBackendFromEnv(env) {
  const backend = env.CACHE_BACKEND || "memory";

  if (backend !== "memory" && backend !== "elasticache") {
    throw new Error(
      `Unsupported CACHE_BACKEND "${backend}". Expected "memory" or "elasticache".`
    );
  }

  return backend;
}

function getClientRegistry() {
  if (!globalThis[CLIENTS_SYMBOL]) {
    globalThis[CLIENTS_SYMBOL] = new Map();
  }

  return globalThis[CLIENTS_SYMBOL];
}

function parsePort(value, fallback = 6_379) {
  if (!value) return fallback;

  const port = Number.parseInt(value, 10);
  return Number.isInteger(port) && port > 0 ? port : fallback;
}

function redisReconnectOnError(error) {
  return error.message.includes("READONLY") ? 1 : false;
}

function redisRetryStrategy(times) {
  return Math.min(times * 250, 5_000);
}

function resolveApiActivityRedisSource(env = process.env) {
  const redisUrl = env.API_ACTIVITY_REDIS_URL?.trim();

  if (redisUrl) {
    return {
      type: "redis-url",
      url: redisUrl,
    };
  }

  if (getCacheBackendFromEnv(env) === "elasticache") {
    const endpoint = env.ELASTICACHE_ENDPOINT?.trim();

    if (!endpoint) {
      throw new Error(
        "ElastiCache endpoint is required. Set ELASTICACHE_ENDPOINT."
      );
    }

    return {
      endpoint,
      type: "elasticache",
    };
  }

  return { type: "memory" };
}
