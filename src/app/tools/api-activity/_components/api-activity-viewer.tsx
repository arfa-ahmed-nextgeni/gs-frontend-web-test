import { ApiActivityAutoRefresh } from "@/app/tools/api-activity/_components/api-activity-auto-refresh";
import { ApiActivityDetailPanel } from "@/app/tools/api-activity/_components/api-activity-detail-panel";
import { ApiActivityEntryList } from "@/app/tools/api-activity/_components/api-activity-entry-list";
import { ApiActivityFilterForm } from "@/app/tools/api-activity/_components/api-activity-filter-form";
import { ApiActivityPagination } from "@/app/tools/api-activity/_components/api-activity-pagination";
import { ApiActivityToolbar } from "@/app/tools/api-activity/_components/api-activity-toolbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type {
  ApiActivityEntry,
  ApiActivityEntrySummary,
} from "@/lib/api-activity/api-activity-types";

export function ApiActivityViewer({
  allEntries,
  currentPage,
  failedOnly,
  pageSize,
  searchQuery,
  selectedEntry,
  selectedEntryId,
  selectedEntryIsStale,
  totalVisibleEntries,
  totalVisiblePages,
  visibleEntries,
}: {
  allEntries: ApiActivityEntrySummary[];
  currentPage: number;
  failedOnly: boolean;
  pageSize: number;
  searchQuery: string;
  selectedEntry: ApiActivityEntry | null;
  selectedEntryId: null | string;
  selectedEntryIsStale: boolean;
  totalVisibleEntries: number;
  totalVisiblePages: number;
  visibleEntries: ApiActivityEntrySummary[];
}) {
  const lastUpdatedAt = allEntries[0]?.startedAt ?? null;

  return (
    <>
      <ApiActivityAutoRefresh intervalMs={5_000} />

      <div className="grid gap-4 lg:grid-cols-[minmax(340px,420px)_minmax(0,1fr)]">
        <Card className="border-border-divider bg-bg-default shadow-xs min-h-160 overflow-hidden">
          <CardHeader className="border-border-divider gap-4 border-b">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-2">
                <CardTitle className="text-2xl">API Activity</CardTitle>
                <CardDescription className="text-text-secondary text-sm leading-6">
                  Recent server-side outbound requests. Page refreshes every 5
                  seconds.
                </CardDescription>
              </div>

              <ApiActivityToolbar
                failedOnly={failedOnly}
                searchQuery={searchQuery}
                selectedEntryId={selectedEntryId}
              />
            </div>

            <ApiActivityFilterForm
              failedOnly={failedOnly}
              lastUpdatedAt={lastUpdatedAt}
              searchQuery={searchQuery}
              selectedEntryId={selectedEntryId}
            />
          </CardHeader>

          <CardContent className="min-h-0 flex-1 px-0 py-0">
            <ApiActivityEntryList
              currentPage={currentPage}
              failedOnly={failedOnly}
              searchQuery={searchQuery}
              selectedEntryId={selectedEntryId}
              visibleEntries={visibleEntries}
            />
            <ApiActivityPagination
              currentPage={currentPage}
              failedOnly={failedOnly}
              pageSize={pageSize}
              searchQuery={searchQuery}
              selectedEntryId={selectedEntryId}
              totalEntries={totalVisibleEntries}
              totalPages={totalVisiblePages}
            />
          </CardContent>
        </Card>

        <ApiActivityDetailPanel
          selectedEntry={selectedEntry}
          selectedEntryIsStale={selectedEntryIsStale}
        />
      </div>
    </>
  );
}
