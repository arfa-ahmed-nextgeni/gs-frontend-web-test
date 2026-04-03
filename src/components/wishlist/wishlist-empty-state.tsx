import { useTranslations } from "next-intl";

export const WishlistEmptyState = () => {
  const t = useTranslations("CustomerWishlistPage.emptyState");

  return (
    <div className="lg:mt-12.5 mt-2.5 flex flex-1 flex-col items-center justify-center gap-5">
      <p className="text-text-primary text-xl font-medium">{t("title")}</p>
      <p className="text-text-secondary text-sm font-medium">{t("message")}</p>
    </div>
  );
};
