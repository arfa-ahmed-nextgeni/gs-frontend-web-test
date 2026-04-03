"use client";

import { PropsWithChildren } from "react";

import { useTranslations } from "next-intl";

import { DrawerLayout } from "@/components/shared/layouts/drawer-layout";
import { useRouter } from "@/i18n/navigation";

export const ProductReviewFormLayout = ({ children }: PropsWithChildren) => {
  const router = useRouter();

  const t = useTranslations("AddProductReviewPage");

  return (
    <DrawerLayout onClose={router.back} title={t("title")}>
      {children}
    </DrawerLayout>
  );
};
