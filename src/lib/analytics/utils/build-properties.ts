import dayjs from "dayjs";
import { parsePhoneNumberWithError } from "libphonenumber-js";

import { ProductOptionType } from "@/lib/constants/product/product-card";
import {
  isBulletDeliveryVisible,
  isCartBulletEligible,
} from "@/lib/utils/bullet-delivery/eligibility";
import { getShippingTypeFromMethod } from "@/lib/utils/checkout/shipping-type";
import {
  resolveCustomerId,
  resolveCustomerUuid,
} from "@/lib/utils/customer-id-storage";

import type {
  CartProperties,
  OrderProperties,
  ProductProperties,
  PurchaseProperties,
  UserInsiderProperties,
  UserProperties,
} from "../models/event-models";
import type { Cart } from "@/lib/models/cart";
import type { CartItem as CartItemModel } from "@/lib/models/cart";
import type { Customer } from "@/lib/models/customer";
import type { Order } from "@/lib/models/customer-orders";
import type { ProductBasicInfo } from "@/lib/models/product-basic-info";
import type { ProductCardModel } from "@/lib/models/product-card-model";
import type { ProductDetailsModel } from "@/lib/models/product-details-model";
import type { Store } from "@/lib/models/stores";
import type { Order as PurchaseOrder } from "@/lib/types/ui-types";
import type { Order as UiOrder } from "@/lib/types/ui-types";

/**
 * Utility functions to build analytics event properties from data models.
 * These functions are pure utilities that can be used in both Server and Client Components.
 * They don't depend on any client-only code.
 */

// Type for customer properties needed for analytics
export type CustomerProperties = {
  dateOfBirth: string;
  email: string;
  fullName: string;
  gender?: null | number;
  id: null | number;
  phoneNumber: string;
  rewardPointsBalance?: {
    currency?: null | string;
    value?: null | number;
  };
  uuid?: string;
};

// Helper to build cart properties from Cart model
export function buildCartProperties(
  cart: Cart,
  options?: {
    storeConfig?: null | Store | undefined;
  }
): Partial<CartProperties> {
  const cartProperties: Record<string, unknown> = {
    "cart.grandTotal": cart.grandTotalPrice || 0,
    "cart.subtotal": cart.subTotalPrice || 0,
  };

  // Add discounts if available
  if (cart.mokafaaDiscount) {
    cartProperties["cart.discounts"] = cart.mokafaaDiscount;
  }

  // Add promo codes if available
  if (cart.appliedCoupons && cart.appliedCoupons.length > 0) {
    cartProperties["cart.promo_code"] = cart.appliedCoupons.join(",");
  }

  // Add shipping fees
  cartProperties["cart.fees_shipping"] = cart.shippingFee;

  // Extract item IDs from cart items (using externalId which is the cart item id)
  const itemIds = cart.items
    .map((item) => item.externalId || "")
    .filter(Boolean);
  cartProperties["items_ids"] = itemIds.join(",");

  // Check if cart is bullet eligible (baseline)
  cartProperties.express_delivery_available = isCartBulletEligible(cart);

  // If caller provided storeConfig, compute live visibility and override flag.
  // Use current time here and assume checkout usage should skip cutoff check.
  if (options?.storeConfig) {
    try {
      const visible = isBulletDeliveryVisible(
        cart,
        options.storeConfig,
        dayjs(),
        {
          skipCutoffTimeCheck: true,
        }
      );
      cartProperties.express_delivery_available = visible;
    } catch {
      // keep baseline value
    }
  }

  return cartProperties as Partial<CartProperties>;
}

// Helper to build installment payment purchase properties from PurchaseOrder (UI Order type)
// Used for Tabby, Tamara, and other installment payment methods
export function buildInstallmentPurchasePropertiesFromOrder(
  order: PurchaseOrder,
  shippingType: "Click Collect" | "Home Delivery"
): Partial<
  {
    payment_method?: string;
    shipping_type?: "Click Collect" | "Home Delivery";
  } & CartProperties
> {
  // Extract item IDs from order products
  const itemIds = order.products.map((item) => String(item.id)).filter(Boolean);

  // Calculate subtotal from products
  const subtotal = order.products.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
    0
  );

  // Determine express_delivery_available from deliveryLabel
  // Check if deliveryLabel contains "express" (case-insensitive)
  const expressDeliveryAvailable =
    order.deliveryLabel?.toLowerCase().includes("express") ?? false;

  return {
    "cart.fees_shipping": order.shipping_fee || 0,
    "cart.grandTotal": order.total || 0,
    "cart.subtotal": subtotal,
    express_delivery_available: expressDeliveryAvailable,
    item_ids: itemIds.join(","),
    payment_method: order.paymentMethodType,
    shipping_type: shippingType,
  };
}

// Helper to build order properties for analytics tracking from cart
// Combines cart properties with payment method and shipping type
export function buildOrderProperties(
  cart: Cart,
  paymentMethod: string,
  shippingMethod: string
): {
  shipping_type: "Click Collect" | "Home Delivery";
} & Partial<OrderProperties> {
  const cartProperties = buildCartProperties(cart);
  return {
    ...cartProperties,
    payment_method: paymentMethod,
    shipping_type: getShippingTypeFromMethod(shippingMethod),
  };
}

// Helper to build order properties from Order model
export function buildOrderPropertiesFromOrder(
  order: Order
): Partial<OrderProperties> {
  const orderProperties: Record<string, unknown> = {
    "cart.subtotal": order.total?.subtotal?.value || 0,
    "cart.total": order.total?.grand_total?.value || 0,
    "order.payment_method": order.payment_methods?.[0]?.type || "",
  };

  // Add discounts if available
  if (order.total?.discounts && order.total.discounts.length > 0) {
    const totalDiscount = order.total.discounts.reduce(
      (sum, discount) => sum + (discount.amount?.value || 0),
      0
    );
    orderProperties["cart.discounts"] = totalDiscount;
  }

  // Add shipping fees
  if (order.total?.shipping_handling?.total_amount?.value) {
    orderProperties["cart.fees_shipping"] =
      order.total.shipping_handling.total_amount.value;
  }

  // Add COD fees
  if (order.total?.cod_fee?.value) {
    orderProperties["cart.fees_COD"] = order.total.cod_fee.value;
  }

  // Add product list properties grouped by SKU from order items
  order.items.forEach((item) => {
    const sku = (item.product_sku || "").toLowerCase();
    if (!sku) return;

    orderProperties[`product.${sku}.id`] = item.id || "";
    orderProperties[`product.${sku}.name`] = item.product_name || "";
    orderProperties[`product.${sku}.price`] =
      item.product_sale_price?.value || 0;
    orderProperties[`product.${sku}.sku`] = sku;
    orderProperties[`product.${sku}.qty_in_cart`] = item.quantity_ordered || 0;
  });

  return orderProperties as Partial<OrderProperties>;
}

// Helper to build order properties from UI Order type
export function buildOrderPropertiesFromUiOrder(
  order: UiOrder
): Partial<OrderProperties> {
  const orderProperties: Record<string, unknown> = {
    "cart.subtotal": 0, // UI order doesn't have subtotal breakdown
    "cart.total": order.total || 0,
    "order.payment_method": order.paymentMethod || "",
  };

  // Add shipping fees
  if (order.shipping_fee) {
    orderProperties["cart.fees_shipping"] = order.shipping_fee;
  }

  // Add product list properties grouped by SKU from order products
  order.products.forEach((item) => {
    const sku = String(item.id || "").toLowerCase();
    if (!sku) return;

    orderProperties[`product.${sku}.id`] = item.id || "";
    orderProperties[`product.${sku}.name`] = item.name || "";
    orderProperties[`product.${sku}.price`] = item.price || 0;
    orderProperties[`product.${sku}.sku`] = sku;
    orderProperties[`product.${sku}.qty_in_cart`] = item.quantity || 0;
  });

  return orderProperties as Partial<OrderProperties>;
}

// Helper to build product properties from ProductBasicInfo
export function buildProductPropertiesFromBasicInfo(
  product: ProductBasicInfo
): Partial<ProductProperties> {
  const price = product.price
    ? parseFloat(product.price.replace(/[^\d.]/g, ""))
    : 0;

  // Use brand ID as string (brand name not available in basic info query)
  const brandId = product.brandId ? String(product.brandId) : "";
  const brandName = brandId; // Use brand ID as name since we don't have brand name

  return {
    "product.brand": brandName,
    "product.brand_id": brandId,
    "product.id": product.id?.toString() || product.uid || "",
    "product.name": product.name || "",
    "product.price": price,
    "product.sku": product.sku || "",
    "product.type": product.type || "",
  };
}

// Helper to build product properties from ProductCardModel
export function buildProductPropertiesFromCard(
  product: ProductCardModel
): Partial<ProductProperties> {
  return {
    "product.brand": product.brand || undefined,
    "product.brand_id": product.brand || undefined,
    "product.id": product.externalId || "",
    "product.name": product.name || "",
    "product.price": product.priceValue || 0,
    "product.sku": product.sku || "",
    "product.type": product.productType || undefined,
    // Extract size from options if available
    ...(product.options?.selected?.label && {
      "product.size": product.options.selected.label,
    }),
  };
}

// Helper to build product properties from CartItem
export function buildProductPropertiesFromCartItem(
  item: CartItemModel
): Partial<ProductProperties> {
  return {
    "product.brand": item.brand || undefined,
    "product.brand_id": item.brand || undefined,
    "product.id": item.externalId || "",
    "product.name": item.name || "",
    "product.price": item.priceValue || 0,
    "product.sku": item.sku || "",
    "product.type": item.options?.type?.toString() || undefined,
    ...(item.options?.selected?.label && {
      "product.size": item.options.selected.label,
    }),
  };
}

// Helper to build product properties from ProductDetailsModel
export function buildProductPropertiesFromDetails(
  product: ProductDetailsModel
): Partial<ProductProperties>;

// Helper to build product properties from ProductVariant
export function buildProductPropertiesFromDetails(
  product: ProductDetailsModel["variants"][number],
  parentProduct: ProductDetailsModel
): Partial<ProductProperties>;

// Implementation
export function buildProductPropertiesFromDetails(
  product: ProductDetailsModel | ProductDetailsModel["variants"][number],
  parentProduct?: ProductDetailsModel
): Partial<ProductProperties> {
  // Check if it's a ProductVariant (has label but no name)
  const isVariant = "label" in product && !("name" in product);

  if (isVariant && parentProduct) {
    // Handle ProductVariant
    const variant = product as ProductDetailsModel["variants"][number];

    // Get size from variant if it's a size variant, otherwise check parent for size variant
    let productSize: string | undefined;
    if (variant.type === ProductOptionType.Size) {
      productSize = variant.label;
    } else {
      // Look for a size variant in the parent product
      const sizeVariant = parentProduct.variants.find(
        (v) => v.type === ProductOptionType.Size
      );
      productSize = sizeVariant?.label;
    }

    // Get color from variant if it's a color variant, otherwise check parent for color variant
    let productColor: string | undefined;
    if (variant.type === ProductOptionType.Color) {
      productColor = variant.color || variant.label;
    } else {
      // Look for a color variant in the parent product
      const colorVariant = parentProduct.variants.find(
        (v) => v.type === ProductOptionType.Color
      );
      productColor = colorVariant?.color || colorVariant?.label;
    }

    return {
      "product.brand": parentProduct.brand || "",
      "product.brand_id": parentProduct.brand || "",
      "product.id": variant.externalId || parentProduct.externalId || "",
      "product.name": parentProduct.name || variant.label || "",
      "product.price": variant.priceValue || 0,
      "product.sku": variant.sku || "",
      "product.type": parentProduct.type?.toString() || "",
      ...(productColor && {
        "product.color": productColor,
      }),
      ...(productSize && {
        "product.size": productSize,
      }),
    };
  }

  // Handle ProductDetailsModel (non-variant product)
  const productModel = product as ProductDetailsModel;

  const basePrice =
    productModel.priceValue ||
    (productModel.price ? parseFloat(productModel.price) : 0);
  const productPrice =
    basePrice || (productModel.variants?.[0]?.priceValue ?? 0);

  const sizeVariant = productModel.variants.find(
    (v) => v.type === ProductOptionType.Size
  );
  const productSize = sizeVariant?.label;

  const colorVariant = productModel.variants.find(
    (v) => v.type === ProductOptionType.Color
  );
  const productColor = colorVariant?.color || colorVariant?.label;

  return {
    "product.brand": productModel.brand || "",
    "product.brand_id": productModel.brand || "",
    "product.id": productModel.externalId || productModel.id?.toString() || "",
    "product.name": productModel.name || "",
    "product.price": productPrice,
    "product.sku": productModel.sku || "",
    "product.type": productModel.productInfo?.type || "",
    ...(productColor && {
      "product.color": productColor,
    }),
    ...(productSize && {
      "product.size": productSize,
    }),
  };
}

// Helper to build product properties from mobile top bar context product info
export function buildProductPropertiesFromMobileTopBar(productInfo: {
  brand: string;
  externalId?: string;
  id?: number;
  name: string;
  priceValue?: number;
  sku?: string;
  type?: string;
}): Partial<ProductProperties> {
  return {
    "product.brand": productInfo.brand || "",
    "product.brand_id": productInfo.brand || "",
    "product.id": productInfo.id?.toString() || productInfo.externalId || "",
    "product.name": productInfo.name || "",
    "product.price": productInfo.priceValue || 0,
    "product.sku": productInfo.sku || "",
    "product.type": productInfo.type || "",
  };
}

// Helper to build purchase properties from PurchaseOrder (UI Order type)
export function buildPurchasePropertiesFromOrder(
  order: PurchaseOrder,
  shippingType: "Click Collect" | "Home Delivery"
): Partial<PurchaseProperties> {
  // Extract item IDs from order products
  const itemIds = order.products.map((item) => String(item.id)).filter(Boolean);

  // Calculate subtotal from products
  const subtotal = order.products.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
    0
  );

  return {
    item_ids: itemIds.join(","),
    order_id: String(order.tracking_number || ""),
    "order.fees_COD": order.cod_fee,
    "order.fees_shipping": order.shipping_fee || 0,
    "order.grandTotal": order.total || 0,
    "order.id": String(order.tracking_number || ""),
    "order.payment_method": order.paymentMethod || "",
    "order.subtotal": subtotal,
    shipping_type: shippingType,
  };
}

// Helper to build purchase properties from UI Order type
export function buildPurchasePropertiesFromUiOrder(
  order: UiOrder,
  shippingType: "Click Collect" | "Home Delivery"
): Partial<PurchaseProperties> {
  // Extract item IDs from order products
  const itemIds = order.products.map((item) => String(item.id)).filter(Boolean);

  // Calculate subtotal from products
  const subtotal = order.products.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
    0
  );

  return {
    item_ids: itemIds.join(","),
    order_id: String(order.id || ""),
    "order.fees_shipping": order.shipping_fee || 0,
    "order.grandTotal": order.total || 0,
    "order.id": String(order.id || ""),
    "order.payment_method": order.paymentMethod || "",
    "order.subtotal": subtotal,
    shipping_type: shippingType,
  };
}

// Helper to build track-order event properties from Order model
export function buildTrackOrderPropertiesFromOrder(order: Order): Partial<{
  item_ids: string;
  "order.fees_COD": number;
  "order.fees_shipping": number;
  "order.grandTotal": number;
  "order.id": string;
  "order.subtotal": number;
}> {
  // Extract item IDs from order items
  const itemIds = order.items.map((item) => item.id).filter(Boolean);

  return {
    item_ids: itemIds.join(","),
    "order.fees_COD": order.total?.cod_fee?.value,
    "order.fees_shipping":
      order.total?.shipping_handling?.total_amount?.value ||
      order.total?.shipping_handling?.amount_including_tax?.value,
    "order.grandTotal":
      order.total?.grand_total?.value || order.grand_total || 0,
    "order.id": order.increment_id || order.id || "",
    "order.subtotal": order.total?.subtotal?.value || 0,
  };
}

// Helper to build user properties from Customer model or customer properties
export function buildUserInsiderProperties(
  customer: CustomerProperties
): Partial<UserInsiderProperties> {
  const resolvedId = resolveCustomerId(customer) ?? "";
  const resolvedUuid = resolveCustomerUuid() ?? "";

  return {
    age: calculateAge(customer.dateOfBirth) || 0,
    birthday: customer.dateOfBirth || "",
    custom: {
      gs_uuid: resolvedUuid || "",
    },
    email: customer.email || "",
    email_optin: true,
    gdpr_optin: true,
    gender: customer.gender?.toString() === "1" ? "M" : "F",
    name: customer.fullName.split(" ")[0] || "",
    phone_number: customer.phoneNumber || "",
    surname: customer.fullName.split(" ")[1] || "",
    uuid: resolvedId.toString(),
    whatsapp_optin: true,
  };
}

// Helper to build user properties from Customer model or customer properties
export function buildUserProperties(
  customer: Customer | CustomerProperties
): Partial<UserProperties> {
  const resolvedId = resolveCustomerId(customer) ?? null;
  const resolvedUuid = resolveCustomerUuid() ?? "";

  return {
    "user.age": customer.dateOfBirth || "",
    "user.email": customer.email || "",
    "user.gender": customer.gender?.toString() || "",
    "user.id": resolvedId?.toString() || "",
    "user.name": customer.fullName || "",
    "user.phone": formatFullPhoneForAnalytics(customer.phoneNumber || ""),
    "user.uuid": resolvedUuid,
    "user.wallet_points": customer.rewardPointsBalance?.value ?? 0,
  };
}

/**
 * Helper to build user properties from customer data with resolved customer ID
 * This is useful when you have customer data from a query/mutation and need to
 * resolve the customer ID (from cookie if not in response) before building properties
 * @param customer - Customer data (can be null/undefined)
 * @returns User properties object or undefined if customer is not available
 */
export function buildUserPropertiesFromCustomer(
  customer: Customer | null | undefined
): Partial<UserProperties> | undefined {
  if (!customer) {
    return undefined;
  }

  const resolvedId = resolveCustomerId(customer) ?? null;
  const resolvedUuid = resolveCustomerUuid() ?? "";

  return {
    "user.age": customer.dateOfBirth || "",
    "user.email": customer.email || "",
    "user.gender": customer.gender?.toString() || "",
    "user.id": resolvedId?.toString() || "",
    "user.name": customer.fullName || "",
    "user.phone": formatFullPhoneForAnalytics(customer.phoneNumber || ""),
    "user.uuid": resolvedUuid,
    "user.wallet_points": customer.rewardPointsBalance?.value ?? 0,
  };
}

/**
 * Format a full phone string for analytics: single space between country code and number.
 * e.g. "+966512345678" → "+966 512345678"
 * Falls back to original string if parsing fails.
 */
export function formatFullPhoneForAnalytics(phone: string): string {
  if (!phone?.trim()) return "";
  try {
    const cleaned = phone.trim().replace(/\s+/g, "");
    const parsed = parsePhoneNumberWithError(
      cleaned.startsWith("+") ? cleaned : `+${cleaned}`
    );
    return `+${parsed.countryCallingCode} ${parsed.nationalNumber}`;
  } catch {
    return phone;
  }
}

/**
 * Format phone number for analytics: single space between country code and number.
 * e.g. "+966" + "512345678" → "+966 512345678"
 */
export function formatPhoneForAnalytics(
  countryCode: string,
  phoneNumber: string
): string {
  return `${countryCode} ${phoneNumber}`.trim();
}

/**
 * Calculate age based on birth date.
 * @param birthDate - The birth date string.
 * @returns The calculated age.
 */
export const calculateAge = (birthDate: string) => {
  const today = new Date();
  const birth = new Date(birthDate);
  const age = today.getFullYear() - birth.getFullYear();
  const hasHadBirthdayThisYear =
    today >= new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
  return hasHadBirthdayThisYear ? age : age - 1;
};
