import { useTranslations } from "next-intl";

import { ProductAdditionalInfoRow } from "@/components/product/product-additional-info/product-additional-info-row";
import { ProductAdditionalInfoSelectedVariantRow } from "@/components/product/product-additional-info/product-additional-info-selected-variant-row";
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

  if (
    product.type &&
    [ProductType.EGiftCard, ProductType.GiftCard].includes(product.type)
  ) {
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
            {product.selectedVariantInfo
              ? product.productInfoList
                  .slice(0, product.selectedVariantInfo.index)
                  .map(({ label, value }, index) => (
                    <ProductAdditionalInfoRow
                      key={`product-info-${index}`}
                      label={label}
                      value={value}
                    />
                  ))
              : product.productInfoList.map(({ label, value }, index) => (
                  <ProductAdditionalInfoRow
                    key={`product-info-${index}`}
                    label={label}
                    value={value}
                  />
                ))}
            {product.selectedVariantInfo ? (
              <ProductAdditionalInfoSelectedVariantRow
                label={product.selectedVariantInfo.label}
              />
            ) : null}
            {product.selectedVariantInfo
              ? product.productInfoList
                  .slice(product.selectedVariantInfo.index)
                  .map(({ label, value }, index) => (
                    <ProductAdditionalInfoRow
                      key={`product-info-after-variant-${index}`}
                      label={label}
                      value={value}
                    />
                  ))
              : null}
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
