import { Metadata } from "next";
import { notFound } from "next/navigation";

import { getLocale } from "next-intl/server";

import { PurchaseTracker } from "@/components/analytics/purchase-tracker";
import { getCustomerOrderByNumber } from "@/lib/actions/customer/orders";
import { getProductsTypeBySkus } from "@/lib/actions/products/get-products-type-by-skus";
import { Locale } from "@/lib/constants/i18n";
import { QueryParamsKey } from "@/lib/constants/query-params";
import { isOk } from "@/lib/utils/service-result";

import OrderConfirmationContent from "./order-confirmation-content";

import type {
  ServiceResultError,
  ServiceResultOk,
} from "@/lib/types/service-result";

export const metadata: Metadata = {
  title: "Order",
};

export default async function Order({
  searchParams,
}: PageProps<"/[locale]/checkout/order-confirmation">) {
  const search = await searchParams;
  const orderId =
    typeof search[QueryParamsKey.OrderId] === "string"
      ? search[QueryParamsKey.OrderId]
      : null;

  // Fetch order to get product SKUs and determine product types
  let productTypesResult:
    | null
    | (ServiceResultError | ServiceResultOk<"beauty" | "fragrance" | "mix">) =
    null;

  const locale = (await getLocale()) as Locale;

  if (orderId) {
    const [orderResult] = await Promise.all([
      getCustomerOrderByNumber({ locale, orderNumber: orderId }),
    ]);

    if (isOk(orderResult) && orderResult.data) {
      // Extract SKUs from order items
      // OrderItem.id is the SKU based on the mapping in getCustomerOrderByNumber
      const skus = orderResult.data.products
        .map((item) => item.sku)
        .filter((sku): sku is string => Boolean(sku));

      if (skus.length > 0) {
        productTypesResult = await getProductsTypeBySkus(skus);
      }

      return (
        <>
          <PurchaseTracker
            order={orderResult.data}
            orderId={orderId}
            productsType={productTypesResult?.data || "mix"}
          />
          <OrderConfirmationContent
            order={orderResult.data}
            orderId={orderId}
          />
        </>
      );
    }

    return notFound();
  }

  return notFound();
}
