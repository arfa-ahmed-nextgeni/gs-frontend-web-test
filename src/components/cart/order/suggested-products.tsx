import { BeforeYouGoSection } from "@/components/cart/order/before-you-go-section";
import { getCartDetails } from "@/lib/actions/cart/get-cart-details";
import { searchProductsByAttributeAction } from "@/lib/actions/catalog-service/search-products-by-category";
import { getPageLandingData } from "@/lib/actions/contentful/page-landing";
import { Locale } from "@/lib/constants/i18n";
import { transformProductViewToCardModel } from "@/lib/utils/catalog-service-product-transformer";

interface SuggestedProductsProps {
  locale: string;
}

export const SuggestedProducts = async ({ locale }: SuggestedProductsProps) => {
  const { data: cart } = await getCartDetails({
    locale: locale as Locale,
    page: 1,
    pageSize: 50,
  });

  const cartItemsCount = cart?.items.length || 0;
  const pageLandingData = await getPageLandingData({
    locale,
  });
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
  const richTitle = useFallback
    ? (suggestedProducts.emptyCartFallbackRichTitle ??
      suggestedProducts.richTitle)
    : suggestedProducts.richTitle;

  if (!categoryId) {
    return null;
  }

  const response = await searchProductsByAttributeAction({
    category: categoryId,
    locale: locale as Locale,
    quantity: suggestedProducts.maximumProducts,
  });

  if (!response.items || response.items.length === 0) {
    return null;
  }

  const categoryProducts =
    response.items?.map((item) =>
      transformProductViewToCardModel(item?.productView || ({} as any))
    ) || [];

  return (
    <BeforeYouGoSection
      products={structuredClone(categoryProducts)}
      richTitle={richTitle}
    />
  );
};
