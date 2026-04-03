"use client";

import { useCallback, useEffect } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { Spinner } from "@/components/ui/spinner";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useRouteMatch } from "@/hooks/use-route-match";
import { useRouter } from "@/i18n/navigation";
import { invalidateSession } from "@/lib/actions/auth/invalidate-session";
import { ROUTES } from "@/lib/constants/routes";

export default function UnauthorizedPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations("UnauthorizedPage");

  const { isCustomer } = useRouteMatch();

  const isMobile = useIsMobile();

  const onInvalidateSession = useCallback(async () => {
    const redirectTo =
      isCustomer && isMobile ? ROUTES.CUSTOMER.ROOT : ROUTES.ROOT;
    await invalidateSession();
    queryClient.invalidateQueries();
    router.replace(redirectTo);
  }, [isCustomer, isMobile, queryClient, router]);

  useEffect(() => {
    onInvalidateSession();
  }, [onInvalidateSession]);

  return (
    <main className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <Spinner size={28} variant="dark" />
      <div className="space-y-1">
        <p className="text-text-primary text-sm font-semibold">
          {t("message")}
        </p>
        <p className="text-text-secondary text-sm">{t("redirecting")}</p>
      </div>
    </main>
  );
}
