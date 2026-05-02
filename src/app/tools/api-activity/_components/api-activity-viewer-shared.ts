import type { ApiActivityEntrySummary } from "@/lib/api-activity/api-activity-types";

export type ApiActivityFilterState = {
  currentPage?: number;
  failedOnly: boolean;
  searchQuery: string;
  selectedEntryId: null | string;
};

export function formatDuration(durationMs: number) {
  if (durationMs < 1_000) {
    return `${durationMs} ms`;
  }

  return `${(durationMs / 1_000).toFixed(2)} s`;
}

export function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    second: "2-digit",
  }).format(new Date(value));
}

export function getStatusTone({
  hasError,
  status,
}: Pick<ApiActivityEntrySummary, "hasError" | "status">) {
  if (hasError || status == null || status >= 500) {
    return "bg-label-error text-text-error";
  }

  if (status >= 400) {
    return "bg-label-warning text-text-danger";
  }

  return "bg-label-success text-text-accent";
}
