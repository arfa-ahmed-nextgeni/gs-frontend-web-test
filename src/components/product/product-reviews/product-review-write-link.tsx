"use client";

import type { ComponentProps, PropsWithChildren } from "react";

import { useTranslations } from "next-intl";

import { setCameFromAddReviewPage } from "@/components/analytics/product-review-tracker";
import { useToastContext } from "@/components/providers/toast-provider";
import { useUI } from "@/contexts/use-ui";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { Link, usePathname } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants/routes";
import { SessionStorageKey } from "@/lib/constants/session-storage";
import { setSessionStorage } from "@/lib/utils/session-storage";

const getProductUrlKeyFromPathname = (pathname: string) => {
  const match = pathname.match(/(?:^|\/)p\/([^/]+)/);
  const urlKey = match?.[1];

  if (!urlKey) return "";

  try {
    return decodeURIComponent(urlKey);
  } catch {
    return urlKey;
  }
};

const isCheckoutProductReviewHref = (
  href: ComponentProps<typeof Link>["href"]
) => {
  return (
    typeof href === "string" &&
    href.startsWith(ROUTES.CHECKOUT.ADD_PRODUCT_REVIEW(""))
  );
};

export const ProductReviewWriteLink = ({
  children,
  href,
  loadingLinkProps,
  urlKey,
}: PropsWithChildren<{
  href?: ComponentProps<typeof Link>["href"];
  loadingLinkProps?: Omit<ComponentProps<typeof Link>, "href">;
  urlKey?: string;
}>) => {
  const pathname = usePathname();
  const reviewUrlKey = urlKey || getProductUrlKeyFromPathname(pathname);

  const t = useTranslations("ProductReviewsPage");

  const isMobile = useIsMobile();
  const { isAuthorized } = useUI();
  const { showWarning } = useToastContext();

  const reviewHref =
    href ||
    (reviewUrlKey
      ? ROUTES.PRODUCT.ADD(encodeURIComponent(reviewUrlKey))
      : undefined);

  if (!reviewHref) return null;

  return (
    <Link
      {...loadingLinkProps}
      href={reviewHref}
      onNavigate={(e) => {
        if (!isAuthorized) {
          showWarning(t("messages.loginToReviewProducts"), " ");
          e.preventDefault();
        } else {
          if (isCheckoutProductReviewHref(reviewHref)) {
            setSessionStorage(
              SessionStorageKey.CHECKOUT_PRODUCT_REVIEW_BACK_NAVIGATION,
              "true"
            );
          }
          setCameFromAddReviewPage();
        }
      }}
      scroll={!isMobile}
    >
      {children}
    </Link>
  );
};
