import { BeforeYouGoSection } from "@/components/cart/order/before-you-go-section";
import { getCartDetails } from "@/lib/actions/cart/get-cart-details";
import { getPageLandingData } from "@/lib/actions/contentful/page-landing";
import { getProductsByCategory } from "@/lib/actions/products/get-products-by-category";
import { Locale } from "@/lib/constants/i18n";
import { ProductCardVariant } from "@/lib/constants/product/product-card";
import { getDisplayOnClassName } from "@/lib/utils/display-on";

interface SuggestedProductsProps {
  locale: string;
}

export const SuggestedProducts = async ({ locale }: SuggestedProductsProps) => {
  const normalizedLocale = locale as Locale;
  const { data: cart } = await getCartDetails({
    locale: normalizedLocale,
    page: 1,
    pageSize: 50,
  });
  const cartItemsCount = cart?.items.length || 0;
  const pageLandingData = await getPageLandingData({ locale });
  const sections = await Promise.all(
    pageLandingData.cartSuggestedProducts.map(async (suggestedProducts) => {
      if (!suggestedProducts.enabled) {
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

      const response = await getProductsByCategory({
        category: categoryId,
        locale: normalizedLocale,
        pageSize: suggestedProducts.maximumProducts,
        variant: ProductCardVariant.Single,
      });
      const products = response.data?.products ?? [];

      if (products.length === 0) {
        return null;
      }

      return {
        displayOn: suggestedProducts.displayOn,
        id: suggestedProducts.entryId,
        products,
        richTitle,
      };
    })
  );

  return (
    <>
      {sections.map(
        (section) =>
          section && (
            <div
              className={getDisplayOnClassName(section.displayOn)}
              key={section.id}
            >
              <BeforeYouGoSection
                products={structuredClone(section.products)}
                richTitle={section.richTitle}
              />
            </div>
          )
      )}
    </>
  );
};
