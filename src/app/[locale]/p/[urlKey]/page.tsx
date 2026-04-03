import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { ProductTracker } from "@/components/analytics/product-tracker";
import { AsyncBoundary } from "@/components/common/async-boundary";
import { ProductAdditionalInfo } from "@/components/product/product-additional-info";
import { ProductDetails } from "@/components/product/product-details";
import { ProductMediaGallery } from "@/components/product/product-media-gallery";
import { ProductReviewsSection } from "@/components/product/product-reviews/product-reviews-section";
import { SimilarProductsSection } from "@/components/product/similar-products-section";
import { StickyAddToCart } from "@/components/product/sticky-add-to-cart";
import { ViewedProductTracker } from "@/components/product/viewed-product-tracker";
import { YouMightAlsoLikeProductsSection } from "@/components/product/you-might-also-like-products-section";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import Container from "@/components/shared/container";
import { ProductDetailsProvider } from "@/contexts/product-details-context";
import { getPageLandingData } from "@/lib/actions/contentful/page-landing";
import { getProductDetails } from "@/lib/actions/products/get-product-details";
import { ROUTE_PLACEHOLDER } from "@/lib/constants/routes";
import { initializePageLocale } from "@/lib/utils/locale";
import { generateProductSchema } from "@/lib/utils/schema";
import {
  generateAbsoluteCanonicalUrl,
  generateHreflangTags,
} from "@/lib/utils/seo";
import { isOk } from "@/lib/utils/service-result";

import type { Locale } from "@/lib/constants/i18n";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/p/[urlKey]">): Promise<Metadata> {
  await connection();

  const { locale, urlKey } = await params;

  if (urlKey === ROUTE_PLACEHOLDER) {
    return {
      title: "Product Not Found",
    };
  }

  const decodedUrlKey = decodeURIComponent(urlKey);

  const productDetailsResult = await getProductDetails({
    urlKey: decodedUrlKey,
  });

  if (isOk(productDetailsResult)) {
    const product = productDetailsResult.data;

    // Generate canonical URL for the product
    const canonicalUrl = generateAbsoluteCanonicalUrl({
      locale: locale as Locale,
      pathname: `/p/${urlKey}`,
    });

    // Generate hreflang tags for product page
    // Product pages exist across all stores, so use the same pathname
    const hreflangs = generateHreflangTags({
      pathname: `/p/${urlKey}`,
    });

    const firstImage = product.mediaGallery?.[0]?.url;

    // Use custom SEO fields if available, otherwise fall back to product data
    const title = product.metaTitle || product.name;
    const description =
      product.metaDescription || product.description || undefined;

    return {
      alternates: {
        canonical: canonicalUrl,
        languages: hreflangs,
      },
      description,
      ...(product.metaKeywords && { keywords: product.metaKeywords }),
      openGraph: {
        description,
        images: firstImage
          ? [
              {
                alt: product.name,
                height: 800,
                url: firstImage,
                width: 800,
              },
            ]
          : undefined,
        locale: locale,
        siteName: "Golden Scent",
        title,
        type: "website",
        url: canonicalUrl,
      },
      robots: {
        follow: true,
        index: true,
      },
      title,
      twitter: {
        card: "summary_large_image",
        description,
        images: firstImage ? [firstImage] : undefined,
        title,
      },
    };
  }

  return {
    title: "Product Not Found",
  };
}

export function generateStaticParams() {
  return [{ urlKey: ROUTE_PLACEHOLDER }];
}

export default async function ProductPage({
  params,
}: PageProps<"/[locale]/p/[urlKey]">) {
  await connection();

  const { locale, urlKey } = await params;

  initializePageLocale(locale);

  if (urlKey === ROUTE_PLACEHOLDER) {
    notFound();
  }

  const decodedUrlKey = decodeURIComponent(urlKey);

  const [productDetailsResult, pageLandingResult] = await Promise.allSettled([
    getProductDetails({
      urlKey: decodedUrlKey,
    }),
    getPageLandingData({
      locale,
    }),
  ]);

  if (
    productDetailsResult.status === "fulfilled" &&
    isOk(productDetailsResult.value)
  ) {
    const productDetails = productDetailsResult.value;
    const appLinks =
      pageLandingResult.status === "fulfilled"
        ? pageLandingResult.value.websiteFooter?.footerLinks?.appSection
            ?.appLinks
        : null;

    // Generate Product schema for SEO
    const productSchema = generateProductSchema({
      locale: locale as Locale,
      product: productDetails.data,
      productUrl: `/p/${urlKey}`,
    });

    return (
      <ProductDetailsProvider
        appLinks={appLinks}
        product={structuredClone(productDetails.data)}
      >
        {/* Product Schema - enables rich product snippets */}
        <JsonLdScript data={productSchema} id="product-schema" />

        <ProductTracker product={structuredClone(productDetails.data)} />
        <AsyncBoundary fallback={null}>
          <ViewedProductTracker productSku={productDetails.data.sku} />
        </AsyncBoundary>
        <div className="pb-22.5">
          {/* <ProductBreadcrumb product={productDetails.data} /> */}

          <Container className="lg:h-148.75 lg:mt-12.5 mb-2.5 grid grid-cols-6 gap-5 !px-0 lg:grid-cols-12 lg:gap-2.5">
            <ProductMediaGallery />
            <ProductDetails
              locale={locale as Locale}
              product={productDetails.data}
            />
          </Container>
          <ProductAdditionalInfo product={productDetails.data} />
          {/* <IngredientPyramid /> */}
          <ProductReviewsSection product={productDetails.data} />
          <SimilarProductsSection product={productDetails.data} />
          <YouMightAlsoLikeProductsSection product={productDetails.data} />
          <StickyAddToCart />
        </div>
      </ProductDetailsProvider>
    );
  }

  return notFound();
}
