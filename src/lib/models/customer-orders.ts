// Note: We intentionally avoid coupling the model to generated GraphQL types
// because the orders query fields were expanded. The constructor accepts
// an "unknown" shaped DTO and maps defensively.

export interface Address {
  city: string;
  company?: string;
  country_code: string;
  fax?: string;
  firstname: string;
  lastname: string;
  middlename?: string;
  postcode: string;
  prefix?: string;
  region: string;
  region_id?: number;
  street: string[];
  suffix?: string;
  telephone: string;
  vat_id?: string;
}

export interface MoneyAmount {
  currency: string;
  value: number;
}

export interface Order {
  billing_address?: Address;
  grand_total?: number; // some schemas expose this as a scalar too
  id: string;
  // Newly exposed optional fields
  increment_id?: string;
  items: OrderItem[];
  number: string;
  order_date: string;
  order_invoice_url?: string;
  payment_methods?: PaymentMethod[];
  shipments?: Shipment[];
  shipping_address?: Address;
  shipping_method?: string;
  status: string;
  total: OrderTotal;
  tracking_status?: string;
  user_actions?: UserAction[];
}

export interface OrderItem {
  id: string;
  // New optional product details
  product?: OrderItemProduct;
  product_name: string;
  // Kept for backward compatibility (may not exist in expanded query)
  product_sale_price?: MoneyAmount;
  product_sku: string;
  quantity_ordered: number;
}

export interface OrderItemProduct {
  id?: number | string;
  image?: OrderItemProductImage;
  short_name?: string;
  sku?: string;
  type_id?: string;
}

export interface OrderItemProductImage {
  url: string;
}

export interface OrderTotal {
  cod_fee?: MoneyAmount;
  discounts?: { amount: MoneyAmount; label: string }[];
  grand_total: MoneyAmount;
  mokafaa_discount?: MoneyAmount;
  shipping_handling?: ShippingHandling;
  subtotal?: MoneyAmount;
  total_tax?: MoneyAmount;
}

export interface PaymentMethod {
  additional_data?: PaymentMethodAdditionalData[];
  name: string;
  type: string;
}

export interface PaymentMethodAdditionalData {
  name: string;
  value: string;
}

export interface Shipment {
  id: string;
  items: ShipmentItem[];
  number: string;
  tracking: ShipmentTracking;
}

export interface ShipmentItem {
  id: string;
  product_name: string;
  product_sku: string;
  quantity_shipped: number;
}

export interface ShipmentTracking {
  carrier: string;
  number: string;
  title: string;
}
export interface ShippingHandling {
  amount_including_tax?: MoneyAmount;
  taxes?: ShippingHandlingTax[];
  total_amount?: MoneyAmount;
}

export interface ShippingHandlingTax {
  amount: MoneyAmount;
}

export interface UserAction {
  action: string;
  label: string;
}

export class CustomerOrders {
  public orders: Order[];
  public pageInfo?: {
    current_page: number;
    page_size: number;
    total_pages: number;
  };
  public totalCount: number;

  constructor(dto: any) {
    const items = (dto?.customer?.orders?.items ?? []) as any[];

    this.orders = items.map(
      (order: any): Order => ({
        billing_address: order?.billing_address && {
          city: order?.billing_address?.city || "",
          company: order?.billing_address?.company,
          country_code: order?.billing_address?.country_code || "",
          fax: order?.billing_address?.fax,
          firstname: order?.billing_address?.firstname || "",
          lastname: order?.billing_address?.lastname || "",
          middlename: order?.billing_address?.middlename,
          postcode: order?.billing_address?.postcode || "",
          prefix: order?.billing_address?.prefix,
          region: order?.billing_address?.region || "",
          region_id: order?.billing_address?.region_id,
          street: order?.billing_address?.street || [],
          suffix: order?.billing_address?.suffix,
          telephone: order?.billing_address?.telephone || "",
          vat_id: order?.billing_address?.vat_id,
        },
        grand_total:
          typeof order?.grand_total === "number"
            ? order.grand_total
            : undefined,
        id: order?.id?.toString?.() || "",
        increment_id: order?.increment_id,
        items: Array.isArray(order?.items)
          ? (order.items as any[]).map(
              (item: any): OrderItem => ({
                id: item?.id?.toString?.() || "",
                product: item?.product && {
                  id: item?.product?.id,
                  image: item?.product?.image && {
                    url: item?.product?.image?.url,
                  },
                  short_name: item?.product?.short_name,
                  sku: item?.product?.sku,
                  type_id: item?.product?.type_id,
                },
                product_name: item?.product_name || "",
                product_sale_price: item?.product_sale_price && {
                  currency: item?.product_sale_price?.currency ?? "SAR",
                  value: item?.product_sale_price?.value ?? 0,
                },
                product_sku: item?.product_sku || "",
                quantity_ordered: item?.quantity_ordered ?? 0,
              })
            )
          : [],
        number: order?.number || "",
        order_date: order?.order_date || "",
        order_invoice_url: order?.order_invoice_url,
        payment_methods: Array.isArray(order?.payment_methods)
          ? (order.payment_methods as any[]).map((pm) => ({
              additional_data: Array.isArray(pm?.additional_data)
                ? (pm.additional_data as any[]).map((ad) => ({
                    name: ad?.name || "",
                    value: ad?.value || "",
                  }))
                : undefined,
              name: pm?.name || "",
              type: pm?.type || "",
            }))
          : undefined,
        shipments: Array.isArray(order?.shipments)
          ? (order.shipments as any[]).map((sh) => ({
              id: sh?.id?.toString?.() || "",
              items: Array.isArray(sh?.items)
                ? (sh.items as any[]).map((si) => ({
                    id: si?.id?.toString?.() || "",
                    product_name: si?.product_name || "",
                    product_sku: si?.product_sku || "",
                    quantity_shipped: si?.quantity_shipped ?? 0,
                  }))
                : [],
              number: sh?.number || "",
              tracking: {
                carrier: sh?.tracking?.carrier || "",
                number: sh?.tracking?.number || "",
                title: sh?.tracking?.title || "",
              },
            }))
          : undefined,
        shipping_address: order?.shipping_address && {
          city: order?.shipping_address?.city || "",
          company: order?.shipping_address?.company,
          country_code: order?.shipping_address?.country_code || "",
          fax: order?.shipping_address?.fax,
          firstname: order?.shipping_address?.firstname || "",
          lastname: order?.shipping_address?.lastname || "",
          middlename: order?.shipping_address?.middlename,
          postcode: order?.shipping_address?.postcode || "",
          prefix: order?.shipping_address?.prefix,
          region: order?.shipping_address?.region || "",
          region_id: order?.shipping_address?.region_id,
          street: order?.shipping_address?.street || [],
          suffix: order?.shipping_address?.suffix,
          telephone: order?.shipping_address?.telephone || "",
          vat_id: order?.shipping_address?.vat_id,
        },
        shipping_method: order?.shipping_method,
        status: order?.status || "",
        total: {
          cod_fee: order?.total?.cod_fee && {
            currency: order?.total?.cod_fee?.currency ?? "SAR",
            value: order?.total?.cod_fee?.value ?? 0,
          },
          discounts: Array.isArray(order?.total?.discounts)
            ? (order.total.discounts as any[]).map((d) => ({
                amount: {
                  currency: d?.amount?.currency ?? "SAR",
                  value: d?.amount?.value ?? 0,
                },
                label: d?.label || "",
              }))
            : undefined,
          grand_total: {
            currency: order?.total?.grand_total?.currency ?? "SAR",
            value: order?.total?.grand_total?.value ?? 0,
          },
          mokafaa_discount: order?.total?.mokafaa_discount && {
            currency: order?.total?.mokafaa_discount?.currency ?? "SAR",
            value: order?.total?.mokafaa_discount?.value ?? 0,
          },
          shipping_handling: order?.total?.shipping_handling && {
            amount_including_tax: order?.total?.shipping_handling
              ?.amount_including_tax && {
              currency:
                order?.total?.shipping_handling?.amount_including_tax
                  ?.currency ?? "SAR",
              value:
                order?.total?.shipping_handling?.amount_including_tax?.value ??
                0,
            },
            taxes: Array.isArray(order?.total?.shipping_handling?.taxes)
              ? (order.total.shipping_handling.taxes as any[]).map((t) => ({
                  amount: {
                    currency: t?.amount?.currency ?? "SAR",
                    value: t?.amount?.value ?? 0,
                  },
                }))
              : undefined,
            total_amount: order?.total?.shipping_handling?.total_amount && {
              currency:
                order?.total?.shipping_handling?.total_amount?.currency ??
                "SAR",
              value: order?.total?.shipping_handling?.total_amount?.value ?? 0,
            },
          },
          subtotal: order?.total?.subtotal && {
            currency: order?.total?.subtotal?.currency ?? "SAR",
            value: order?.total?.subtotal?.value ?? 0,
          },
          total_tax: order?.total?.total_tax && {
            currency: order?.total?.total_tax?.currency ?? "SAR",
            value: order?.total?.total_tax?.value ?? 0,
          },
        },
        tracking_status: order?.tracking_status,
        user_actions: Array.isArray(order?.user_actions)
          ? (order.user_actions as any[]).map((ua) => ({
              action: ua?.action || "",
              label: ua?.label || "",
            }))
          : undefined,
      })
    );

    this.totalCount = dto?.customer?.orders?.total_count ?? 0;
    const pi = dto?.customer?.orders?.page_info;
    if (pi) {
      this.pageInfo = {
        current_page: pi.current_page ?? 1,
        page_size: pi.page_size ?? 0,
        total_pages: pi.total_pages ?? 0,
      };
    }
  }

  getOrderById(id: string): Order | undefined {
    return this.orders.find((order) => order.id === id);
  }

  getOrdersByStatus(status: string): Order[] {
    return this.orders.filter((order) => order.status === status);
  }

  getRecentOrders(limit: number = 5): Order[] {
    return this.orders
      .sort(
        (a, b) =>
          new Date(b.order_date).getTime() - new Date(a.order_date).getTime()
      )
      .slice(0, limit);
  }
}
