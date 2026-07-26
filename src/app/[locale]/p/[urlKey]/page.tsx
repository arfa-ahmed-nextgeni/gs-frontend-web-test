import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { ProductTracker } from "@/components/analytics/product-tracker";
import { AsyncBoundary } from "@/components/common/async-boundary";
import { ProductAdditionalInfo } from "@/components/product/product-additional-info";
import { ProductDetails } from "@/components/product/product-details";
import { ProductJsonLd } from "@/components/product/product-json-ld";
import { ProductMediaGallery } from "@/components/product/product-media-gallery";
import { ProductReviewsSection } from "@/components/product/product-reviews/product-reviews-section";
import { SimilarProductsSection } from "@/components/product/similar-products-section";
import { StickyAddToCart } from "@/components/product/sticky-add-to-cart";
import { ViewedProductTracker } from "@/components/product/viewed-product-tracker";
import { YouMightAlsoLikeProductsSection } from "@/components/product/you-might-also-like-products-section";
import Container from "@/components/shared/container";
import { ProductDetailsProvider } from "@/contexts/product-details-context";
import { getPageLandingData } from "@/lib/actions/contentful/page-landing";
import { getProductDetails } from "@/lib/actions/products/get-product-details";
import { PRODUCT_DETAILS_CACHE_DISABLED } from "@/lib/config/server-env";
import { ROUTE_PLACEHOLDER } from "@/lib/constants/routes";
import { collectProductStaticUrlKeys } from "@/lib/product/static-params-extractors";
import { initializePageLocale } from "@/lib/utils/locale";
import {
  generateAbsoluteCanonicalUrl,
  generateHreflangTags,
} from "@/lib/utils/seo";
import { isOk } from "@/lib/utils/service-result";

import type { Locale } from "@/lib/constants/i18n";

const PRODUCT_PAGE_ADDITIONAL_INFO_VISIBILITY_CLASS_NAME =
  "[contain-intrinsic-size:0_640px] [content-visibility:auto]";
const PRODUCT_PAGE_PRODUCT_CAROUSEL_VISIBILITY_CLASS_NAME =
  "[contain-intrinsic-size:0_540px] [content-visibility:auto]";
const PRODUCT_PAGE_REVIEWS_VISIBILITY_CLASS_NAME =
  "[contain-intrinsic-size:0_520px] [content-visibility:auto]";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/p/[urlKey]">): Promise<Metadata> {
  if (PRODUCT_DETAILS_CACHE_DISABLED) {
    await connection();
  }

  const { locale, urlKey } = await params;

  if (urlKey === ROUTE_PLACEHOLDER) {
    return {
      title: "Product Not Found",
    };
  }

  const decodedUrlKey = decodeURIComponent(urlKey);

  const productDetailsResult = await getProductDetails({
    locale: locale as Locale,
    urlKey: decodedUrlKey,
  });

  if (isOk(productDetailsResult)) {
    const product = productDetailsResult.data;

    // Canonical URL strategy:
    // - Child product   → parent_product_url is set in Magento → canonical points to parent
    // - Parent product  → parent_product_url is not set        → canonical is its own URL
    // - Simple product  → parent_product_url is not set        → canonical is its own URL
    const canonicalUrl = resolveProductCanonicalUrl({
      locale: locale as Locale,
      parentProductUrl: product.parentProductUrl,
      urlKey,
    });

    // Hreflang always uses the current product's own URL (not the parent's),
    // so crawlers can discover all locale variants of this specific page.
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

export async function generateStaticParams({
  params,
}: {
  params: Awaited<LayoutProps<"/[locale]">["params"]>;
}) {
  const urlKeys = await collectProductStaticUrlKeys({ locale: params.locale });
  return [
    { urlKey: ROUTE_PLACEHOLDER },
    ...urlKeys.map((urlKey) => ({ urlKey })),
  ];
}

export default async function ProductPage({
  params,
}: PageProps<"/[locale]/p/[urlKey]">) {
  if (PRODUCT_DETAILS_CACHE_DISABLED) {
    await connection();
  }

  const { locale, urlKey } = await params;

  initializePageLocale(locale);

  if (urlKey === ROUTE_PLACEHOLDER) {
    notFound();
  }

  const decodedUrlKey = decodeURIComponent(urlKey);

  const [productDetailsResult, pageLandingResult] = await Promise.allSettled([
    getProductDetails({
      locale: locale as Locale,
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

    return (
      <ProductDetailsProvider
        appLinks={appLinks}
        product={structuredClone(productDetails.data)}
      >
        {/* Product Schema - enables rich product snippets. Deferred to
            runtime via connection() because generateProductSchema reads
            Date.now() for the rolling 30-day priceValidUntil window. */}
        <AsyncBoundary fallback={null}>
          <ProductJsonLd
            locale={locale as Locale}
            product={productDetails.data}
            productUrl={`/p/${urlKey}`}
          />
        </AsyncBoundary>

        <ProductTracker />
        <AsyncBoundary fallback={null}>
          <ViewedProductTracker productSku={productDetails.data.sku} />
        </AsyncBoundary>
        <div className="pb-22.5">
          {/* <ProductBreadcrumb product={productDetails.data} /> */}

          <Container className="lg:h-148.75 lg:mt-12.5 px-0! md:h-148.75 md:mt-12.5 mb-2.5 grid grid-cols-6 gap-5 md:grid-cols-12 md:gap-2.5 lg:grid-cols-12">
            <ProductMediaGallery />
            <ProductDetails
              locale={locale as Locale}
              product={productDetails.data}
            />
          </Container>
          <div className={PRODUCT_PAGE_ADDITIONAL_INFO_VISIBILITY_CLASS_NAME}>
            <ProductAdditionalInfo product={productDetails.data} />
          </div>
          {/* <IngredientPyramid /> */}
          <div className={PRODUCT_PAGE_REVIEWS_VISIBILITY_CLASS_NAME}>
            <ProductReviewsSection product={productDetails.data} />
          </div>
          <div className={PRODUCT_PAGE_PRODUCT_CAROUSEL_VISIBILITY_CLASS_NAME}>
            <SimilarProductsSection product={productDetails.data} />
          </div>
          <div className={PRODUCT_PAGE_PRODUCT_CAROUSEL_VISIBILITY_CLASS_NAME}>
            <YouMightAlsoLikeProductsSection product={productDetails.data} />
          </div>
          <StickyAddToCart />
        </div>
      </ProductDetailsProvider>
    );
  }

  return notFound();
}

/**
 * Resolve the canonical URL for a product page.
 *
 * Magento sets `parent_product_url` only on child (variant) products.
 * Parent (configurable) and simple products do NOT have this attribute,
 * so they always use their own URL as the canonical.
 *
 * | Product type   | parent_product_url | Canonical          |
 * |----------------|--------------------|--------------------|
 * | Child/variant  | set                | parent product URL |
 * | Parent/config  | not set            | own URL            |
 * | Simple         | not set            | own URL            |
 */
function resolveProductCanonicalUrl({
  locale,
  parentProductUrl,
  urlKey,
}: {
  locale: Locale;
  parentProductUrl: string | undefined;
  urlKey: string;
}): string {
  // Parent / simple product — no parent_product_url attribute → own URL
  if (!parentProductUrl) {
    return generateAbsoluteCanonicalUrl({ locale, pathname: `/p/${urlKey}` });
  }

  // Child product — parent_product_url is an absolute URL → extract the path
  // and rebuild with the correct domain to avoid hardcoded staging URLs
  if (parentProductUrl.startsWith("http")) {
    const pathname = new URL(parentProductUrl).pathname;
    const normalizedKey = pathname.replace(/^\/[a-z]{2}\/p\//, "");
    return generateAbsoluteCanonicalUrl({
      locale,
      pathname: `/p/${normalizedKey}`,
    });
  }

  // Child product — parent_product_url is a URL key or relative path → normalise
  const normalizedKey = parentProductUrl.replace(/^\/?(p\/)?/, "");
  return generateAbsoluteCanonicalUrl({
    locale,
    pathname: `/p/${normalizedKey}`,
  });
}
