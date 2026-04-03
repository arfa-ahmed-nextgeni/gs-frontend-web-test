"use client";

import { PropsWithChildren } from "react";

import { useTranslations } from "next-intl";

import FilterIcon from "@/assets/icons/filter-icon.svg";
import { DrawerLayout } from "@/components/shared/layouts/drawer-layout";
import { useProductReviews } from "@/contexts/product-reviews-context";
import { useRouter } from "@/i18n/navigation";

export const ProductReviewsDrawerLayout = ({ children }: PropsWithChildren) => {
  const router = useRouter();

  const t = useTranslations("ProductReviewsPage");

  const { toggleSortByFilter } = useProductReviews();

  return (
    <DrawerLayout
      onClose={router.back}
      secondaryAction={{
        icon: FilterIcon,
        label: "Sort",
        onClick: toggleSortByFilter,
        show: true,
      }}
      title={t("title")}
    >
      {children}
    </DrawerLayout>
  );
};
