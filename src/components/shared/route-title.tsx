"use client";

import { useTranslations } from "next-intl";

import { useRouteMatch } from "@/hooks/use-route-match";
import { normalizePath } from "@/lib/utils/routes";

export const RouteTitle = () => {
  const { effectivePathname, isAddProductReview, isProductReviews } =
    useRouteMatch();

  const t = useTranslations("breadcrumbTitles");

  let normalized = normalizePath(effectivePathname);

  if (isProductReviews) {
    normalized = "/p/:id/reviews/:id";
  } else if (isAddProductReview) {
    normalized = "/p/:id/reviews/add";
  } else if (effectivePathname.includes("/customer/orders/view/")) {
    normalized = "/customer/orders/view/:id";
  }

  if (t.has(normalized as never)) {
    return t(normalized as never);
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
