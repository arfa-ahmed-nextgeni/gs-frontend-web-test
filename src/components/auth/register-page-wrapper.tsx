"use client";

import { useEffect } from "react";

import { useRouter } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants/routes";
import { shouldSuppressRegistration } from "@/lib/utils/auth-redirect";

export const RegisterPageWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const router = useRouter();

  useEffect(() => {
    if (shouldSuppressRegistration()) {
      router.replace(ROUTES.CUSTOMER.LOGIN);
    }
  }, [router]);

  return <>{children}</>;
};
