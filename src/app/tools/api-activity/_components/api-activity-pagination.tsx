import Form from "next/form";

import { ApiActivityHiddenFields } from "@/app/tools/api-activity/_components/api-activity-hidden-fields";
import { Button } from "@/components/ui/button";

export function ApiActivityPagination({
  currentPage,
  failedOnly,
  pageSize,
  searchQuery,
  selectedEntryId,
  totalEntries,
  totalPages,
}: {
  currentPage: number;
  failedOnly: boolean;
  pageSize: number;
  searchQuery: string;
  selectedEntryId: null | string;
  totalEntries: number;
  totalPages: number;
}) {
  if (totalEntries === 0) {
    return null;
  }

  const rangeStart = (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, totalEntries);

  return (
    <div className="border-border-divider flex flex-wrap items-center justify-between gap-3 border-t px-6 py-4">
      <div className="text-text-secondary text-xs">
        Showing {rangeStart}-{rangeEnd} of {totalEntries}
      </div>

      {totalPages > 1 ? (
        <div className="flex flex-wrap items-center gap-2">
          <Form action="" replace scroll={false}>
            <ApiActivityHiddenFields
              currentPage={currentPage - 1}
              failedOnly={failedOnly}
              searchQuery={searchQuery}
              selectedEntryId={selectedEntryId}
            />
            <Button disabled={currentPage <= 1} type="submit" variant="outline">
              Previous
            </Button>
          </Form>

          <span className="text-text-secondary text-xs">
            Page {currentPage} of {totalPages}
          </span>

          <Form action="" replace scroll={false}>
            <ApiActivityHiddenFields
              currentPage={currentPage + 1}
              failedOnly={failedOnly}
              searchQuery={searchQuery}
              selectedEntryId={selectedEntryId}
            />
            <Button
              disabled={currentPage >= totalPages}
              type="submit"
              variant="outline"
            >
              Next
            </Button>
          </Form>
        </div>
      ) : null}
    </div>
  );
}
