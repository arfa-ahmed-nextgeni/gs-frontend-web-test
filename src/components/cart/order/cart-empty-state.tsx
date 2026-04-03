"use client";

import { useTranslations } from "next-intl";

export function CartEmptyState() {
  const t = useTranslations("CartPage");

  return (
    <div className="pt-26.5 pb-24 text-center lg:pb-5 lg:pt-0">
      <p className="text-text-primary text-xl font-medium">{t("emptyBag")}</p>
      <p className="text-text-secondary font-regular mt-4 text-sm">
        {t("suggestions")}
      </p>
    </div>
  );
}
