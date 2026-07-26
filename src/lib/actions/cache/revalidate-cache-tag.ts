/* eslint-disable no-restricted-imports -- Standalone tools route has no next-intl context. */
"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

import {
  getApiActivityAvailability,
  isApiActivityAuthenticated,
} from "@/lib/api-activity/api-activity-auth";
import { CacheTags } from "@/lib/constants/cache/tags";
import { ROUTES } from "@/lib/constants/routes";

const VALID_CACHE_TAGS = new Set<string>(Object.values(CacheTags));

export async function revalidateCacheTag(formData: FormData) {
  const availability = getApiActivityAvailability();

  if (!availability.available) {
    redirect(getCacheRevalidateUrl({ error: "unavailable" }));
  }

  if (!(await isApiActivityAuthenticated())) {
    redirect(getCacheRevalidateUrl({ error: "unauthorized" }));
  }

  const tag = formData.get("tag");

  if (!isValidCacheTag(tag)) {
    redirect(getCacheRevalidateUrl({ error: "invalid" }));
  }

  let redirectUrl = getCacheRevalidateUrl({ revalidated: tag });

  try {
    updateTag(tag);
  } catch (error) {
    console.error("[cache-revalidate] Failed to revalidate cache tag.", {
      error,
      tag,
    });
    redirectUrl = getCacheRevalidateUrl({ error: "failed", tag });
  }

  redirect(redirectUrl);
}

function getCacheRevalidateUrl(params: Record<string, string>) {
  const searchParams = new URLSearchParams(params);

  return `${ROUTES.TOOLS.CACHE_REVALIDATE}?${searchParams.toString()}`;
}

function isValidCacheTag(value: FormDataEntryValue | null): value is CacheTags {
  return typeof value === "string" && VALID_CACHE_TAGS.has(value);
}
