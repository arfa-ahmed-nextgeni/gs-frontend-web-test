"use client";

import { useState, useTransition } from "react";

import Image from "next/image";

import { useTranslations } from "next-intl";

import ThumbsDownActiveIcon from "@/assets/icons/thumbs-down-active-icon.svg";
import ThumbsDownIcon from "@/assets/icons/thumbs-down-icon.svg";
import { useToastContext } from "@/components/providers/toast-provider";
import { Spinner } from "@/components/ui/spinner";
import { useUI } from "@/contexts/use-ui";
import { voteProductReview } from "@/lib/actions/products/vote-product-review";
import { trackReviewAction } from "@/lib/analytics/events";
import { isError, isOk } from "@/lib/utils/service-result";

export const ProductReviewDisikeButton = ({
  productId,
  reviewId,
}: {
  productId: number;
  reviewId: number;
}) => {
  const [disliked] = useState(false);

  const [isPending, startTransition] = useTransition();

  const { showError, showSuccess, showWarning } = useToastContext();
  const { isAuthorized } = useUI();

  const t = useTranslations("ProductReviewsPage");

  const handleDisLikeReview = () => {
    if (!isAuthorized) {
      showWarning(t("messages.loginToVoteReview"), " ");
      return;
    }

    startTransition(async () => {
      const response = await voteProductReview({
        isHelpful: false,
        reviewId,
      });

      if (isOk(response)) {
        trackReviewAction("report", reviewId, productId);
        showSuccess(response.data, " ");
      }

      if (isError(response)) {
        showError(response.error, " ");
      }
    });
  };

  return (
    <button disabled={isPending} onClick={handleDisLikeReview}>
      {isPending ? (
        <Spinner variant="dark" />
      ) : (
        <Image
          alt="dislike"
          className="size-5"
          height={20}
          src={disliked ? ThumbsDownActiveIcon : ThumbsDownIcon}
          width={20}
        />
      )}
    </button>
  );
};
