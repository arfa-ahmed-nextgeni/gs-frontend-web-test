import { Suspense } from "react";

import type { Metadata } from "next";

import { ApiActivityAccessForm } from "@/app/tools/api-activity/_components/api-activity-access-form";
import { ApiActivityViewer } from "@/app/tools/api-activity/_components/api-activity-viewer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getApiActivityAvailability,
  getApiActivitySessionKey,
  isApiActivityAuthenticated,
} from "@/lib/api-activity/api-activity-auth";
import {
  cacheApiActivitySelectedEntry,
  getApiActivityEntries,
  getApiActivityEntryById,
  getCachedApiActivitySelectedEntry,
} from "@/lib/api-activity/api-activity-store";

import type { ApiActivityEntrySummary } from "@/lib/api-activity/api-activity-types";

const API_ACTIVITY_PAGE_SIZE = 50;

type ApiActivityPageSearchParams = Promise<{
  failed?: string | string[];
  page?: string | string[];
  q?: string | string[];
  selected?: string | string[];
}>;

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
  title: "API Activity",
};

export default function ApiActivityPage({
  searchParams,
}: {
  searchParams: ApiActivityPageSearchParams;
}) {
  const availability = getApiActivityAvailability();

  if (!availability.available) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-4 py-16">
        <ApiActivityCardShell
          description="This tool is currently unavailable."
          title="API Activity"
        >
          Enable feature and configure password to inspect recent server-side
          outbound requests.
        </ApiActivityCardShell>
      </main>
    );
  }

  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-4 py-16">
          <ApiActivityCardShell
            description="Loading current access state and recent activity."
            title="API Activity"
          >
            Preparing viewer...
          </ApiActivityCardShell>
        </main>
      }
    >
      <ApiActivityPageContent searchParams={searchParams} />
    </Suspense>
  );
}

function ApiActivityCardShell({
  children,
  description,
  title,
}: {
  children: React.ReactNode;
  description: string;
  title: string;
}) {
  return (
    <Card className="border-border-divider bg-bg-default shadow-xs w-full">
      <CardHeader className="gap-3">
        <CardTitle className="text-3xl">{title}</CardTitle>
        <CardDescription className="text-text-secondary text-base leading-7">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-text-secondary text-sm leading-7">
        {children}
      </CardContent>
    </Card>
  );
}

async function ApiActivityPageContent({
  searchParams,
}: {
  searchParams: ApiActivityPageSearchParams;
}) {
  const [authenticated, resolvedSearchParams, sessionKey] = await Promise.all([
    isApiActivityAuthenticated(),
    searchParams,
    getApiActivitySessionKey(),
  ]);

  if (!authenticated) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-4 py-16">
        <ApiActivityAccessForm />
      </main>
    );
  }

  const allEntries = getApiActivityEntries();
  const searchQuery = getSearchParamValue(resolvedSearchParams.q) ?? "";
  const failedOnly = getSearchParamValue(resolvedSearchParams.failed) === "1";
  const requestedPage = getPageParamValue(resolvedSearchParams.page);
  const requestedSelectedEntryId = getSearchParamValue(
    resolvedSearchParams.selected
  );
  const filteredEntries = filterApiActivityEntries({
    entries: allEntries,
    failedOnly,
    searchQuery,
  });
  const totalVisiblePages = getTotalPages(filteredEntries.length);
  const currentPage = getCurrentPage({
    entries: filteredEntries,
    requestedPage,
    requestedSelectedEntryId,
  });
  const visibleEntries = getEntriesForPage(filteredEntries, currentPage);
  const requestedSelectedEntryState = requestedSelectedEntryId
    ? getSelectedApiActivityEntry({
        id: requestedSelectedEntryId,
        sessionKey,
      })
    : null;
  const selectedEntryId =
    requestedSelectedEntryId && requestedSelectedEntryState?.entry
      ? requestedSelectedEntryId
      : (visibleEntries[0]?.id ?? null);
  const selectedEntry =
    requestedSelectedEntryState?.entry ??
    (selectedEntryId ? getApiActivityEntryById(selectedEntryId) : null);
  const selectedEntryIsStale = requestedSelectedEntryState?.isStale ?? false;

  return (
    <main className="max-w-360 mx-auto w-full px-4 py-6 md:px-6 md:py-8">
      <ApiActivityViewer
        allEntries={allEntries}
        currentPage={currentPage}
        failedOnly={failedOnly}
        pageSize={API_ACTIVITY_PAGE_SIZE}
        searchQuery={searchQuery}
        selectedEntry={selectedEntry}
        selectedEntryId={selectedEntryId}
        selectedEntryIsStale={selectedEntryIsStale}
        totalVisibleEntries={filteredEntries.length}
        totalVisiblePages={totalVisiblePages}
        visibleEntries={visibleEntries}
      />
    </main>
  );
}

function filterApiActivityEntries({
  entries,
  failedOnly,
  searchQuery,
}: {
  entries: ApiActivityEntrySummary[];
  failedOnly: boolean;
  searchQuery: string;
}) {
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  return entries.filter((entry) => {
    if (failedOnly && !entry.hasError && (entry.status ?? 0) < 400) {
      return false;
    }

    if (!normalizedSearchQuery) {
      return true;
    }

    return [
      entry.action ?? "",
      entry.feature ?? "",
      entry.method,
      entry.service,
      entry.target,
      String(entry.status ?? ""),
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalizedSearchQuery);
  });
}

function getCurrentPage({
  entries,
  requestedPage,
  requestedSelectedEntryId,
}: {
  entries: ApiActivityEntrySummary[];
  requestedPage: number;
  requestedSelectedEntryId: null | string;
}) {
  const selectedEntryIndex = requestedSelectedEntryId
    ? entries.findIndex((entry) => entry.id === requestedSelectedEntryId)
    : -1;
  const totalPages = getTotalPages(entries.length);

  if (selectedEntryIndex >= 0) {
    return Math.floor(selectedEntryIndex / API_ACTIVITY_PAGE_SIZE) + 1;
  }

  return Math.min(requestedPage, totalPages);
}

function getEntriesForPage(entries: ApiActivityEntrySummary[], page: number) {
  const startIndex = (page - 1) * API_ACTIVITY_PAGE_SIZE;

  return entries.slice(startIndex, startIndex + API_ACTIVITY_PAGE_SIZE);
}

function getPageParamValue(value: string | string[] | undefined) {
  const pageValue = getSearchParamValue(value);
  const parsedPage = pageValue ? Number.parseInt(pageValue, 10) : Number.NaN;

  return Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
}

function getSearchParamValue(
  value: string | string[] | undefined
): null | string {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function getSelectedApiActivityEntry({
  id,
  sessionKey,
}: {
  id: string;
  sessionKey: null | string;
}) {
  const liveEntry = getApiActivityEntryById(id);

  if (liveEntry) {
    if (sessionKey) {
      cacheApiActivitySelectedEntry({
        entry: liveEntry,
        sessionKey,
      });
    }

    return {
      entry: liveEntry,
      isStale: false,
    };
  }

  if (!sessionKey) {
    return null;
  }

  const cachedEntry = getCachedApiActivitySelectedEntry({
    id,
    sessionKey,
  });

  return cachedEntry
    ? {
        entry: cachedEntry,
        isStale: true,
      }
    : null;
}

function getTotalPages(totalEntries: number) {
  return Math.max(1, Math.ceil(totalEntries / API_ACTIVITY_PAGE_SIZE));
}
