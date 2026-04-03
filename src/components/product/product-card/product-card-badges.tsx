import { ProductCardBadge } from "@/components/product/product-card/product-card-badge";
import { ProductCardCountdownBadge } from "@/components/product/product-card/product-card-countdown-badge";
import { ProductCardLabel } from "@/components/product/product-card/product-card-label";
import {
  PRODUCT_CARD_COLOR_SWATCH_MAX_VISIBLE,
  PRODUCT_CARD_SIZE_OPTION_MAX_VISIBLE,
  ProductCardVariant,
  ProductOptionType,
} from "@/lib/constants/product/product-card";

import type {
  OptionChoice,
  ProductBadge,
  ProductOption,
} from "@/lib/models/product-card-model";

const getVisibleAndHiddenChoices = (
  choices: OptionChoice[],
  maxVisibleChoices: number
) => {
  const hasOverflow = choices.length > maxVisibleChoices;
  const visibleChoicesCount = hasOverflow
    ? maxVisibleChoices - 1
    : maxVisibleChoices;
  const visibleChoices = choices.slice(0, visibleChoicesCount);
  const hiddenChoicesCount = choices.length - visibleChoices.length;

  return {
    hiddenChoicesCount,
    visibleChoices,
  };
};

const OverflowCount = ({
  hiddenChoicesCount,
}: {
  hiddenChoicesCount: number;
}) =>
  hiddenChoicesCount > 0 ? (
    <span
      className="text-text-muted ms-1.25 rtl:mr-1.25 flex shrink-0 items-center justify-center text-[9px] font-normal"
      dir="ltr"
    >
      +{hiddenChoicesCount}
    </span>
  ) : null;

export const ProductCardBadges = ({
  badges,
  options,
  variant,
}: {
  badges?: ProductBadge[];
  options?: ProductOption;
  variant: ProductCardVariant;
}) => {
  const renderBadgesContent = () => {
    if (badges?.length) {
      return badges.map((badge) => (
        <ProductCardBadge badge={badge} key={badge.type} />
      ));
    } else if (options?.type === ProductOptionType.Size) {
      const maxVisibleChoices = PRODUCT_CARD_SIZE_OPTION_MAX_VISIBLE[variant];
      const { hiddenChoicesCount, visibleChoices } = getVisibleAndHiddenChoices(
        options.choices,
        maxVisibleChoices
      );

      return (
        <>
          {visibleChoices.map((choice) => (
            <ProductCardLabel className="bg-label-muted" key={choice.value}>
              {choice.label}
            </ProductCardLabel>
          ))}
          <OverflowCount hiddenChoicesCount={hiddenChoicesCount} />
        </>
      );
    } else if (options?.type === ProductOptionType.Color) {
      const maxVisibleChoices = PRODUCT_CARD_COLOR_SWATCH_MAX_VISIBLE[variant];
      const { hiddenChoicesCount, visibleChoices } = getVisibleAndHiddenChoices(
        options.choices,
        maxVisibleChoices
      );

      return (
        <>
          {visibleChoices.map((choice) => (
            <div
              className="size-6 shrink-0 rounded-full"
              key={`${choice.label}-${choice.value}`}
              style={{ backgroundColor: choice.value }}
            />
          ))}
          <OverflowCount hiddenChoicesCount={hiddenChoicesCount} />
        </>
      );
    }
    return null;
  };

  return (
    <div className="transition-default mt-3 flex flex-row gap-0.5 overflow-hidden px-5 opacity-100 group-focus-within:opacity-0 group-hover:opacity-0 group-has-[button[data-loading=true]]:opacity-0">
      <ProductCardCountdownBadge>
        {renderBadgesContent()}
      </ProductCardCountdownBadge>
    </div>
  );
};
