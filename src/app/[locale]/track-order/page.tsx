import { Suspense } from "react";

import { Metadata } from "next";

import { getTranslations } from "next-intl/server";

import { TrackOrderPage } from "@/components/content/track-order";
import { initializePageLocale } from "@/lib/utils/locale";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("TrackOrder");

  return {
    description: t("title"),
    title: t("title"),
  };
}

export default async function TrackOrder({
  params,
}: PageProps<"/[locale]/track-order">) {
  const { locale } = await params;

  initializePageLocale(locale);

  return (
    <Suspense>
      <TrackOrderPage />
    </Suspense>
  );
}
