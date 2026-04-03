"use client";

import { useTranslations } from "next-intl";

import { useRouteMatch } from "@/hooks/use-route-match";
import { normalizePath } from "@/lib/utils/routes";

export const RouteTitle = () => {
  const { effectivePathname, isProductReviews } = useRouteMatch();
  const t = useTranslations("breadcrumbTitles");

  const normalized = normalizePath(effectivePathname);

  if (isProductReviews) {
    const lookupKey = "/p/:id/reviews/:id";
    if (t.has(lookupKey)) {
      return t(lookupKey);
    }
  }
  if (t.has(normalized as any)) {
    return t(normalized as any);
  }
  const lastSegment = decodeURIComponent(
    (effectivePathname.split("/").filter(Boolean).pop() || "").trim()
  );

  const humanized = lastSegment
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return humanized || lastSegment || "";
};
