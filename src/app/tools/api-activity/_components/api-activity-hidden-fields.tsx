import type { ApiActivityFilterState } from "@/app/tools/api-activity/_components/api-activity-viewer-shared";

export function ApiActivityHiddenFields({
  autoRefreshEnabled,
  currentPage,
  failedOnly,
  searchQuery,
  selectedEntryId,
}: Partial<ApiActivityFilterState>) {
  return (
    <>
      {autoRefreshEnabled ? (
        <input name="autoRefresh" type="hidden" value="1" />
      ) : null}
      {currentPage && currentPage > 1 ? (
        <input name="page" type="hidden" value={String(currentPage)} />
      ) : null}
      {searchQuery ? (
        <input name="q" type="hidden" value={searchQuery} />
      ) : null}
      {failedOnly ? <input name="failed" type="hidden" value="1" /> : null}
      {selectedEntryId ? (
        <input name="selected" type="hidden" value={selectedEntryId} />
      ) : null}
    </>
  );
}
