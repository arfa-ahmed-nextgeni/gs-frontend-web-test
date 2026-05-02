import Form from "next/form";

import { ApiActivityClearLogsDialog } from "@/app/tools/api-activity/_components/api-activity-clear-logs-dialog";
import { ApiActivityHiddenFields } from "@/app/tools/api-activity/_components/api-activity-hidden-fields";
import { ApiActivityRefreshButton } from "@/app/tools/api-activity/_components/api-activity-refresh-button";
import { Button } from "@/components/ui/button";
import { logoutApiActivity } from "@/lib/actions/api-activity/logout-api-activity";

import type { ApiActivityFilterState } from "@/app/tools/api-activity/_components/api-activity-viewer-shared";

export function ApiActivityToolbar({
  failedOnly,
  searchQuery,
  selectedEntryId,
}: ApiActivityFilterState) {
  return (
    <div className="flex flex-wrap gap-2">
      <ApiActivityRefreshButton />
      <ApiActivityClearLogsDialog />

      <Form action={logoutApiActivity}>
        <ApiActivityHiddenFields
          failedOnly={failedOnly}
          searchQuery={searchQuery}
          selectedEntryId={selectedEntryId}
        />
        <Button type="submit" variant="outline">
          Logout
        </Button>
      </Form>
    </div>
  );
}
