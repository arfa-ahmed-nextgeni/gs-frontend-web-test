"use client";

import { useEffect, useState, useTransition } from "react";

import Image from "next/image";

import { useTranslations } from "next-intl";

import MeatballsMenuIcon from "@/assets/icons/meatballs-menu-icon.svg";
import { useToastContext } from "@/components/providers/toast-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { useUI } from "@/contexts/use-ui";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useIsScrolling } from "@/hooks/use-is-scrolling";
import { useRouteMatch } from "@/hooks/use-route-match";
import { reportProductReview } from "@/lib/actions/products/report-product-review";
import { trackReviewAction } from "@/lib/analytics/events";
import { isError, isOk } from "@/lib/utils/service-result";

export const ProductReviewReportButton = ({
  productId,
  reviewId,
}: {
  productId: number;
  reviewId: number;
}) => {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { showError, showSuccess, showWarning } = useToastContext();
  const { isAuthorized } = useUI();
  const isScrolling = useIsScrolling();
  const isMobile = useIsMobile();
  const { isProductReviews } = useRouteMatch();

  const t = useTranslations("ProductReviewsPage");

  useEffect(() => {
    if (isScrolling) {
      setOpen(false);
    }
  }, [isScrolling]);

  const handleReportReview = () => {
    if (!isAuthorized) {
      showWarning(t("messages.loginToReportReview"), " ");
      return;
    }

    startTransition(async () => {
      const response = await reportProductReview({
        reviewId,
      });

      if (isOk(response)) {
        // Track review_action when a user reports a review
        trackReviewAction("report", reviewId, productId);
        showSuccess(response.data, " ");
      }

      if (isError(response)) {
        showError(response.error, " ");
      }
    });
  };

  return (
    <DropdownMenu
      modal={isProductReviews && !isMobile}
      onOpenChange={setOpen}
      open={open}
    >
      <DropdownMenuTrigger disabled={isPending}>
        {isPending ? (
          <Spinner variant="dark" />
        ) : (
          <Image
            alt="menu"
            className="size-5"
            height={20}
            src={MeatballsMenuIcon}
            width={20}
          />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-bg-default w-auto border-none p-0"
      >
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="text-text-primary text-sm font-semibold"
            onSelect={handleReportReview}
          >
            {t("reportReview")}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
