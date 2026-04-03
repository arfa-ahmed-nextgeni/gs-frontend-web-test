"use client";

import { useState, useTransition } from "react";

import Image from "next/image";

import { useTranslations } from "next-intl";

import ThumbsUpActiveIcon from "@/assets/icons/thumbs-up-active-icon.svg";
import ThumbsUpIcon from "@/assets/icons/thumbs-up-icon.svg";
import { useToastContext } from "@/components/providers/toast-provider";
import { Spinner } from "@/components/ui/spinner";
import { useUI } from "@/contexts/use-ui";
import { voteProductReview } from "@/lib/actions/products/vote-product-review";
import { trackReviewAction } from "@/lib/analytics/events";
import { isError, isOk } from "@/lib/utils/service-result";

export const ProductReviewLikeButton = ({
  productId,
  reviewId,
}: {
  productId: number;
  reviewId: number;
}) => {
  const [liked] = useState(false);

  const [isPending, startTransition] = useTransition();

  const { showError, showSuccess, showWarning } = useToastContext();
  const { isAuthorized } = useUI();

  const t = useTranslations("ProductReviewsPage");

  const handleLikeReview = () => {
    if (!isAuthorized) {
      showWarning(t("messages.loginToVoteReview"), " ");
      return;
    }

    startTransition(async () => {
      const response = await voteProductReview({
        isHelpful: true,
        reviewId,
      });

      if (isOk(response)) {
        // Track review_action when a user marks a review as helpful
        trackReviewAction("like", reviewId, productId);
        showSuccess(response.data, " ");
      }

      if (isError(response)) {
        showError(response.error, " ");
      }
    });
  };

  return (
    <button className="pb-1.5" disabled={isPending} onClick={handleLikeReview}>
      {isPending ? (
        <Spinner variant="dark" />
      ) : (
        <Image
          alt="like"
          className="size-5"
          height={20}
          src={liked ? ThumbsUpActiveIcon : ThumbsUpIcon}
          width={20}
        />
      )}
    </button>
  );
};
