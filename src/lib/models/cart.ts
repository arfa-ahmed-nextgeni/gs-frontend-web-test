import {
  CartItemInterface,
  ConfigurableCartItem,
  CurrencyEnum,
  GetCartDetailsQuery,
  GetCustomerCartDetailsQuery,
  ProductInterface,
  SimpleCartItem,
} from "@/graphql/graphql";
import {
  ProductCardVariant,
  ProductOptionType,
} from "@/lib/constants/product/product-card";
import { Helper } from "@/lib/models/helper";
import {
  ProductCardModel,
  ProductOption,
} from "@/lib/models/product-card-model";
import { CountdownTimer } from "@/lib/types/product/countdown-timer";

type CartPaymentMethod = {
  code?: null | string;
  downtime_alert?: null | string;
  title?: null | string;
};

// Type for shipping address from cart query (partial ShippingCartAddress)
type CartShippingAddress = {
  available_shipping_methods?: Array<{
    amount?: {
      currency?: null | string;
      value?: null | number;
    } | null;
    carrier_code?: null | string;
    carrier_title?: null | string;
    method_code?: null | string;
    method_title?: null | string;
  } | null> | null;
  city: string;
  country: {
    code: string;
    label: string;
  };
  firstname: string;
  lastname: string;
  postcode?: null | string;
  region?: {
    code?: null | string;
    label?: null | string;
  } | null;
  selected_shipping_method?: {
    amount?: {
      currency?: null | string;
      value?: null | number;
    } | null;
    base_amount?: {
      currency?: null | string;
      value?: null | number;
    } | null;
    carrier_code?: null | string;
    carrier_title?: null | string;
    method_code?: null | string;
    method_title?: null | string;
    price_incl_tax?: {
      currency?: null | string;
      value?: null | number;
    } | null;
  } | null;
  street: (null | string)[];
  telephone?: null | string;
};

export class Cart extends Helper {
  appliedCoupons?: string[];
  appliedRewardPoints: boolean;
  availablePaymentMethods?: CartPaymentMethod[];
  baseShippingFee?: number;
  discount: number;
  giftMessage?: string;
  grandTotalFormattedPrice: string;
  grandTotalPrice: number;
  hasSelectedShippingMethod: boolean;
  id: string;
  isBulletEligible?: boolean;
  items: CartItem[];
  mokafaaDiscount: number;
  mokafaaEnabledForWeb?: boolean;
  pointsToSpend?: number;
  rewardPointsBaseValue?: number;
  rewardThreshold?: number;
  selectedPaymentMethod?: CartPaymentMethod | null;
  serviceFee?: number;
  serviceFeeMessage?: string;
  shippingAddress?: CartShippingAddress | null;
  shippingFee?: number;
  subTotalFormattedPrice: string;
  subTotalPrice: number;
  totalItemCount: number;
  totalQuantity: number;

  constructor(data: GetCartDetailsQuery | GetCustomerCartDetailsQuery) {
    super();

    let cart: GetCartDetailsQuery["cart"] = null;
    if ("customerCart" in data && data.customerCart) {
      cart = data.customerCart;
    } else if ("cart" in data && data.cart) {
      cart = data.cart;
    }

    this.id = cart?.id || "";
    this.mokafaaEnabledForWeb = cart?.mokafaa?.enabled_for_web || undefined;
    this.mokafaaDiscount = cart?.prices?.mokafaa_discount?.value || 0;
    this.discount =
      typeof cart?.prices?.discount?.amount?.value === "number"
        ? Math.abs(cart?.prices?.discount?.amount?.value)
        : 0;
    this.giftMessage = cart?.gift_message?.message || undefined;
    this.subTotalPrice = cart?.prices?.subtotal_including_tax?.value || 0;
    this.subTotalFormattedPrice = cart?.prices?.subtotal_including_tax?.value
      ? this.formatPrice({
          amount: cart.prices.subtotal_including_tax.value,
          currencyCode: cart.prices.subtotal_including_tax.currency || "SAR",
          locale: "en-US",
        })
      : "";
    this.grandTotalPrice = cart?.prices?.grand_total?.value || 0;
    this.grandTotalFormattedPrice = cart?.prices?.grand_total?.value
      ? this.formatPrice({
          amount: cart?.prices?.grand_total?.value,
          currencyCode: cart?.prices?.grand_total?.currency || "SAR",
          locale: "en-US",
        })
      : "";
    this.totalQuantity = cart?.total_quantity || 0;
    this.totalItemCount = cart?.itemsV2?.total_count || 0;
    this.items =
      cart?.itemsV2?.items
        ?.filter((item): item is NonNullable<typeof item> => !!item)
        .map((item) => new CartItem(item as CartItemInterface)) || [];
    this.serviceFee = cart?.prices?.small_order_fee?.value || undefined;
    this.serviceFeeMessage = (cart as any)?.service_fee_message || undefined;
    this.isBulletEligible = cart?.is_bullet_eligible || undefined;

    const selectedMethod =
      cart?.shipping_addresses?.[0]?.selected_shipping_method;
    const availableMethods =
      cart?.shipping_addresses?.[0]?.available_shipping_methods || [];
    this.hasSelectedShippingMethod = Boolean(
      selectedMethod?.carrier_code && selectedMethod?.method_code
    );
    this.shippingFee = this.hasSelectedShippingMethod
      ? (selectedMethod?.price_incl_tax?.value ?? 0)
      : undefined;

    // Get base shipping fee from available shipping methods by matching selected method
    if (
      this.hasSelectedShippingMethod &&
      selectedMethod &&
      availableMethods.length > 0
    ) {
      // Try to find exact match first
      let matchingMethod = availableMethods.find(
        (method) =>
          method?.carrier_code === selectedMethod.carrier_code &&
          method?.method_code === selectedMethod.method_code
      );

      // If no exact match, try to find by method_code only (in case carrier_code differs)
      if (!matchingMethod) {
        matchingMethod = availableMethods.find(
          (method) => method?.method_code === selectedMethod.method_code
        );
      }

      // If still no match, use the first available method with a non-zero amount as fallback
      if (!matchingMethod && availableMethods.length > 0) {
        matchingMethod =
          availableMethods.find((m) => (m?.amount?.value ?? 0) > 0) ||
          availableMethods[0];
      }

      this.baseShippingFee = matchingMethod?.amount?.value || undefined;

      // Debug logging
      if (!this.baseShippingFee && selectedMethod) {
        console.warn("[Cart] Could not find base shipping fee:", {
          availableMethods: availableMethods.map((m) => ({
            amount: m?.amount?.value,
            carrier: m?.carrier_code,
            method: m?.method_code,
          })),
          selectedCarrier: selectedMethod.carrier_code,
          selectedMethod: selectedMethod.method_code,
        });
      }
    }

    // Fallback to base_amount if we still don't have a value
    if (this.hasSelectedShippingMethod && !this.baseShippingFee) {
      this.baseShippingFee =
        cart?.shipping_addresses?.[0]?.selected_shipping_method?.base_amount
          ?.value || undefined;
    }

    // Final fallback: if we have free shipping (shippingFee = 0) but no baseShippingFee,
    // try to get the original fee from available methods (first method with non-zero amount)
    if (
      this.hasSelectedShippingMethod &&
      !this.baseShippingFee &&
      this.shippingFee === 0 &&
      availableMethods.length > 0
    ) {
      const methodWithFee = availableMethods.find(
        (m) => (m?.amount?.value ?? 0) > 0
      );
      if (methodWithFee) {
        this.baseShippingFee = methodWithFee.amount?.value || undefined;
        console.info(
          "[Cart] Using available method as base shipping fee fallback:",
          methodWithFee.amount?.value
        );
      }
    }

    this.appliedCoupons =
      cart?.applied_coupons?.map((c) => c?.code || "") || [];

    // Store reward points information
    this.pointsToSpend =
      cart?.reward_points_applied?.points_to_spend || undefined;
    this.rewardPointsBaseValue =
      cart?.reward_points_applied?.base_value || undefined;
    this.rewardThreshold =
      cart?.reward_points_applied?.reward_threshold || undefined;
    this.appliedRewardPoints = Boolean(cart?.applied_reward_points);

    // Store shipping address if available
    // Type assertion needed because GraphQL types (CurrencyEnum) don't match our simplified type
    this.shippingAddress =
      (cart?.shipping_addresses?.[0] as CartShippingAddress) || null;

    // Store payment methods if available
    this.availablePaymentMethods =
      cart?.available_payment_methods?.filter(
        (method): method is CartPaymentMethod => Boolean(method)
      ) || undefined;

    // Store selected payment method if available
    this.selectedPaymentMethod = cart?.selected_payment_method
      ? {
          code: cart.selected_payment_method.code || null,
          title: null,
        }
      : null;
  }
}

export class CartItem extends ProductCardModel {
  color?: string;
  countdownTimer: CountdownTimer | null = null;
  quantity: number;
  size?: string;
  stockLeft?: number;
  uidInCart: string;

  constructor(item: CartItemInterface) {
    const product = item.product as ProductInterface;
    const quantity = item?.quantity ?? 0;
    let minPrice = item?.product.price_range?.minimum_price;
    const isGwp = item?.is_gwp;
    const isWrap = item?.is_wrap;
    let countdownTimer = null;

    let options: ProductOption | undefined = undefined;

    let bulletDelivery = false;
    let externalId = `${product.id ?? ""}`;
    let sku = product?.sku || "";
    let parentId: string | undefined = undefined;
    let skuParent: string | undefined = undefined;
    let size: string | undefined = undefined;
    let color: string | undefined = undefined;
    let stockLeft: number | undefined = undefined;
    const attributeSet = (item as any).attribute_set || undefined;
    const productType = (product as any).product_type_new2 || undefined;

    if ((item as any).__typename === "ConfigurableCartItem") {
      const confItem = item as ConfigurableCartItem;

      if (confItem.configured_variant) {
        parentId = externalId;
        skuParent = sku;
        externalId = `${(confItem.configured_variant as any).id ?? ""}`;
        sku = (confItem.configured_variant as any).sku || sku;
        stockLeft =
          (confItem.configured_variant as any).only_x_left_in_stock ??
          undefined;
      }

      const sizeOpt = confItem.configurable_options.find((opt) =>
        opt?.option_label?.toLowerCase().includes("size")
      );
      size = sizeOpt?.value_label || undefined;

      const colorOpt = confItem.configurable_options.find((opt) =>
        opt?.option_label?.toLowerCase().includes("color")
      );
      color = colorOpt?.value_label || undefined;

      options = {
        choices: confItem.configurable_options.map((opt) => ({
          inStock: true,
          label: opt?.value_label || "",
          value: opt?.configurable_product_option_value_uid || "",
        })),
        type: ProductOptionType.Size,
      };
      minPrice = confItem.configured_variant.price_range.minimum_price;

      bulletDelivery = Helper.isFlagEnabled(
        confItem.configured_variant.express_delivery_available
      );

      if (confItem.configured_variant.countdown_timer_enabled === 1) {
        countdownTimer = {
          enabled: true,
          endDate: confItem.configured_variant.countdown_timer_end_date || "",
          startDate:
            confItem.configured_variant.countdown_timer_start_date || "",
          title: confItem.configured_variant.countdown_timer_title || "",
        };
      }
    } else {
      const simpleItem = item as SimpleCartItem;

      bulletDelivery = Helper.isFlagEnabled(
        simpleItem.product.express_delivery_available
      );

      if (simpleItem.product.countdown_timer_enabled === 1) {
        countdownTimer = {
          enabled: true,
          endDate: simpleItem.product.countdown_timer_end_date || "",
          startDate: simpleItem.product.countdown_timer_start_date || "",
          title: simpleItem.product.countdown_timer_title || "",
        };
      }
    }

    const finalPrice = minPrice?.final_price?.value || 0;
    const regularPrice = minPrice?.regular_price?.value;
    const currency = minPrice?.final_price?.currency || CurrencyEnum.Sar;
    const discountPercent = minPrice?.discount?.percent_off || undefined;
    const savedAmount = minPrice?.discount?.amount_off || 0;

    super({
      attributeSet,
      brand: product.brand_new_label || "",
      bulletDelivery,
      currency,
      description: product?.short_description?.html || "",
      discountPercent,
      externalId,
      id: product?.uid || "",
      imageUrl: product?.thumbnail?.url || "",
      isGwp: isGwp || false,
      isWrap: isWrap || false,
      name: product?.name || "",
      oldPrice:
        regularPrice && regularPrice > finalPrice ? regularPrice : undefined,
      options,
      parentId,
      price: finalPrice,
      productType,
      ratingSummary: product.rating_summary,
      savedAmount,
      sku,
      skuParent,
      stockStatus: (product?.stock_status as string) || "",
      urlKey: product?.url_key || "",
      variant: ProductCardVariant.Single,
    });

    this.quantity = quantity;
    this.uidInCart = item.uid;
    this.isGwp = isGwp || false;
    this.isWrap = isWrap || false;
    this.countdownTimer = countdownTimer;
    this.size = size;
    this.color = color;
    this.stockLeft = stockLeft;
  }
}
