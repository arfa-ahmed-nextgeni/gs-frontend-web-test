"use client";

import { useTranslations } from "next-intl";

import { useCookieConsent } from "@/contexts/cookie-consent-context";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils";

type AuthLegalConsentProps = {
  className?: string;
  textClassName?: string;
};

export function AuthLegalConsent({
  className,
  textClassName,
}: AuthLegalConsentProps) {
  const t = useTranslations("HomePage.header.legalConsent");
  const { cookieConsentStatus } = useCookieConsent();

  const shouldShowLegalConsent =
    cookieConsentStatus === "pending" || cookieConsentStatus === "declined";

  if (!shouldShowLegalConsent) {
    return null;
  }

  return (
    <p
      className={cn(
        "text-text-tertiary text-center text-xs font-normal",
        textClassName,
        className
      )}
    >
      {t.rich("text", {
        privacy: (chunks) => (
          <Link className="text-text-info underline" href={ROUTES.PRIVACY}>
            {chunks}
          </Link>
        ),
        terms: (chunks) => (
          <Link className="text-text-info underline" href={ROUTES.TERMS}>
            {chunks}
          </Link>
        ),
      })}
    </p>
  );
}
