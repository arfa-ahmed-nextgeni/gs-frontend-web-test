import { NextRequest, NextResponse } from "next/server";

import { hasLocale } from "next-intl";

import { routing } from "@/i18n/routing";
import { getCartDetails } from "@/lib/actions/cart/get-cart-details";
import { searchProductsByAttributeAction } from "@/lib/actions/catalog-service/search-products-by-category";
import { getPageLandingData } from "@/lib/actions/contentful/page-landing";
import { type Locale } from "@/lib/constants/i18n";
import { QueryParamsKey } from "@/lib/constants/query-params";
import { CategoryProducts } from "@/lib/models/category-products";
import { TabContentType } from "@/lib/models/page-landing";
import { ProductCardModel } from "@/lib/models/product-card-model";
import { failure, isOk, ok } from "@/lib/utils/service-result";

const getSuggestedProductsCategory = async (locale: Locale) => {
  const cartDetailsResult = await getCartDetails({
    locale,
    page: 1,
    pageSize: 50,
  });

  const cartItemsCount = isOk(cartDetailsResult)
    ? cartDetailsResult.data?.items.length || 0
    : 0;

  const categoryTitleToSearch = cartItemsCount > 0 ? "FBT" : "Best Sellers";

  const pageLandingData = await getPageLandingData({ locale });

  const categoryData = pageLandingData.contents?.find(
    (content) =>
      content.contentType === TabContentType.CategoryProducts &&
      (content as CategoryProducts).title === categoryTitleToSearch
  ) as CategoryProducts | undefined;

  return categoryData?.productsCategoryId;
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
      return NextResponse.json(ok([]));
    }

    const response = await searchProductsByAttributeAction({
      category,
      locale,
    });

    const products = (response.items?.map((item) => ({
      ...item?.productView,
    })) || []) as ProductCardModel[];

    return NextResponse.json(ok(products));
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
