import { getTranslations } from "next-intl/server";

import SectionHeader from "@/components/common/section-header";
import { ProductCard } from "@/components/product/product-card";
import Container from "@/components/shared/container";
import { CarouselContainer } from "@/components/ui/carousel/carousel-container";
import { CarouselItem } from "@/components/ui/carousel/carousel-item";
import { getLinkProducts } from "@/lib/actions/products/get-link-products";
import {
  ProductLinkType,
  ProductType,
} from "@/lib/constants/product/product-details";

type ProductCarouselSectionProps = {
  excludeTypes?: ProductType[];
  linkType: ProductLinkType;
  productInfo: {
    brand: string;
    gender: string;
    productType: string;
    sku: string;
  };
  productType: ProductType;
  titleKey: "similarProductsSection" | "youMightAlsoLikeSection";
};

export async function ProductCarouselSection({
  excludeTypes = [],
  linkType,
  productInfo,
  productType,
  titleKey,
}: ProductCarouselSectionProps) {
  if (excludeTypes.includes(productType)) return null;

  const t = await getTranslations(`ProductPage.${titleKey}`);

  const response = await getLinkProducts({
    ...productInfo,
    linkType,
  });
  const products = response.data?.products ?? [];

  if (!products.length) return null;

  return (
    <Container className="mb-7.5 !px-0">
      <div className="gap-4.5 flex flex-col">
        <SectionHeader
          className="px-2.5 lg:px-0"
          sectionHeading={
            <p className="text-text-primary text-2xl font-normal rtl:font-semibold">
              {t.rich("title", {
                b: (chunks) => (
                  <span className="font-semibold rtl:font-bold">{chunks}</span>
                ),
              })}
            </p>
          }
        />

        <CarouselContainer
          contentProps={{
            className: "px-2.5 lg:!px-0",
          }}
          nextButtonProps={{
            className: "xl:translate-x-15 xl:rtl:-translate-x-15",
          }}
          nextIconProps={{
            fill: "#374957",
          }}
          previousButtonProps={{
            className: "xl:-translate-x-15 xl:rtl:translate-x-15",
          }}
          previousIconProps={{
            fill: "#374957",
          }}
        >
          {products.map((product) => (
            <CarouselItem key={product.id}>
              <ProductCard product={product} />
            </CarouselItem>
          ))}
        </CarouselContainer>
      </div>
    </Container>
  );
}
