import { useCallback } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { useToastContext } from "@/components/providers/toast-provider";
import { useAuthUI } from "@/contexts/auth-ui-context";
import { invalidateSession } from "@/lib/actions/auth/invalidate-session";

/**
 * Shared handler for the case where a server action signals `unauthenticated()`
 * because the backend rejected the customer's auth token (e.g. token was
 * revoked server-side while the user is still browsing).
 *
 * It clears the session cookies, resets React Query cache, shows a toast
 * informing the user they have been logged out, and opens the OTP login popup
 * so they can re-authenticate without leaving the current page.
 */
export function useHandleAuthRevoked() {
  const queryClient = useQueryClient();
  const { showError } = useToastContext();
  const { showOtpLoginPopup } = useAuthUI();
  const t = useTranslations("Toast.sessionExpired");

  return useCallback(async () => {
    await invalidateSession();
    await queryClient.invalidateQueries();
    showError(t("message"), t("description"));
    showOtpLoginPopup();
  }, [queryClient, showError, showOtpLoginPopup, t]);
}
