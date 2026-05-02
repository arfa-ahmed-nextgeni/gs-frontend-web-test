import Form from "next/form";

import { ApiActivityHiddenFields } from "@/app/tools/api-activity/_components/api-activity-hidden-fields";
import {
  type ApiActivityFilterState,
  formatTimestamp,
} from "@/app/tools/api-activity/_components/api-activity-viewer-shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ApiActivityFilterForm({
  failedOnly,
  lastUpdatedAt,
  searchQuery,
  selectedEntryId,
}: {
  lastUpdatedAt: null | string;
} & ApiActivityFilterState) {
  return (
    <div className="space-y-3">
      <Form action="" replace scroll={false}>
        <div className="space-y-3">
          <Input
            defaultValue={searchQuery}
            name="q"
            placeholder="Search by service, method, path, or status"
          />
          <label className="text-text-secondary flex items-center gap-2 text-sm">
            <input
              className="accent-[--color-bg-primary]"
              defaultChecked={failedOnly}
              name="failed"
              type="checkbox"
              value="1"
            />
            Show failures only
          </label>
          <ApiActivityHiddenFields selectedEntryId={selectedEntryId} />
          <Button type="submit" variant="outline">
            Apply filters
          </Button>
        </div>
      </Form>
      <Form action="" replace scroll={false}>
        <Button type="submit" variant="outline">
          Clear
        </Button>
      </Form>
      <div className="text-text-secondary text-xs">
        {lastUpdatedAt
          ? `Latest activity at ${formatTimestamp(lastUpdatedAt)}`
          : "No activity recorded yet."}
      </div>
    </div>
  );
}
