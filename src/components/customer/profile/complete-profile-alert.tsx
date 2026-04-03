import { useTranslations } from "next-intl";

import { Alert } from "@/components/ui/alert";

export const CompleteProfileAlert = () => {
  const t = useTranslations("CustomerProfilePage");

  return <Alert className="hidden lg:flex" title={t("completeProfileAlert")} />;
};
