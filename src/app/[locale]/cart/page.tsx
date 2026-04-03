import type { Metadata } from "next";

import { CartTracker } from "@/components/analytics/cart-tracker";
import { Cart } from "@/components/cart/order";
import { SuggestedProductsSection } from "@/components/cart/order/suggested-products-section";
import { initializePageLocale } from "@/lib/utils/locale";
import { generateAbsoluteCanonicalUrl } from "@/lib/utils/seo";

import type { Locale } from "@/lib/constants/i18n";

export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  initializePageLocale(locale);

  return (
    <>
      <CartTracker />
      <Cart suggestedProducts={<SuggestedProductsSection locale={locale} />} />
    </>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const canonicalUrl = generateAbsoluteCanonicalUrl({
    locale: locale as Locale,
    pathname: "/cart",
  });

  return {
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      follow: true,
      index: false,
    },
    title: "Shopping Bag",
  };
}
