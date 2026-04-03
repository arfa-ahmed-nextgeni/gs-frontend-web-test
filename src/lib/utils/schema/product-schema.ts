import type {
  AggregateRating,
  Offer,
  Product,
  Review,
  WithContext,
} from "schema-dts";

import { PROTOCOL } from "@/lib/constants/environment";
import { LOCALE_TO_DOMAIN } from "@/lib/constants/i18n";

import type { Locale } from "@/lib/constants/i18n";
import type { ProductDetailsModel } from "@/lib/models/product-details-model";

/**
 * Generate Product structured data with offers and reviews
 * Should be included on product detail pages
 *
 * @see https://schema.org/Product
 */
export function generateProductSchema({
  locale,
  product,
  productUrl,
}: {
  locale: Locale;
  product: ProductDetailsModel;
  productUrl: string;
}): WithContext<Product> {
  const domain = LOCALE_TO_DOMAIN[locale];
  const baseUrl = `${PROTOCOL}://${domain}`;

  // Build offer
  const offer: Offer = {
    "@type": "Offer",
    availability: product.inStock
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock",
    price: product.priceValue?.toString() || "0",
    priceCurrency: product.price?.match(/[A-Z]{3}/)?.[0] || "SAR",
    seller: {
      "@type": "Organization",
      name: "Golden Scent",
    },
    url: `${baseUrl}${productUrl}`,
  };

  // Add sale price if product has old price
  if (product.oldPrice && product.priceValue) {
    const oldPriceValue = parseFloat(product.oldPrice.replace(/[^0-9.]/g, ""));
    if (oldPriceValue > product.priceValue) {
      offer.priceValidUntil = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ).toISOString(); // 30 days from now
    }
  }

  // Build aggregate rating if reviews exist
  let aggregateRating: AggregateRating | undefined;
  if (product.averageRating && product.ratingCount) {
    aggregateRating = {
      "@type": "AggregateRating",
      bestRating: "5",
      ratingValue: product.averageRating.toString(),
      reviewCount: product.ratingCount,
      worstRating: "1",
    };
  }

  const schema: WithContext<Product> = {
    "@context": "https://schema.org",
    "@type": "Product",
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    description: product.description || product.name,
    image:
      product.mediaGallery
        ?.filter((media) => media.type === "image")
        .map((media) => media.url)
        .slice(0, 5) || [],
    name: product.name,
    offers: offer,
    sku: product.sku,
  };

  // Add aggregate rating if available
  if (aggregateRating) {
    schema.aggregateRating = aggregateRating;
  }

  // Add product info if available
  if (product.productInfo.type) {
    schema.category = product.productInfo.type;
  }

  return schema;
}

/**
 * Generate Review structured data
 * Should be included on review pages or individual review sections
 *
 * @see https://schema.org/Review
 */
export function generateReviewSchema({
  authorName,
  datePublished,
  productName,
  ratingValue,
  reviewBody,
}: {
  authorName: string;
  datePublished: string;
  productName: string;
  ratingValue: number;
  reviewBody: string;
}): WithContext<Review> {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    author: {
      "@type": "Person",
      name: authorName,
    },
    datePublished,
    itemReviewed: {
      "@type": "Product",
      name: productName,
    },
    reviewBody,
    reviewRating: {
      "@type": "Rating",
      bestRating: "5",
      ratingValue: ratingValue.toString(),
      worstRating: "1",
    },
  };
}
