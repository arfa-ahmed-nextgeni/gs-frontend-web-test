import {
  ComplexProductView,
  GetSimilarProductsQuery,
  GetYouMightAlsoLikeProductsQuery,
  ProductViewCurrency,
  ProductViewOptionValueSwatch,
} from "@/catalog-service-graphql/graphql";
import {
  ProductBadgeType,
  ProductCardVariant,
  ProductOptionType,
  StockStatus,
} from "@/lib/constants/product/product-card";
import { Helper } from "@/lib/models/helper";
import {
  ProductCardModel,
  ProductOption,
} from "@/lib/models/product-card-model";
import { AssociatedProducts } from "@/lib/types/product/associated-products";
import { CountdownTimer } from "@/lib/types/product/countdown-timer";
import { ProductAttribute } from "@/lib/types/product/product-attribute";
import { ProductTags } from "@/lib/types/product/product-tags";

export class LinkProducts extends Helper {
  products: ProductCardModel[] = [];

  constructor(
    data: GetSimilarProductsQuery | GetYouMightAlsoLikeProductsQuery,
    excludeSku: string,
    excludeUrlKey?: string
  ) {
    super();

    this.products =
      data?.productSearch.items
        ?.filter((item) => {
          const product = item?.productView;

          return (
            product?.sku !== excludeSku && product?.urlKey !== excludeUrlKey
          );
        })
        ?.map((item) => {
          const product = item?.productView;

          let finalPrice: number = 0;
          let regularPrice: number | undefined;
          let currency = ProductViewCurrency.Sar;
          let options: ProductOption | undefined = undefined;
          let countdownTimer: CountdownTimer | null = null;
          let externalId = product?.externalId || "";

          const avgRating: number | undefined = this.parseAttributeValue<{
            avg_rating?: number;
          }>(product?.attributes || [], "review_rating", {})?.avg_rating;
          const valueOff = this.parseAttributeValue<{
            amount_off?: number;
            percent_off?: string;
          }>(product?.attributes || [], "value_off", {});
          const bulletDeliveryAvailable =
            this.getAttributeValue<string>(
              product?.attributes || [],
              "express_delivery_available",
              ""
            ) === "yes";
          const countdownTimerEnabled =
            this.getAttributeValue<string>(
              product?.attributes || [],
              "countdown_timer_enabled",
              ""
            ) === "yes";
          const countdownTimerStartDate = this.getAttributeValue<string>(
            product?.attributes || [],
            "countdown_timer_start_date",
            ""
          );
          const countdownTimerEndDate = this.getAttributeValue<string>(
            product?.attributes || [],
            "countdown_timer_end_date",
            ""
          );
          const countdownTimerTitle = this.getAttributeValue<string>(
            product?.attributes || [],
            "countdown_timer_title",
            ""
          );

          if (
            countdownTimerEnabled &&
            countdownTimerStartDate &&
            countdownTimerEndDate
          ) {
            countdownTimer = {
              enabled: true,
              endDate: countdownTimerEndDate || "",
              startDate: countdownTimerStartDate || "",
              title: countdownTimerTitle || "",
            };
          }

          if (product?.__typename === "ComplexProductView") {
            const associatedProducts =
              this.parseAttributeValue<AssociatedProducts>(
                product?.attributes || [],
                "associated_products",
                {}
              );

            externalId =
              Object.values(associatedProducts)?.[0]?.externalId ||
              product?.externalId ||
              "";

            const complexProduct = product as ComplexProductView;

            finalPrice = product.priceRange?.minimum?.final?.amount?.value || 0;
            regularPrice =
              product.priceRange?.minimum?.regular?.amount?.value || undefined;
            currency =
              product.priceRange?.minimum?.final?.amount?.currency !==
              ProductViewCurrency.None
                ? product.priceRange?.minimum?.final?.amount?.currency ||
                  ProductViewCurrency.Sar
                : ProductViewCurrency.Sar;

            options = {
              choices:
                complexProduct.options?.[0]?.values?.map((option) => ({
                  inStock: option.inStock || false,
                  label: option.title || "",
                  value:
                    (option as ProductViewOptionValueSwatch).value ||
                    option.id ||
                    "",
                })) || [],
              type: complexProduct.options?.[0]?.id as ProductOptionType,
            };
          } else {
            finalPrice = product?.price?.final?.amount?.value || 0;
            regularPrice = product?.price?.regular?.amount?.value || undefined;
            currency =
              product?.price?.final?.amount?.currency !==
              ProductViewCurrency.None
                ? product?.price?.final?.amount?.currency ||
                  ProductViewCurrency.Sar
                : ProductViewCurrency.Sar;
          }

          const brand = this.getAttribute<ProductAttribute>(
            product?.attributes || [],
            "brand_new",
            { label: "", value: "" }
          );
          const productType = this.getAttribute<ProductAttribute>(
            product?.attributes || [],
            "product_type_new2",
            { label: "", value: "" }
          );
          const productTags = this.parseAttributeValue<ProductTags>(
            product?.attributes || [],
            "product_tags",
            []
          );

          const badges: {
            backgroundColor?: string;
            color?: string;
            type: string;
            value?: string;
          }[] = [];

          const isExclusive =
            this.getAttributeValue<string>(
              product?.attributes || [],
              "exclusive",
              ""
            ).toLowerCase() === "yes";
          const isNew =
            this.getAttributeValue<string>(
              product?.attributes || [],
              "is_new",
              ""
            ).toLowerCase() === "yes";

          const hasProductTags = Boolean(productTags && productTags.length > 0);

          if (isNew) {
            badges.push({ type: ProductBadgeType.NewArrival });
          }

          if (isExclusive && (!isNew || !hasProductTags)) {
            badges.push({ type: ProductBadgeType.Exclusive });
          }

          if (hasProductTags) {
            const customTag = productTags[0];

            badges.push({
              ...this.parseProductTagAttributes(
                customTag?.tag_attributes || ""
              ),
              type: ProductBadgeType.Custom,
              value: customTag?.tag_title || "",
            });
          }

          return new ProductCardModel({
            badges,
            brand: brand.value || "",
            bulletDelivery: bulletDeliveryAvailable,
            countdownTimer,
            currency,
            description: product?.shortDescription || "",
            discountPercent: valueOff?.percent_off
              ? parseFloat(valueOff.percent_off.replace("%", ""))
              : undefined,
            externalId,
            id: product?.id || "",
            imageUrl: product?.images?.[0]?.url || "",
            name: product?.name || "",
            oldPrice:
              regularPrice && regularPrice > finalPrice
                ? regularPrice
                : undefined,
            options,
            price: finalPrice,
            productType: productType.value,
            rating: avgRating,
            savedAmount: valueOff?.amount_off || undefined,
            savedCurrency: currency,
            sku: product?.sku || "",
            stockStatus: product?.inStock
              ? StockStatus.InStock
              : StockStatus.OutOfStock,
            urlKey: product?.urlKey || "",
            variant: ProductCardVariant.Single,
          });
        }) || [];
  }
}
