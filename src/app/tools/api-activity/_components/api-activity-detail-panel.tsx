import { ApiActivityBodyPreview } from "@/app/tools/api-activity/_components/api-activity-body-preview";
import { ApiActivityHeadersList } from "@/app/tools/api-activity/_components/api-activity-headers-list";
import {
  formatDuration,
  formatTimestamp,
} from "@/app/tools/api-activity/_components/api-activity-viewer-shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getApiActivityFeatureState } from "@/lib/api-activity/api-activity-config";

import type { ApiActivityEntry } from "@/lib/api-activity/api-activity-types";

export function ApiActivityDetailPanel({
  selectedEntry,
  selectedEntryIsStale,
}: {
  selectedEntry: ApiActivityEntry | null;
  selectedEntryIsStale: boolean;
}) {
  const { redactionEnabled } = getApiActivityFeatureState();

  return (
    <Card className="border-border-divider bg-bg-default shadow-xs min-h-160 overflow-hidden">
      <CardHeader className="border-border-divider border-b">
        <CardTitle className="text-2xl">Request details</CardTitle>
        <CardDescription className="text-text-secondary text-sm leading-6">
          {redactionEnabled
            ? "Request and response details are redacted where sensitive values were detected."
            : "Request and response details are shown as captured. Redaction is currently disabled."}
        </CardDescription>
      </CardHeader>

      <CardContent className="max-h-[calc(100vh-10rem)] space-y-6 overflow-y-auto">
        {!selectedEntry ? (
          <div className="text-text-secondary py-12 text-sm">
            Select activity item to inspect request and response details.
          </div>
        ) : (
          <>
            {selectedEntryIsStale ? (
              <div className="border-border-divider bg-bg-surface rounded-xl border px-4 py-3 text-sm">
                Selected item is no longer in active log buffer. Showing cached
                snapshot until you choose another item.
              </div>
            ) : null}

            <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="border-border-divider bg-bg-surface rounded-xl border p-4">
                <div className="text-text-secondary text-xs uppercase tracking-[0.18em]">
                  Service
                </div>
                <div className="mt-2 text-sm font-semibold">
                  {selectedEntry.service}
                </div>
              </div>
              <div className="border-border-divider bg-bg-surface rounded-xl border p-4">
                <div className="text-text-secondary text-xs uppercase tracking-[0.18em]">
                  Status
                </div>
                <div className="mt-2 text-sm font-semibold">
                  {selectedEntry.error
                    ? selectedEntry.error.name
                    : selectedEntry.response
                      ? `${selectedEntry.response.status} ${selectedEntry.response.statusText}`
                      : "No response"}
                </div>
              </div>
              <div className="border-border-divider bg-bg-surface rounded-xl border p-4">
                <div className="text-text-secondary text-xs uppercase tracking-[0.18em]">
                  Duration
                </div>
                <div className="mt-2 text-sm font-semibold">
                  {formatDuration(selectedEntry.durationMs)}
                </div>
              </div>
              <div className="border-border-divider bg-bg-surface rounded-xl border p-4">
                <div className="text-text-secondary text-xs uppercase tracking-[0.18em]">
                  Initiator
                </div>
                <div className="wrap-break-word mt-2 text-sm font-semibold">
                  {selectedEntry.initiator}
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold">Request</h3>
              <div className="border-border-divider overflow-hidden rounded-xl border">
                <div className="border-border-divider grid grid-cols-[120px_minmax(0,1fr)] gap-3 border-b px-4 py-3 text-sm">
                  <span className="text-text-secondary font-medium">
                    Method
                  </span>
                  <span>{selectedEntry.request.method}</span>
                </div>
                <div className="border-border-divider grid grid-cols-[120px_minmax(0,1fr)] gap-3 border-b px-4 py-3 text-sm">
                  <span className="text-text-secondary font-medium">URL</span>
                  <span className="break-all">{selectedEntry.request.url}</span>
                </div>
                <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-3 px-4 py-3 text-sm">
                  <span className="text-text-secondary font-medium">
                    Started
                  </span>
                  <span>{formatTimestamp(selectedEntry.startedAt)}</span>
                </div>
                {selectedEntry.feature ? (
                  <div className="border-border-divider grid grid-cols-[120px_minmax(0,1fr)] gap-3 border-t px-4 py-3 text-sm">
                    <span className="text-text-secondary font-medium">
                      Feature
                    </span>
                    <span>{selectedEntry.feature}</span>
                  </div>
                ) : null}
                {selectedEntry.action ? (
                  <div className="border-border-divider grid grid-cols-[120px_minmax(0,1fr)] gap-3 border-t px-4 py-3 text-sm">
                    <span className="text-text-secondary font-medium">
                      Action
                    </span>
                    <span>{selectedEntry.action}</span>
                  </div>
                ) : null}
              </div>
            </section>

            <ApiActivityHeadersList
              headers={selectedEntry.request.headers}
              title="Request headers"
            />
            <ApiActivityBodyPreview
              body={selectedEntry.request.body}
              preferInlineGraphql
              title="Request body"
            />

            {selectedEntry.response ? (
              <>
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold">Response</h3>
                  <div className="border-border-divider overflow-hidden rounded-xl border">
                    <div className="border-border-divider grid grid-cols-[120px_minmax(0,1fr)] gap-3 border-b px-4 py-3 text-sm">
                      <span className="text-text-secondary font-medium">
                        Status
                      </span>
                      <span>
                        {selectedEntry.response.status}{" "}
                        {selectedEntry.response.statusText}
                      </span>
                    </div>
                    <div className="border-border-divider grid grid-cols-[120px_minmax(0,1fr)] gap-3 border-b px-4 py-3 text-sm">
                      <span className="text-text-secondary font-medium">
                        URL
                      </span>
                      <span className="break-all">
                        {selectedEntry.response.url}
                      </span>
                    </div>
                    <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-3 px-4 py-3 text-sm">
                      <span className="text-text-secondary font-medium">
                        Redirected
                      </span>
                      <span>
                        {selectedEntry.response.redirected ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                </section>

                <ApiActivityHeadersList
                  headers={selectedEntry.response.headers}
                  title="Response headers"
                />
                <ApiActivityBodyPreview
                  body={selectedEntry.response.body}
                  title="Response body"
                />
              </>
            ) : null}

            {selectedEntry.error ? (
              <section className="space-y-3">
                <h3 className="text-sm font-semibold">Error</h3>
                <div className="border-border-danger bg-label-error rounded-xl border px-4 py-3 text-sm">
                  <div className="font-semibold">
                    {selectedEntry.error.name}
                  </div>
                  <div className="wrap-break-word mt-1">
                    {selectedEntry.error.message}
                  </div>
                </div>
              </section>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
