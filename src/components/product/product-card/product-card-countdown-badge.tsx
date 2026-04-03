"use client";

import { PropsWithChildren } from "react";

import Image from "next/image";

import { useTranslations } from "next-intl";

import FlashIcon from "@/assets/icons/flash-icon.svg";
import { useProductCard } from "@/components/product/product-card/product-card-context";
import { ProductCardLabel } from "@/components/product/product-card/product-card-label";
import { useProductCountdownTimer } from "@/hooks/product/use-product-countdown-timer";
import {
  PRODUCT_BADGE_TO_BG_CLASS_NAME,
  ProductBadgeType,
} from "@/lib/constants/product/product-card";

export const ProductCardCountdownBadge = ({ children }: PropsWithChildren) => {
  const t = useTranslations("productCard.badges");
  const tCommon = useTranslations("common");

  const { originalProduct } = useProductCard();

  const { countdownData } = useProductCountdownTimer({
    countdownTimer: originalProduct?.countdownTimer,
  });

  if (!countdownData || !originalProduct.countdownTimer?.enabled)
    return children;

  const formatCountdown = () => {
    const { days, hours, minutes, seconds } = countdownData!;
    const pad = (n: number) => String(n).padStart(2, "0");
    const timePart = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    const daySuffix = tCommon("countdownDaySuffix");
    return days > 0 ? `${days}${daySuffix}:${timePart}` : timePart;
  };

  return (
    <ProductCardLabel
      className={PRODUCT_BADGE_TO_BG_CLASS_NAME[ProductBadgeType.SaleEndsIn]}
    >
      <span className="flex items-center gap-0.5">
        <Image
          alt="Flash Icon"
          className="aspect-square"
          height={12}
          src={FlashIcon}
          unoptimized
          width={12}
        />
        {t(ProductBadgeType.SaleEndsIn, {
          countdown: formatCountdown(),
          hasTitle: originalProduct?.countdownTimer?.title ? "yes" : "other",
          title: originalProduct?.countdownTimer?.title,
        })}
      </span>
    </ProductCardLabel>
  );
};
