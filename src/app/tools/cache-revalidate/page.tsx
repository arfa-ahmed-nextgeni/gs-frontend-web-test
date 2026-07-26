import type { ReactNode } from "react";
import { Suspense } from "react";

import type { Metadata } from "next";

import { ApiActivityAccessForm } from "@/app/tools/api-activity/_components/api-activity-access-form";
import { CacheRevalidateTagForm } from "@/app/tools/cache-revalidate/_components/cache-revalidate-tag-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getApiActivityAvailability,
  isApiActivityAuthenticated,
} from "@/lib/api-activity/api-activity-auth";
import { CacheTags } from "@/lib/constants/cache/tags";
import { ROUTES } from "@/lib/constants/routes";

type CacheRevalidateSearchParams = Promise<{
  error?: string | string[];
  revalidated?: string | string[];
  tag?: string | string[];
}>;

const CACHE_TAGS = Object.values(CacheTags);
const VALID_CACHE_TAGS = new Set<string>(CACHE_TAGS);

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
  title: "Cache Revalidate",
};

export default function CacheRevalidatePage({
  searchParams,
}: {
  searchParams: CacheRevalidateSearchParams;
}) {
  const availability = getApiActivityAvailability();

  if (!availability.available) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-4 py-16">
        <CacheRevalidateCardShell
          description="This tool is currently unavailable."
          title="Cache Revalidate"
        >
          Enable feature and configure password to manage cache tags.
        </CacheRevalidateCardShell>
      </main>
    );
  }

  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-4 py-16">
          <CacheRevalidateCardShell
            description="Loading current access state."
            title="Cache Revalidate"
          >
            Preparing cache revalidator...
          </CacheRevalidateCardShell>
        </main>
      }
    >
      <CacheRevalidatePageContent searchParams={searchParams} />
    </Suspense>
  );
}

function CacheRevalidateCardShell({
  children,
  description,
  title,
}: {
  children: ReactNode;
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

async function CacheRevalidatePageContent({
  searchParams,
}: {
  searchParams: CacheRevalidateSearchParams;
}) {
  const [authenticated, resolvedSearchParams] = await Promise.all([
    isApiActivityAuthenticated(),
    searchParams,
  ]);

  if (!authenticated) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-4 py-16">
        <ApiActivityAccessForm
          description="Enter the tool password to manage cache tags."
          passwordInputId="cache-revalidate-password"
          redirectTo={ROUTES.TOOLS.CACHE_REVALIDATE}
          submitLabel="Open cache revalidator"
        />
      </main>
    );
  }

  const statusMessage = getStatusMessage(resolvedSearchParams);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 md:px-6 md:py-8">
      <CacheRevalidateCardShell
        description="Manual admin cache tag invalidation."
        title="Cache Revalidate"
      >
        {statusMessage ? (
          <p className={statusMessage.className}>{statusMessage.message}</p>
        ) : null}

        <ul className="divide-border-divider mt-6 divide-y">
          {CACHE_TAGS.map((tag) => (
            <li
              className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
              key={tag}
            >
              <span className="text-text-primary font-mono text-sm">{tag}</span>

              <CacheRevalidateTagForm tag={tag} />
            </li>
          ))}
        </ul>
      </CacheRevalidateCardShell>
    </main>
  );
}

function getErrorMessage(error: string, tag: null | string) {
  if (error === "unavailable") {
    return "This tool is currently unavailable.";
  }

  if (error === "unauthorized") {
    return "Access expired. Enter the tool password again.";
  }

  if (error === "invalid") {
    return "Invalid cache tag.";
  }

  if (error === "failed" && tag && VALID_CACHE_TAGS.has(tag)) {
    return `Failed to revalidate tag: ${tag}.`;
  }

  return "Failed to revalidate cache tag.";
}

function getSearchParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : (value ?? null);
}

function getStatusMessage(searchParams: Awaited<CacheRevalidateSearchParams>) {
  const error = getSearchParamValue(searchParams.error);
  const tag = getSearchParamValue(searchParams.tag);
  const revalidated = getSearchParamValue(searchParams.revalidated);

  if (error) {
    return {
      className: "text-text-error text-sm",
      message: getErrorMessage(error, tag),
    };
  }

  if (revalidated && VALID_CACHE_TAGS.has(revalidated)) {
    return {
      className: "text-text-success text-sm",
      message: `Cache revalidated for tag: ${revalidated}.`,
    };
  }

  return null;
}
