import Form from "next/form";

import { ApiActivityHiddenFields } from "@/app/tools/api-activity/_components/api-activity-hidden-fields";
import {
  formatDuration,
  formatTimestamp,
  getStatusTone,
} from "@/app/tools/api-activity/_components/api-activity-viewer-shared";

import type { ApiActivityEntrySummary } from "@/lib/api-activity/api-activity-types";

export function ApiActivityEntryListItem({
  currentPage,
  entry,
  failedOnly,
  isSelected,
  searchQuery,
}: {
  currentPage?: number;
  entry: ApiActivityEntrySummary;
  failedOnly: boolean;
  isSelected: boolean;
  searchQuery: string;
}) {
  return (
    <Form action="" replace scroll={false}>
      <ApiActivityHiddenFields
        currentPage={currentPage}
        failedOnly={failedOnly}
        searchQuery={searchQuery}
        selectedEntryId={entry.id}
      />
      <button
        aria-current={isSelected ? "page" : undefined}
        className={`border-border-divider block w-full border-b px-6 py-4 text-left transition-colors last:border-b-0 ${
          isSelected ? "bg-bg-soft" : "hover:bg-bg-surface"
        }`}
        type="submit"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-text-primary border-border-divider rounded-full border px-2.5 py-1 text-xs font-semibold">
            {entry.method}
          </span>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusTone(
              {
                hasError: entry.hasError,
                status: entry.status,
              }
            )}`}
          >
            {entry.hasError
              ? "Error"
              : entry.status != null
                ? `${entry.status}`
                : "Pending"}
          </span>
          <span className="text-text-secondary text-xs uppercase tracking-[0.18em]">
            {entry.service}
          </span>
        </div>
        <div className="wrap-break-word mt-3 text-sm font-medium">
          {entry.target}
        </div>
        <div className="text-text-secondary mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          <span>{formatTimestamp(entry.startedAt)}</span>
          <span>{formatDuration(entry.durationMs)}</span>
        </div>
      </button>
    </Form>
  );
}
