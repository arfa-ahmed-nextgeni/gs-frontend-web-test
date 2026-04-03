"use client";

import { useTranslations } from "next-intl";

import { NotFoundPage } from "@/components/shared/not-found-page";
import { Button } from "@/components/ui/button";
import { useWebsiteFooter } from "@/contexts/website-footer-context";
import { Link } from "@/i18n/navigation";
import { Footer } from "@/layouts/footer";

export default function NotFound() {
  const t = useTranslations("NotFoundPage");
  const { websiteFooter } = useWebsiteFooter();

  return (
    <>
      <NotFoundPage
        action={
          <Button
            asChild
            className="bg-btn-bg-primary text-text-inverse hover:bg-btn-bg-primary/90 h-12.5 min-w-67.5 rounded-xl px-5 text-xl font-medium"
          >
            <Link href="/">{t("continueShopping")}</Link>
          </Button>
        }
        description={t("description")}
        title={t("title")}
      />
      <Footer hidePromotion websiteFooter={websiteFooter} />
    </>
  );
}
