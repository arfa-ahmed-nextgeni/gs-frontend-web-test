import { useTranslations } from "next-intl";

import { useToastContext } from "@/components/providers/toast-provider";

export const useOfflineToast = () => {
  const t = useTranslations("errors.offline");

  const { showError } = useToastContext();

  const showOfflineMessage = () => {
    showError(t("title"), t("description"));
  };

  return { showOfflineMessage };
};
