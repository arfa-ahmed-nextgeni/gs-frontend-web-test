import Image from "next/image";

import { useTranslations } from "next-intl";

import RocketIcon from "@/assets/icons/rocket-icon.svg";
import { ProductCardLabel } from "@/components/product/product-card/product-card-label";
import { useLocaleInfo } from "@/hooks/i18n/use-locale-info";
import {
  PRODUCT_BADGE_TO_BG_CLASS_NAME,
  ProductBadgeType,
} from "@/lib/constants/product/product-card";
import { ProductBadge } from "@/lib/models/product-card-model";

export const ProductCardBadge = ({ badge }: { badge: ProductBadge }) => {
  const { language } = useLocaleInfo();

  const t = useTranslations("productCard.badges");

  const badgeContent = () => {
    switch (badge.type) {
      case ProductBadgeType.HourDelivery:
        return (
          <span className="flex items-center gap-1">
            <Image
              alt="Hour Delivery Icon"
              className="aspect-square"
              height={12}
              src={RocketIcon}
              unoptimized
              width={12}
            />
            {t(badge.type, {
              hours: badge.value
                ? new Intl.NumberFormat(
                    language === "ar" ? "ar-SA" : "en-US"
                  ).format(+badge.value)
                : "",
            })}
          </span>
        );
      case ProductBadgeType.UseCode:
        return (
          <span className="flex items-center gap-1">
            {t.rich(badge.type, {
              code: "BLVD",
              u: (chunks) => <u>{chunks}</u>,
            })}
          </span>
        );
      default:
        return t.has(badge.type as any)
          ? t(badge.type as any)
          : badge.value || null;
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
      className={PRODUCT_BADGE_TO_BG_CLASS_NAME[badge.type]}
      key={badge.type}
      style={style}
    >
      {content}
    </ProductCardLabel>
  );
};
