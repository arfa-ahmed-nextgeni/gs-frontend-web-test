import { type NextRequest, NextResponse } from "next/server";

import { hasLocale } from "next-intl";

import { routing } from "@/i18n/routing";
import { getCartDetails } from "@/lib/actions/cart/get-cart-details";
import { searchProductsByAttributeAction } from "@/lib/actions/catalog-service/search-products-by-category";
import { getPageLandingData } from "@/lib/actions/contentful/page-landing";
import { type Locale } from "@/lib/constants/i18n";
import { QueryParamsKey } from "@/lib/constants/query-params";
import { failure, isOk, ok } from "@/lib/utils/service-result";

import type { ProductCardModel } from "@/lib/models/product-card-model";
import type { CartSuggestedProductsApiData } from "@/lib/types/cart-suggested-products";

const EMPTY_CART_SUGGESTED_PRODUCTS: CartSuggestedProductsApiData = {
  products: [],
  title: "",
};

const getSuggestedProductsCategory = async (
  locale: Locale
): Promise<{
  categoryId: string;
  maximumProducts: number;
  title: string;
} | null> => {
  const cartDetailsResult = await getCartDetails({
    locale,
    page: 1,
    pageSize: 50,
  });

  const cartItemsCount = isOk(cartDetailsResult)
    ? cartDetailsResult.data?.items.length || 0
    : 0;

  const pageLandingData = await getPageLandingData({ locale });
  const suggestedProducts = pageLandingData.cartSuggestedProducts;

  if (!suggestedProducts?.enabled) {
    return null;
  }

  const useFallback =
    cartItemsCount === 0 && !!suggestedProducts.emptyCartFallbackCategoryId;
  const categoryId = useFallback
    ? (suggestedProducts.emptyCartFallbackCategoryId ??
      suggestedProducts.suggestedProductsCategoryId)
    : suggestedProducts.suggestedProductsCategoryId;
  const title = useFallback
    ? (suggestedProducts.emptyCartFallbackTitle ?? suggestedProducts.title)
    : suggestedProducts.title;

  if (!categoryId) {
    return null;
  }

  return {
    categoryId,
    maximumProducts: suggestedProducts.maximumProducts,
    title,
  };
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get(QueryParamsKey.Locale) as Locale;

  if (!hasLocale(routing.locales, locale)) {
    return NextResponse.json(failure("Invalid locale"), { status: 400 });
  }

  try {
    const category = await getSuggestedProductsCategory(locale);

    if (!category) {
      return NextResponse.json(ok(EMPTY_CART_SUGGESTED_PRODUCTS));
    }

    const response = await searchProductsByAttributeAction({
      category: category.categoryId,
      locale,
      quantity: category.maximumProducts,
    });

    const products = (response.items?.map((item) => ({
      ...item?.productView,
    })) || []) as ProductCardModel[];

    return NextResponse.json(
      ok({
        products,
        title: category.title,
      })
    );
  } catch (error) {
    console.error("Cart suggested products API error:", error);
    return NextResponse.json(
      failure("Failed to fetch cart suggested products"),
      {
        status: 500,
      }
    );
  }
}
