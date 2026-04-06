"use client";

import { useEffect, useState } from "react";

import { MaintenanceErrorFallback } from "@/components/shared/maintenance-error-fallback";

import "./globals.css";

type GlobalErrorProps = {
  error: { digest?: string } & Error;
  reset: () => void;
};

const maintenanceMessages = {
  ar: {
    description: "نحن نقوم حاليًا ببعض أعمال صيانة النظام",
    home: "عودة للصفحة الرئيسية",
    reload: "إعادة تحميل الصفحة",
    retry: "إعادة المحاولة",
    title: "سنعود خلال لحظات",
  },
  en: {
    description: "We're currently undergoing some system maintenance",
    home: "Back to Home",
    reload: "Reload page",
    retry: "Retry",
    title: "We'll be back in a bit",
  },
} as const;

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const [locale, setLocale] = useState<"ar" | "en">("en");

  useEffect(() => {
    console.error(error);
  }, [error]);

  useEffect(() => {
    const pathLocale = window.location.pathname.split("/")[1];
    if (pathLocale === "ar") {
      setLocale("ar");
    }
  }, []);

  const t = maintenanceMessages[locale];
  const direction = locale === "ar" ? "rtl" : "ltr";

  return (
    <html
      className="antialiased"
      data-locale={locale}
      dir={direction}
      lang={locale}
    >
      <body className="bg-bg-body m-0 min-h-dvh">
        <title>Application Error</title>
        <MaintenanceErrorFallback
          description={t.description}
          homeHref={`/${locale}`}
          homeLabel={t.home}
          onRetry={reset}
          reloadLabel={t.reload}
          retryLabel={t.retry}
          title={t.title}
        />
      </body>
    </html>
  );
}
