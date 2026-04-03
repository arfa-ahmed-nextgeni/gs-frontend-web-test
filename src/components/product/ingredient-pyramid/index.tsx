"use client";

import { useTranslations } from "next-intl";

import { IngredientPyramidRow } from "@/components/product/ingredient-pyramid/ingredient-pyramid-row";
import { Ingredient } from "@/components/product/ingredient-pyramid/ingredient-pyramid.types";
import Container from "@/components/shared/container";
import { useProductDetails } from "@/contexts/product-details-context";
import { ProductType } from "@/lib/constants/product/product-details";

const rowConfig = [
  { itemsPerRow: 5, startCol: 2 },
  { itemsPerRow: 4, startCol: 3 },
  { itemsPerRow: 3, startCol: 4 },
];

export const IngredientPyramid = () => {
  const t = useTranslations("ProductPage.ingredientPyramid");

  const { product } = useProductDetails();

  if (product.type !== ProductType.Perfume) {
    return null;
  }

  const ingredients: Ingredient[] = Object.entries(
    t.raw("ingredients" as any) as Record<string, Ingredient>
  ).map(([id, value]) => ({
    id,
    ...value,
  }));

  const rows: { items: Ingredient[]; startCol: number }[] = [];
  let currentIndex = 0;

  for (const config of rowConfig) {
    const rowItems = ingredients.slice(
      currentIndex,
      currentIndex + config.itemsPerRow
    );
    if (rowItems.length > 0) {
      rows.push({ items: rowItems, startCol: config.startCol });
      currentIndex += config.itemsPerRow;
    }
  }

  return (
    <Container className="lg:mb-12.5 mb-5 pe-0">
      <div className="lg:gap-7.5 lg:py-7.5 bg-bg-default flex flex-col gap-5 rounded-s-xl py-5 lg:rounded-xl">
        <p className="text-text-primary text-center text-lg font-normal lg:text-2xl lg:font-semibold">
          {t("title")}
        </p>
        <p className="text-text-secondary lg:px-78 px-2.5 text-center text-sm font-normal">
          {t("description")}
        </p>

        <div className="scrollbar-hidden overflow-x-auto px-[clamp(5px,calc(5px+(100vw-320px)*5/110),10px)] lg:px-0">
          <div className="space-y-1.25 min-w-max lg:min-w-0 lg:space-y-2.5">
            {rows.map((row, idx) => (
              <IngredientPyramidRow key={idx} {...row} />
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
};
