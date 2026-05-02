import "server-only";

import {
  API_ACTIVITY_ENABLED,
  API_ACTIVITY_MAX_BODY_BYTES,
  API_ACTIVITY_MAX_ENTRIES,
  API_ACTIVITY_PASSWORD,
  API_ACTIVITY_REDACTION_ENABLED,
  API_ACTIVITY_RETENTION_HOURS,
} from "@/lib/config/server-env";

const DEFAULT_API_ACTIVITY_MAX_BODY_BYTES = 320_000;
const DEFAULT_API_ACTIVITY_MAX_ENTRIES = 200;
const DEFAULT_API_ACTIVITY_RETENTION_HOURS = 12;

export function getApiActivityCookieMaxAgeSeconds() {
  return getApiActivityFeatureState().retentionHours * 60 * 60;
}

export function getApiActivityFeatureState() {
  const enabled = API_ACTIVITY_ENABLED === "true";
  const passwordValue = API_ACTIVITY_PASSWORD?.trim() ?? "";
  const retentionHours = parsePositiveInteger(
    API_ACTIVITY_RETENTION_HOURS,
    DEFAULT_API_ACTIVITY_RETENTION_HOURS
  );
  const maxEntries = parsePositiveInteger(
    API_ACTIVITY_MAX_ENTRIES,
    DEFAULT_API_ACTIVITY_MAX_ENTRIES
  );
  const maxBodyBytes = parsePositiveInteger(
    API_ACTIVITY_MAX_BODY_BYTES,
    DEFAULT_API_ACTIVITY_MAX_BODY_BYTES
  );
  const passwordConfigured = Boolean(passwordValue);
  const redactionEnabled = API_ACTIVITY_REDACTION_ENABLED === "true";

  return {
    available: enabled && passwordConfigured,
    enabled,
    maxBodyBytes,
    maxEntries,
    passwordConfigured,
    passwordValue,
    redactionEnabled,
    retentionHours,
    retentionMs: retentionHours * 60 * 60 * 1000,
  };
}

export function isApiActivityLoggingEnabled() {
  return getApiActivityFeatureState().available;
}

export function isApiActivityRedactionEnabled() {
  return getApiActivityFeatureState().redactionEnabled;
}

function parsePositiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}
