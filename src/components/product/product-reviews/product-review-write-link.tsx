"use client";

import { ComponentProps, PropsWithChildren } from "react";

import { useParams } from "next/navigation";

import { useTranslations } from "next-intl";

import { setCameFromAddReviewPage } from "@/components/analytics/product-review-tracker";
import { useToastContext } from "@/components/providers/toast-provider";
import { useUI } from "@/contexts/use-ui";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants/routes";

export const ProductReviewWriteLink = ({
  children,
  loadingLinkProps,
}: PropsWithChildren<{
  loadingLinkProps?: Omit<ComponentProps<typeof Link>, "href">;
}>) => {
  const { urlKey } = useParams();

  const t = useTranslations("ProductReviewsPage");

  const isMobile = useIsMobile();
  const { isAuthorized } = useUI();
  const { showWarning } = useToastContext();

  return (
    <Link
      {...loadingLinkProps}
      href={ROUTES.PRODUCT.ADD(urlKey as string)}
      onNavigate={(e) => {
        if (!isAuthorized) {
          showWarning(t("messages.loginToReviewProducts"), " ");
          e.preventDefault();
        } else {
          setCameFromAddReviewPage();
        }
      }}
      scroll={!isMobile}
    >
      {children}
    </Link>
  );
};
