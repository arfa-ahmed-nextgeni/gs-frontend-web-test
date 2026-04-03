import { useTranslations } from "next-intl";

import { ProductInfoSection } from "@/components/product/product-additional-info/product-info-section";
import Container from "@/components/shared/container";
import { Accordion } from "@/components/ui/accordion";
import { ProductType } from "@/lib/constants/product/product-details";
import { ProductDetailsModel } from "@/lib/models/product-details-model";

export const ProductAdditionalInfo = ({
  product,
}: {
  product: ProductDetailsModel;
}) => {
  const t = useTranslations("ProductPage.additionalInfo");

  if ([ProductType.EGiftCard, ProductType.GiftCard].includes(product.type)) {
    return null;
  }

  return (
    <Container className="lg:mt-7.5 mb-5">
      <Accordion
        className="bg-bg-default w-full rounded-xl"
        defaultValue={["information"]}
        type="multiple"
      >
        <ProductInfoSection
          paragraphs={[product.description]}
          title={t("information.title")}
          value="information"
        >
          <div className="flex flex-col">
            {product.productInfoList.map(({ label, value }, index) => (
              <div className="flex flex-row" key={`product-info-${index}`}>
                <p className="text-text-primary w-[40%] text-sm font-bold lg:w-[15%]">
                  {label}
                </p>
                <p className="text-text-primary flex-1 text-sm font-normal">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </ProductInfoSection>

        <ProductInfoSection
          paragraphs={[product.description]}
          title={
            product.type === ProductType.Beauty
              ? t("aboutTheProduct.title")
              : t("aboutThisFragrance.title")
          }
          value="about-fragrance"
        />

        {product.ingredients && (
          <ProductInfoSection
            paragraphs={[product.ingredients]}
            title={t("ingredients.title")}
            value="ingredients"
          />
        )}
      </Accordion>
    </Container>
  );
};
