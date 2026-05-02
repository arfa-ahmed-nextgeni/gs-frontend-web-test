"use client";

import { useState, useTransition } from "react";

import Image, { type ImageProps } from "next/image";

import { useTranslations } from "next-intl";

import ThumbsDownActiveIcon from "@/assets/icons/thumbs-down-active-icon.svg";
import ThumbsDownIcon from "@/assets/icons/thumbs-down-icon.svg";
import ThumbsUpActiveIcon from "@/assets/icons/thumbs-up-active-icon.svg";
import ThumbsUpIcon from "@/assets/icons/thumbs-up-icon.svg";
import { useToastContext } from "@/components/providers/toast-provider";
import { Spinner } from "@/components/ui/spinner";
import { useUI } from "@/contexts/use-ui";
import { voteProductReview } from "@/lib/actions/products/vote-product-review";
import { trackReviewAction } from "@/lib/analytics/events";
import { isError, isOk } from "@/lib/utils/service-result";

type ProductReviewVote = "dislike" | "like";

type ProductReviewVoteOption = {
  activeIcon: ImageProps["src"];
  analyticsAction: "like" | "report";
  className?: string;
  icon: ImageProps["src"];
  iconAlt: string;
  isHelpful: boolean;
  vote: ProductReviewVote;
};

const productReviewVoteOptions: ProductReviewVoteOption[] = [
  {
    activeIcon: ThumbsDownActiveIcon,
    analyticsAction: "report",
    icon: ThumbsDownIcon,
    iconAlt: "dislike",
    isHelpful: false,
    vote: "dislike",
  },
  {
    activeIcon: ThumbsUpActiveIcon,
    analyticsAction: "like",
    className: "pb-1.5",
    icon: ThumbsUpIcon,
    iconAlt: "like",
    isHelpful: true,
    vote: "like",
  },
];

export const ProductReviewVoteButtons = ({
  productId,
  reviewId,
}: {
  productId: number;
  reviewId: number;
}) => {
  const [activeVote, setActiveVote] = useState<null | ProductReviewVote>(null);
  const [pendingVote, setPendingVote] = useState<null | ProductReviewVote>(
    null
  );

  const [isPending, startTransition] = useTransition();
  const { showError, showSuccess, showWarning } = useToastContext();
  const { isAuthorized } = useUI();
  const t = useTranslations("ProductReviewsPage");

  const isVotePending = isPending || pendingVote !== null;

  const handleVoteReview = (option: ProductReviewVoteOption) => {
    if (!isAuthorized) {
      showWarning(t("messages.loginToVoteReview"), " ");
      return;
    }

    if (isVotePending) {
      return;
    }

    setPendingVote(option.vote);

    startTransition(async () => {
      try {
        const response = await voteProductReview({
          isHelpful: option.isHelpful,
          reviewId,
        });

        if (isOk(response)) {
          trackReviewAction(option.analyticsAction, reviewId, productId);
          showSuccess(response.data, " ");
          setActiveVote(option.vote);
        }

        if (isError(response)) {
          showError(response.error, " ");
        }
      } finally {
        setPendingVote(null);
      }
    });
  };

  return (
    <div className="gap-7.5 flex flex-row">
      {productReviewVoteOptions.map((option) => {
        const isActive = activeVote === option.vote;

        return (
          <button
            aria-pressed={isActive}
            className={option.className}
            disabled={isVotePending}
            key={option.vote}
            onClick={() => handleVoteReview(option)}
          >
            {pendingVote === option.vote ? (
              <Spinner variant="dark" />
            ) : (
              <Image
                alt={option.iconAlt}
                className="size-5"
                height={20}
                src={isActive ? option.activeIcon : option.icon}
                width={20}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
