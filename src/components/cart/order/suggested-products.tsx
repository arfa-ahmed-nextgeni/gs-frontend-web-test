import { BeforeYouGoSection } from "@/components/cart/order/before-you-go-section";
import { getCartDetails } from "@/lib/actions/cart/get-cart-details";
import { searchProductsByAttributeAction } from "@/lib/actions/catalog-service/search-products-by-category";
import { getPageLandingData } from "@/lib/actions/contentful/page-landing";
import { Locale } from "@/lib/constants/i18n";
import { CategoryProducts } from "@/lib/models/category-products";
import { TabContentType } from "@/lib/models/page-landing";
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
  const categoryTitleToSearch = cartItemsCount > 0 ? "FBT" : "Best Sellers";

  const pageLandingData = await getPageLandingData({
    locale,
  });

  const categoryData = pageLandingData.contents?.find(
    (content) =>
      content.contentType === TabContentType.CategoryProducts &&
      (content as CategoryProducts).title === categoryTitleToSearch
  ) as CategoryProducts;

  if (!categoryData?.productsCategoryId) {
    return null;
  }

  const response = await searchProductsByAttributeAction({
    category: categoryData.productsCategoryId,
    locale: locale as Locale,
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
      richTitle={categoryData.richTitle}
    />
  );
};
