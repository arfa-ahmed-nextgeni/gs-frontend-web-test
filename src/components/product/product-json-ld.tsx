import { connection } from "next/server";

import { JsonLdScript } from "@/components/seo/json-ld-script";
import { generateProductSchema } from "@/lib/utils/schema";

import type { Locale } from "@/lib/constants/i18n";
import type { ProductDetailsModel } from "@/lib/models/product-details-model";

interface ProductJsonLdProps {
  locale: Locale;
  product: ProductDetailsModel;
  productUrl: string;
}

export const ProductJsonLd = async ({
  locale,
  product,
  productUrl,
}: ProductJsonLdProps) => {
  await connection();

  const productSchema = generateProductSchema({
    locale,
    product,
    productUrl,
  });

  return <JsonLdScript data={productSchema} id="product-schema" />;
};
