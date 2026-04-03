import { useTranslations } from "next-intl";

export function WalletCashbackHistoryTitle() {
  const t = useTranslations("WalletPage");

  return (
    <p className="text-text-secondary mt-7.5 text-sm font-medium">
      {t("cashbackHistory")}
    </p>
  );
}
