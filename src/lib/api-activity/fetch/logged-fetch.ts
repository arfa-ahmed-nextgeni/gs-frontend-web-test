import "server-only";

import { randomUUID } from "node:crypto";

import { addApiActivityEntry } from "@/lib/api-activity/api-activity-store";
import {
  getDurationMs,
  normalizeLoggedFetchArgs,
  safelyCloneResponse,
  scheduleApiActivityTask,
  shouldLogRequest,
} from "@/lib/api-activity/fetch/helpers";
import {
  createBaseEntry,
  createResponseSnapshot,
  safelyCreateRequestSnapshot,
} from "@/lib/api-activity/fetch/snapshot";

import type {
  LoggedFetchLegacyArgs,
  LoggedFetchMeta,
} from "@/lib/api-activity/fetch/types";

export type { LoggedFetchMeta } from "@/lib/api-activity/fetch/types";

export function loggedFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
  meta?: LoggedFetchMeta
): Promise<Response>;
export function loggedFetch(args: LoggedFetchLegacyArgs): Promise<Response>;
export async function loggedFetch(
  inputOrArgs: LoggedFetchLegacyArgs | RequestInfo | URL,
  init?: RequestInit,
  meta?: LoggedFetchMeta
) {
  const normalizedArgs = normalizeLoggedFetchArgs(inputOrArgs, init, meta);
  const { init: requestInit, input, meta: loggingMeta } = normalizedArgs;

  if (!shouldLogRequest(input)) {
    return fetch(input, requestInit);
  }

  const startedAtPerformance = performance.now();
  const requestSnapshot = safelyCreateRequestSnapshot({
    init: requestInit,
    input,
  });

  try {
    const response = await fetch(input, requestInit);
    const durationMs = getDurationMs(startedAtPerformance);
    const endedAt = new Date().toISOString();
    const responseClone = safelyCloneResponse(response);

    if (!requestSnapshot) {
      return response;
    }

    scheduleApiActivityTask(async () => {
      const responseSnapshot = await createResponseSnapshot({
        response,
        responseClone,
      });

      addApiActivityEntry({
        ...createBaseEntry({
          durationMs,
          endedAt,
          meta: loggingMeta,
          request: requestSnapshot,
        }),
        error: null,
        id: randomUUID(),
        response: responseSnapshot,
      });
    });

    return response;
  } catch (error) {
    const durationMs = getDurationMs(startedAtPerformance);
    const endedAt = new Date().toISOString();

    if (!requestSnapshot) {
      throw error;
    }

    scheduleApiActivityTask(() => {
      addApiActivityEntry({
        ...createBaseEntry({
          durationMs,
          endedAt,
          meta: loggingMeta,
          request: requestSnapshot,
        }),
        error: {
          message:
            error instanceof Error ? error.message : "Unknown fetch error",
          name: error instanceof Error ? error.name : "UnknownError",
        },
        id: randomUUID(),
        response: null,
      });
    });

    throw error;
  }
}
