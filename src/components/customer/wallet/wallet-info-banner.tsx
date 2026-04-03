import { useTranslations } from "next-intl";

import { Alert } from "@/components/ui/alert";

export function WalletInfoBanner() {
  const t = useTranslations("WalletPage");

  return <Alert dismissable={false} title={t("infoMessage")} />;
}
