import type { ReactNode } from "react";

import Image from "next/image";

import { useTranslations } from "next-intl";

import RocketIcon from "@/assets/icons/rocket-icon.svg";
import { ProductCardLabel } from "@/components/product/product-card/product-card-label";
import { useLocaleInfo } from "@/hooks/i18n/use-locale-info";
import {
  PRODUCT_BADGE_TO_BG_CLASS_NAME,
  ProductBadgeType,
} from "@/lib/constants/product/product-card";
import { cn } from "@/lib/utils";

import type { ProductBadge } from "@/lib/models/product-card-model";

const BadgeText = ({ children }: { children: ReactNode }) => (
  <span className="min-w-0 truncate">{children}</span>
);

export const ProductCardBadge = ({
  badge,
  className,
}: {
  badge: ProductBadge;
  className?: string;
}) => {
  const { language } = useLocaleInfo();

  const t = useTranslations("productCard.badges");

  const badgeContent = () => {
    switch (badge.type) {
      case ProductBadgeType.HourDelivery:
        return (
          <span className="flex min-w-0 items-center gap-1 overflow-hidden">
            <Image
              alt="Hour Delivery Icon"
              className="aspect-square shrink-0"
              height={12}
              src={RocketIcon}
              unoptimized
              width={12}
            />
            <BadgeText>
              {t(badge.type, {
                hours: badge.value
                  ? new Intl.NumberFormat(
                      language === "ar" ? "ar-SA" : "en-US"
                    ).format(+badge.value)
                  : "",
              })}
            </BadgeText>
          </span>
        );
      case ProductBadgeType.UseCode:
        return (
          <BadgeText>
            {t.rich(badge.type, {
              code: "BLVD",
              u: (chunks) => <u>{chunks}</u>,
            })}
          </BadgeText>
        );
      default: {
        const label = t.has(badge.type as any)
          ? t(badge.type as any)
          : badge.value || null;

        return label === null ? null : <BadgeText>{label}</BadgeText>;
      }
    }
  };
  const content = badgeContent();
  if (content === null) {
    return null;
  }

  const style =
    badge.backgroundColor || badge.color
      ? {
          backgroundColor: badge.backgroundColor,
          color: badge.color,
        }
      : undefined;

  return (
    <ProductCardLabel
      className={cn(PRODUCT_BADGE_TO_BG_CLASS_NAME[badge.type], className)}
      key={badge.type}
      style={style}
    >
      {content}
    </ProductCardLabel>
  );
};
