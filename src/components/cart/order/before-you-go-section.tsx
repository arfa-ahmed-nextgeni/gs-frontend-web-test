"use client";

import { useMemo } from "react";

import { Document } from "@contentful/rich-text-types";

import { SectionHeader } from "@/components/common/section-header";
import { ProductCard } from "@/components/product/product-card";
import { ProductCardMini } from "@/components/product/product-card-mini";
import Container from "@/components/shared/container";
import { useCart } from "@/contexts/use-cart";
import { useBulletDeliveryEnabled } from "@/hooks/use-bullet-delivery-enabled";
import { useHorizontalScroll } from "@/hooks/use-horizontal-scroll";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { StockStatus } from "@/lib/constants/product/product-card";
import { ProductCardModel } from "@/lib/models/product-card-model";

export const BeforeYouGoSection = ({
  products,
  richTitle,
}: {
  products: Array<ProductCardModel>;
  richTitle?: Document;
}) => {
  const scrollRef = useHorizontalScroll<HTMLDivElement>();
  const ismobile = useIsMobile();
  const { cart } = useCart();
  const isBulletDeliveryEnabled = useBulletDeliveryEnabled();

  const visibleProducts = useMemo(() => {
    if (!products?.length) return [];

    const cartSkus = cart?.items?.map((item) => item.sku) || [];

    return products
      .filter((product) => product.stockStatus === StockStatus.InStock)
      .filter((product) => !cartSkus.includes(product.sku));
  }, [products, cart]);

  if (visibleProducts.length === 0) return null;

  return (
    <Container className="mb-7.5 !px-0">
      <SectionHeader
        className="mb-5"
        richTitle={richTitle}
        sectionHeadingClassName="text-text-primary px-2 text-xl font-normal lg:px-0 lg:text-[25px] rtl:font-semibold"
      />

      <div
        className="scrollbar-none flex flex-row gap-2.5 overflow-x-auto"
        ref={scrollRef}
      >
        {visibleProducts.map((product, index) => (
          <div key={index}>
            {ismobile ? (
              <ProductCardMini product={product} />
            ) : (
              <ProductCard
                isBulletDeliveryEnabled={isBulletDeliveryEnabled}
                product={product}
              />
            )}
          </div>
        ))}
      </div>
    </Container>
  );
};
