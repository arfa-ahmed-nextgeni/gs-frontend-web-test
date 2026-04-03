"use client";

import { useCallback } from "react";

import { useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { useTranslations } from "next-intl";

import { useToastContext } from "@/components/providers/toast-provider";
import { useUI } from "@/contexts/use-ui";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { usePathname, useRouter } from "@/i18n/navigation";
import { logout } from "@/lib/actions/auth/otp";
import { trackLogout } from "@/lib/analytics/events";
import { StoreCode } from "@/lib/constants/i18n";
import { clearCustomerId } from "@/lib/utils/customer-id-storage";

export const useLogout = () => {
  const queryClient = useQueryClient();
  const { unauthorize } = useUI();
  const { showSuccess } = useToastContext();
  const tToast = useTranslations("AccountPage");
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useIsMobile();

  const handleLogout = useCallback(
    async (storeCode?: StoreCode) => {
      // Track logout event
      trackLogout();

      try {
        const authToken = Cookies.get("auth_token");

        if (!authToken) {
          unauthorize();
          Cookies.remove("auth_token");
          // Clear customer_id cookie for local logout (no server call)
          clearCustomerId();
          showSuccess(
            tToast("logoutToast"),
            tToast("logoutSuccessMessage"),
            typeof window !== "undefined" && window.innerWidth >= 1024
              ? "bottom"
              : "top"
          );

          if (!isMobile && pathname?.includes("/customer/")) {
            router.push("/");
          }

          return { message: "Logged out locally", success: true };
        }

        const result = await logout({
          storeCode: storeCode || StoreCode.en_sa,
          token: authToken,
        });

        if (result.success) {
          unauthorize();
          Cookies.remove("auth_token");
          showSuccess(
            tToast("logoutToast"),
            tToast("logoutSuccessMessage"),
            typeof window !== "undefined" && window.innerWidth >= 1024
              ? "bottom"
              : "top"
          );

          if (!isMobile && pathname?.includes("/customer/")) {
            router.push("/");
          }

          return { message: result.message, success: true };
        } else {
          unauthorize();
          Cookies.remove("auth_token");
          showSuccess(
            tToast("logoutToast"),
            tToast("logoutSuccessMessage"),
            typeof window !== "undefined" && window.innerWidth >= 1024
              ? "bottom"
              : "top"
          );

          if (!isMobile && pathname?.includes("/customer/")) {
            router.push("/");
          }

          return { message: "Logged out locally", success: true };
        }
      } catch (error) {
        console.error("Error during logout:", error);
        unauthorize();
        Cookies.remove("auth_token");
        // Clear customer_id cookie as fallback on error
        clearCustomerId();
        showSuccess(
          tToast("logoutToast"),
          tToast("logoutSuccessMessage"),
          typeof window !== "undefined" && window.innerWidth >= 1024
            ? "bottom"
            : "top"
        );

        if (pathname?.includes("/customer/")) {
          router.push("/");
        }

        return { message: "Logged out locally", success: true };
      } finally {
        await queryClient.invalidateQueries();
      }
    },
    [unauthorize, showSuccess, tToast, queryClient, pathname, router, isMobile]
  );

  return { logout: handleLogout };
};
