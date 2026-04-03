import { useTranslations } from "next-intl";

import { Ingredient } from "@/components/product/ingredient-pyramid/ingredient-pyramid.types";
import { ProductCardLabel } from "@/components/product/product-card/product-card-label";
import { cn } from "@/lib/utils";

type IngredientCardProps = {
  badge: Ingredient["badge"];
  description: string;
  name: string;
};

const badgeColors: Record<IngredientCardProps["badge"], string> = {
  base: "bg-[#3749571A]",
  heart: "bg-[#6543F51A]",
  top: "bg-[#76D6711A]",
};

export const IngredientCard = ({
  badge,
  description,
  name,
}: IngredientCardProps) => {
  const t = useTranslations("ProductPage.ingredientPyramid.badges");

  return (
    <div className="bg-bg-body max-w-47.75 max-h-27.75 flex h-[26vw] w-[44.42vw] flex-shrink-0 flex-col gap-[clamp(5px,1.5vw,16px)] overflow-hidden rounded-xl p-[clamp(5px,calc(5px+(100vw-320px)*5/110),10px)]">
      <div className="flex flex-row items-end justify-between">
        <p className="text-text-primary line-clamp-1 text-[clamp(10px,3.3vw,14px)] font-medium">
          {name}
        </p>
        <ProductCardLabel
          className={cn(
            "max-w-11.75 text-text-primary max-h-6.25 h-[6vw] w-[13vw] text-[clamp(8px,3vw,11px)] font-medium",
            badgeColors[badge]
          )}
        >
          {t(badge)}
        </ProductCardLabel>
      </div>
      <p className="text-text-secondary line-clamp-4 text-[clamp(8px,3vw,12px)] font-normal">
        {description}
      </p>
    </div>
  );
};
