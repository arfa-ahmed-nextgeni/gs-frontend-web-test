import Form from "next/form";

import { ApiActivityEntrySubmitButton } from "@/app/tools/api-activity/_components/api-activity-entry-submit-button";
import { ApiActivityHiddenFields } from "@/app/tools/api-activity/_components/api-activity-hidden-fields";
import {
  formatDuration,
  formatTimestamp,
  getStatusTone,
} from "@/app/tools/api-activity/_components/api-activity-viewer-shared";

import type { ApiActivityEntrySummary } from "@/lib/api-activity/api-activity-types";

export function ApiActivityEntryListItem({
  autoRefreshEnabled,
  currentPage,
  entry,
  failedOnly,
  isSelected,
  searchQuery,
}: {
  autoRefreshEnabled: boolean;
  currentPage?: number;
  entry: ApiActivityEntrySummary;
  failedOnly: boolean;
  isSelected: boolean;
  searchQuery: string;
}) {
  return (
    <Form action="" replace scroll={false}>
      <ApiActivityHiddenFields
        autoRefreshEnabled={autoRefreshEnabled}
        currentPage={currentPage}
        failedOnly={failedOnly}
        searchQuery={searchQuery}
        selectedEntryId={entry.id}
      />
      <ApiActivityEntrySubmitButton isSelected={isSelected}>
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
      </ApiActivityEntrySubmitButton>
    </Form>
  );
}
