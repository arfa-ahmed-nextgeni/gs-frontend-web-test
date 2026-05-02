import { ApiActivityEntryListItem } from "@/app/tools/api-activity/_components/api-activity-entry-list-item";

import type { ApiActivityEntrySummary } from "@/lib/api-activity/api-activity-types";

export function ApiActivityEntryList({
  currentPage,
  failedOnly,
  searchQuery,
  selectedEntryId,
  visibleEntries,
}: {
  currentPage?: number;
  failedOnly: boolean;
  searchQuery: string;
  selectedEntryId: null | string;
  visibleEntries: ApiActivityEntrySummary[];
}) {
  if (visibleEntries.length === 0) {
    return (
      <div className="text-text-secondary px-6 py-8 text-sm">
        No activity matches current filters yet.
      </div>
    );
  }

  return (
    <div className="max-h-[calc(100vh-18rem)] overflow-y-auto">
      {visibleEntries.map((entry) => (
        <ApiActivityEntryListItem
          currentPage={currentPage}
          entry={entry}
          failedOnly={failedOnly}
          isSelected={entry.id === selectedEntryId}
          key={entry.id}
          searchQuery={searchQuery}
        />
      ))}
    </div>
  );
}
