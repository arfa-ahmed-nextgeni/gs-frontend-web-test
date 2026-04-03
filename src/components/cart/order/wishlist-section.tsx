"use client";

import { useTranslations } from "next-intl";

import AddToBagIcon from "@/assets/icons/add-to-bag-icon.svg";
import { CategoryProductsCarouselClient } from "@/components/product/category-products-carousel-client";
import { CategoryProductsCarouselItemsSkeleton } from "@/components/product/category-products-carousel-items-skeleton";
import { ProductCardMini } from "@/components/product/product-card-mini";
import { ProductCardProvider } from "@/components/product/product-card/product-card-context";
import { useWishlistPaginatedQuery } from "@/hooks/queries/wishlist/use-wishlist-paginated-query";
import { useHorizontalScroll } from "@/hooks/use-horizontal-scroll";
import {
  ProductCardVariant,
  StockStatus,
} from "@/lib/constants/product/product-card";
import { ROUTES } from "@/lib/constants/routes";
import { TabContentType } from "@/lib/models/page-landing";
import { ProductCardModel } from "@/lib/models/product-card-model";

export const WishListSection = () => {
  const t = useTranslations("CartPage.wishlistSection");
  const { data, isLoading } = useWishlistPaginatedQuery({
    page: 1,
    pageSize: 10,
  });

  const scrollRef = useHorizontalScroll<HTMLDivElement>();

  if (isLoading) {
    return (
      <div className="mb-7.5 !px-2 lg:!px-0">
        <CategoryProductsCarouselItemsSkeleton
          maximumProducts={10}
          variant={ProductCardVariant.Single}
        />
      </div>
    );
  }

  let wishlistProducts = data?.items || [];

  if (!wishlistProducts.length) {
    return null;
  }

  wishlistProducts = wishlistProducts.filter(
    (product) => product.stockStatus === StockStatus.InStock
  );

  return (
    <div className="lg:mb-7.5">
      {/* Mobile: horizontal scroll */}
      <div className="flex flex-col gap-5 lg:hidden">
        <p className="text-text-primary px-5 text-xl font-medium">
          {t.rich("title", {
            b: (chunks) => (
              <span className="font-semibold rtl:font-bold">{chunks}</span>
            ),
          })}
        </p>
        <div className="flex flex-row gap-2.5 overflow-x-auto" ref={scrollRef}>
          {wishlistProducts.map((product) => (
            <ProductCardProvider
              formatChildren={true}
              key={product.id}
              product={product as Partial<ProductCardModel>}
            >
              <ProductCardMini
                icon={AddToBagIcon}
                iconContainerClassName="bg-bg-primary"
                product={product}
              />
            </ProductCardProvider>
          ))}
        </div>
      </div>

      {/* Desktop: carousel */}
      <div className="hidden lg:block">
        <CategoryProductsCarouselClient
          carouselContainerProps={{
            contentProps: { className: "px-2 lg:!px-0" },
          }}
          contentType={"Wishlist" as TabContentType}
          grid={false}
          maximumProducts={10}
          products={wishlistProducts}
          productsCategoryId=""
          sectionHeaderProps={{
            className: "px-2 lg:px-0",
            sectionHeading: (
              <p className="text-text-primary text-xl font-normal lg:text-2xl rtl:font-semibold">
                {t.rich("title", {
                  b: (chunks) => (
                    <span className="font-semibold rtl:font-bold">
                      {chunks}
                    </span>
                  ),
                })}
              </p>
            ),
            seeAllButton: {
              href: ROUTES.CUSTOMER.PROFILE.WISHLIST,
              show: wishlistProducts.length > 10,
              text: t("seeAll"),
            },
          }}
          showViewAll={wishlistProducts.length > 10}
          title=""
          variant={ProductCardVariant.Single}
        />
      </div>
    </div>
  );
};
