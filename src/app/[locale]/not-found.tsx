"use client";

import { useTranslations } from "next-intl";

import { NotFoundPage } from "@/components/shared/not-found-page";
import { buttonVariants } from "@/components/ui/button";
import { useWebsiteFooter } from "@/contexts/website-footer-context";
import { Link } from "@/i18n/navigation";
import { Footer } from "@/layouts/footer";
import { cn } from "@/lib/utils";

export default function NotFound() {
  const t = useTranslations("NotFoundPage");
  const { websiteFooter } = useWebsiteFooter();

  return (
    <>
      <NotFoundPage
        action={
          <Link
            className={cn(
              buttonVariants({
                className:
                  "bg-btn-bg-primary text-text-inverse hover:bg-btn-bg-primary/90 h-12.5 min-w-67.5 rounded-xl px-5 text-xl font-medium",
              })
            )}
            data-slot="button"
            href="/"
          >
            {t("continueShopping")}
          </Link>
        }
        description={t("description")}
        title={t("title")}
      />
      <Footer hidePromotion websiteFooter={websiteFooter} />
    </>
  );
}
