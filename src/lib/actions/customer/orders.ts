import "server-only";

import { cache } from "react";

import { CustomerOrderSortableField, SortEnum } from "@/graphql/graphql";
import { getAuthToken } from "@/lib/actions/auth/get-auth-token";
import { getStoreConfig } from "@/lib/actions/config/get-store-config";
import { graphqlRequest } from "@/lib/clients/graphql";
import { CUSTOMER_GRAPHQL_QUERIES } from "@/lib/constants/api/graphql/customer";
import { Locale } from "@/lib/constants/i18n";
import { CustomerOrders } from "@/lib/models/customer-orders";
import { getStoreCode } from "@/lib/utils/country";
import { failure, ok, unauthenticated } from "@/lib/utils/service-result";

import type { Order as CustomerOrderModel } from "@/lib/models/customer-orders";
import type {
  Attachment,
  Order as UiOrder,
  OrderItem as UiOrderItem,
} from "@/lib/types/ui-types";

function getSortInput(sortBy?: string) {
  if (!sortBy || sortBy === "newest") {
    return {
      sort_direction: SortEnum.Desc,
      sort_field: CustomerOrderSortableField.CreatedAt,
    };
  }

  switch (sortBy) {
    case "newest":
      return {
        sort_direction: SortEnum.Desc,
        sort_field: CustomerOrderSortableField.CreatedAt,
      };
    case "oldest":
      return {
        sort_direction: SortEnum.Asc,
        sort_field: CustomerOrderSortableField.CreatedAt,
      };
    default:
      return {
        sort_direction: SortEnum.Desc,
        sort_field: CustomerOrderSortableField.CreatedAt,
      };
  }
}

export const getCustomerOrders = cache(
  async ({
    locale,
    options,
  }: {
    locale: Locale;
    options?: {
      currentPage?: number;
      pageSize?: number;
      sortBy?: string;
    };
  }) => {
    try {
      const authToken = await getAuthToken();

      if (!authToken) {
        return unauthenticated();
      }

      const sortInput = getSortInput(options?.sortBy);

      const response = await graphqlRequest({
        authToken,
        query: CUSTOMER_GRAPHQL_QUERIES.GET_CUSTOMER_ORDERS,
        storeCode: getStoreCode(locale),
        variables: {
          currentPage: options?.currentPage || 1,
          filter: undefined,
          pageSize: options?.pageSize || 6,
          sort: sortInput,
        },
      });

      if (!response.data?.customer) {
        return unauthenticated();
      }

      const customerOrders = new CustomerOrders(response.data);

      const pageSize = options?.pageSize || 6;
      const currentPage = options?.currentPage || 1;
      const totalCount = customerOrders.totalCount;
      const totalPages = Math.ceil(totalCount / pageSize);

      const validPageInfo = {
        current_page: currentPage,
        page_size: pageSize,
        total_pages: totalPages,
      };

      return ok({
        isFiltered: false,
        orders: customerOrders.orders,
        pageInfo: validPageInfo,
        totalCount: totalCount,
      });
    } catch (error) {
      console.error("Error fetching customer orders:", error);
      return failure("Failed to fetch customer orders");
    }
  }
);

function mapCustomerOrderToUiOrder(order: CustomerOrderModel): UiOrder {
  const shippingHandling = order.total?.shipping_handling;

  const shippingFee =
    shippingHandling?.amount_including_tax?.value ??
    shippingHandling?.total_amount?.value ??
    0;

  const grandTotal =
    order.total?.grand_total?.value ??
    (typeof order.grand_total === "number" ? order.grand_total : 0);

  const tax = order.total?.total_tax?.value;

  // Group items with the same SKU and unit price into a single product line
  const productMap = new Map<string, UiOrderItem>();

  order.items.forEach((item) => {
    const imageUrl = item.product?.image?.url ?? "";

    const image: Attachment = {
      id: item.id,
      original: imageUrl,
      original2: imageUrl,
      thumbnail: imageUrl,
    };

    const unitPrice = item.product_sale_price?.value ?? 0;
    const sku = item.product?.sku || item.id;
    const key = `${sku}::${unitPrice}`;

    const regularPrice = item.product_regular_price?.value;
    const variantSKU = item.product_sku;
    const variantId = item.product?.child_id;
    const brand = item.product?.brand;
    const productType = item.product?.product_type;
    const size = item.product?.size;
    const color = item.product?.color;
    const stockStatus = item.product?.stock_status;

    const existing = productMap.get(key);

    if (existing) {
      existing.quantity += item.quantity_ordered;
      return;
    }

    productMap.set(key, {
      brand,
      color,
      id: sku,
      image,
      name: item.product_name,
      price: unitPrice,
      productId: item.product?.id,
      productType,
      quantity: item.quantity_ordered,
      regularPrice: regularPrice,
      size,
      sku: item.product?.sku,
      stockStatus,
      urlKey: item.product?.url_key || item.product_url_key,
      variantId,
      variantSKU,
    });
  });

  const products: UiOrderItem[] = Array.from(productMap.values());

  const shippingAddress = order.shipping_address;

  const addressLine = shippingAddress
    ? [
        shippingAddress.street?.join(" "),
        shippingAddress.city,
        shippingAddress.region,
        shippingAddress.postcode,
        shippingAddress.country_code,
      ]
        .filter(Boolean)
        .join(", ")
    : undefined;

  const paymentMethodName = order.payment_methods?.[0]?.name;
  const paymentMethodType = order.payment_methods?.[0]?.type;
  const codFee = order.total?.cod_fee?.value;

  // Calculate total discount from discounts array
  const discount =
    order.total?.discounts?.reduce(
      (sum, discount) => sum + Math.abs(discount.amount?.value || 0),
      0
    ) || 0;

  return {
    cod_fee: codFee,
    contactPhone: shippingAddress?.telephone,
    customer: {
      email: "",
      id: 0,
    },
    deliveryAddressText: addressLine,
    deliveryLabel: undefined,
    discount: discount > 0 ? discount : undefined,
    id: order.id,
    mokafaaDiscount: order.total?.mokafaa_discount?.value ?? 0,
    paymentMethod: paymentMethodName,
    paymentMethodType,
    products,
    shipping_fee: shippingFee,
    tax,
    total: grandTotal,
    tracking_number: order.increment_id || order.number,
  };
}

export const getCustomerOrderByNumber = cache(
  async ({ locale, orderNumber }: { locale: Locale; orderNumber: string }) => {
    try {
      const authToken = await getAuthToken();

      if (!authToken) {
        return unauthenticated();
      }

      const storeConfig = await getStoreConfig({ locale });

      const sortInput = getSortInput("newest");

      const response = await graphqlRequest({
        authToken,
        query: CUSTOMER_GRAPHQL_QUERIES.GET_CUSTOMER_ORDERS,
        storeCode: storeConfig.data.store?.code,
        variables: {
          currentPage: 1,
          filter: {
            number: {
              eq: orderNumber,
            },
          },
          pageSize: 1,
          sort: sortInput,
        },
      });

      if (response.errors?.length) {
        console.error(
          "[getCustomerOrderByNumber] GraphQL errors:",
          JSON.stringify(response.errors, null, 2)
        );
      }

      if (!response.data?.customer) {
        return unauthenticated();
      }
      const customerOrders = new CustomerOrders(response.data);
      const order = customerOrders.orders[0] as CustomerOrderModel | undefined;

      if (!order) {
        return failure("Order not found");
      }

      const uiOrder = mapCustomerOrderToUiOrder(order);
      return ok(uiOrder);
    } catch (error) {
      console.error("Error fetching customer order:", error);
      return failure("Failed to fetch customer order");
    }
  }
);
