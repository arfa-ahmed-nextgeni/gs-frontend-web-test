import { getLocale, getTranslations } from "next-intl/server";

import { NotFoundPage } from "@/components/shared/not-found-page";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Footer } from "@/layouts/footer";
import { getPageLandingData } from "@/lib/actions/contentful/page-landing";
import { cn } from "@/lib/utils";

export default async function NotFound() {
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations("NotFoundPage"),
  ]);
  const pageLandingData = await getPageLandingData({ locale });
  const websiteFooter = pageLandingData?.websiteFooter;

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
