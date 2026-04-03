import { useMemo } from "react";

import Image from "next/image";

import { Star } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import ConfettiIcon from "@/assets/gifs/Confetti.gif";
import { JoinBanner } from "@/components/shared/join-banner";
import { LocalizedPrice } from "@/components/shared/localized-price";
import { Tooltip } from "@/components/shared/tooltip";
import { useStoreConfig } from "@/contexts/store-config-context";
import { useCart } from "@/contexts/use-cart";
import { useStoreCode } from "@/hooks/i18n/use-store-code";
import { useCustomerQuery } from "@/hooks/queries/use-customer-query";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils/price";

import type { Order, OrderItem } from "@/lib/types/ui-types";

type DisplayOrderItem = {
  description?: string;
  originalPrice?: number;
  size?: string;
} & OrderItem;

interface OrderInformationProps {
  order: Order;
  orderId?: null | string;
}

const fallbackItems: DisplayOrderItem[] = [
  {
    description:
      "Orchid accord blend with sumptuous heart notes of dark vanilla and ebony wood",
    id: "fallback-1",
    image: {
      id: "fallback-img-1",
      original: "",
      original2: "",
      thumbnail: "/assets/images/products/p-1.jpg",
    },
    name: "Giorgio Armani",
    originalPrice: 406,
    price: 329,
    quantity: 1,
    size: "50ml",
  },
  {
    description:
      "Orchid accord blend with sumptuous heart notes of dark vanilla and ebony wood",
    id: "fallback-2",
    image: {
      id: "fallback-img-2",
      original: "",
      original2: "",
      thumbnail: "/assets/images/products/p-2.jpg",
    },
    name: "Laura Mercier",
    originalPrice: 260,
    price: 159,
    quantity: 1,
    size: "50ml",
  },
  {
    description:
      "Orchid accord blend with sumptuous heart notes of dark vanilla and ebony wood",
    id: "fallback-3",
    image: {
      id: "fallback-img-3",
      original: "",
      original2: "",
      thumbnail: "/assets/images/products/p-3.jpg",
    },
    name: "Mont Blanc",
    originalPrice: 260,
    price: 190,
    quantity: 2,
    size: "50ml",
  },
];

const highlightTextClass = "text-[#374957]";
const mutedTextClass = "text-[#85878A]";

export function OrderInformation({ order, orderId }: OrderInformationProps) {
  const { storeConfig } = useStoreConfig();
  const locale = useLocale();
  const t = useTranslations("OrderConfirmation");
  const { isGlobal, storeCode } = useStoreCode();
  const { cart } = useCart();
  const { data: currentCustomer, isLoading: isCustomerLoading } =
    useCustomerQuery();

  const currencyCode = storeConfig?.currencyCode || "SAR";
  const isArabic = locale === "ar";
  const isLoading = false;

  const items: DisplayOrderItem[] =
    (order?.products as DisplayOrderItem[] | undefined)?.map((item) => {
      const hasRealOriginalPrice =
        typeof item.originalPrice === "number" &&
        item.originalPrice > (item.price || 0);

      return {
        ...item,
        description: item.description,
        originalPrice: hasRealOriginalPrice ? item.originalPrice : undefined,
        size: item.size ?? "50ml",
      };
    }) || fallbackItems;

  const subtotal = useMemo(
    () =>
      items.reduce(
        (acc, item) => acc + (item.price || 0) * (item.quantity || 0),
        0
      ),
    [items]
  );

  const shippingFee = order?.shipping_fee ?? 0;

  const serviceFee =
    typeof order?.total === "number"
      ? Math.max(order.total - subtotal - shippingFee, 0)
      : 0;

  const grandTotal =
    typeof order?.total === "number"
      ? order.total
      : subtotal + shippingFee + serviceFee;
  const mokafaaDiscount = order?.mokafaaDiscount || 0;

  const formatAmount = (amount: number) =>
    formatPrice({
      amount,
      currencyCode,
      locale,
      options: {
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      },
    });

  const renderDiscountPrice = (amount: number) => {
    const formattedPrice = formatAmount(amount);
    return (
      <LocalizedPrice
        containerProps={{
          className: "inline-flex items-center text-text-teal",
        }}
        price={`-${formattedPrice}`}
        valueProps={{
          className: "text-sm font-medium text-text-teal",
        }}
      />
    );
  };

  const effectiveOrderId = orderId || order?.tracking_number || "—";

  const deliveryEstimate =
    order?.deliveryLabel || t("fallbackDeliveryEstimate");

  const contactNumber = order?.contactPhone;

  const addressLine = order?.deliveryAddressText;

  const formattedAddressLines = useMemo(() => {
    if (!addressLine) return [];

    let parts = addressLine
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (parts.length === 1) {
      const commaParts = addressLine
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (commaParts.length > 1) parts = commaParts;
    }

    if (parts.length >= 4) {
      return [
        `${parts[0]}${parts[1] ? ", " + parts[1] : ""}`,
        parts.slice(2).join(", "),
      ];
    }

    if (parts.length === 3) return [`${parts[0]}, ${parts[1]}`, parts[2]];
    if (parts.length === 2) return parts;
    return [parts[0]];
  }, [addressLine]);

  const paymentMethod = order?.paymentMethod;

  const additionalPaymentMethod =
    order.mokafaaDiscount > 0 ? t("rajhiMokafaa") : null;

  const hasPaymentMethod = Boolean(paymentMethod);
  const hasAdditionalPaymentMethod = Boolean(additionalPaymentMethod);
  const hasDeliveryEstimate = Boolean(deliveryEstimate);
  const hasAnyOrderMeta =
    hasPaymentMethod || hasAdditionalPaymentMethod || hasDeliveryEstimate;

  const hasAddressLine = Boolean(addressLine);
  const hasContactNumber = Boolean(contactNumber);
  const hasDeliveryAddress = hasAddressLine || hasContactNumber;

  const renderPrice = (item: DisplayOrderItem) => {
    const price = formatAmount(item.price);
    const original = item.originalPrice
      ? formatAmount(item.originalPrice)
      : null;

    return (
      <div className="flex flex-col items-end gap-0.5 text-right">
        <LocalizedPrice
          containerProps={{
            className: cn(
              "text-[16px] font-semibold",
              original ? "text-[#FE5000]" : "text-text-primary"
            ),
          }}
          price={price}
        />
        {original && (
          <LocalizedPrice
            containerProps={{
              className: "text-[12px] text-[#9CA3AF] line-through",
            }}
            price={original}
          />
        )}
      </div>
    );
  };

  const isEmpty = !items.length;

  return (
    <div className="pb-10 pt-2 lg:px-5 lg:pb-16">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[797px_394px] lg:gap-[10px]">
        <div className="space-y-4">
          <div>
            <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-center lg:gap-6">
              <div className="flex items-center justify-center">
                <Image
                  alt="Confetti"
                  className="lg:h-50 lg:w-50 h-20 w-20 rounded-full object-cover"
                  height={100}
                  src={ConfettiIcon}
                  width={100}
                />
              </div>
              <div
                className={cn(
                  "space-y-2 text-center lg:text-left",
                  isArabic && "lg:text-right"
                )}
              >
                <h1 className="text-text-primary text-[40px] font-normal leading-tight md:text-[56px] lg:text-[70px]">
                  {t("heroTitle")}
                </h1>
                <p
                  className={cn(
                    "text-[14px] md:text-[18px] lg:text-base",
                    mutedTextClass
                  )}
                >
                  {t("heroSubtitle")}
                </p>
              </div>
            </div>
            {contactNumber && (
              <div className="mt-5 rounded-lg bg-[#E5F5F2] px-4 py-3 text-center text-lg font-normal text-[#57C0AD] lg:mt-6 lg:text-base">
                {t("smsNotice", { phone: `\u2066${contactNumber}\u2069` })}
              </div>
            )}
          </div>
          {!isCustomerLoading && !currentCustomer?.email && (
            <JoinBanner
              linkText={t("joinHere")}
              showDesktop={false}
              storeCode={storeCode}
              text={t("joinBannerText")}
            />
          )}
          <section className="rounded-lg bg-white">
            {isLoading && (
              <div className="space-y-3 px-5 py-5">
                {[1, 2, 3].map((skeleton) => (
                  <div
                    className="flex items-center gap-4 rounded-xl bg-[#F7F8FA] px-4 py-3"
                    key={skeleton}
                  >
                    <div className="h-10 w-10 rounded-full bg-[#E3E6EA]" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-1/2 rounded bg-[#E3E6EA]" />
                      <div className="h-3 w-1/3 rounded bg-[#E3E6EA]" />
                    </div>
                    <div className="h-4 w-14 rounded bg-[#E3E6EA]" />
                  </div>
                ))}
              </div>
            )}

            {!isLoading && (
              <>
                {isEmpty ? (
                  <div className="px-6 py-8 text-center text-sm text-[#6B7280]">
                    {t("emptyState")}
                  </div>
                ) : (
                  <div className="divide-y divide-[#EEF0F2]">
                    {items.map((product, index) => (
                      <div
                        className="flex flex-col gap-4 px-5 py-2.5 lg:flex-row lg:items-center lg:gap-6"
                        key={`${String(product.id ?? "")}-${index}`}
                      >
                        <div className="flex items-center gap-4 lg:w-[50%]">
                          <div className="w-10 text-[14px] font-medium text-[#9CA3AF]">
                            {t("quantityPrefix", {
                              count: String(product.quantity),
                            })}
                          </div>
                          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#F7F8FA]">
                            {product.image?.thumbnail ? (
                              <Image
                                alt={product.name}
                                className="h-18 w-18 rounded-xl object-contain"
                                height={72}
                                src={product.image.thumbnail}
                                width={72}
                              />
                            ) : (
                              <div className="h-18 w-18 rounded-xl bg-[#E3E6EA]" />
                            )}
                          </div>
                          <div className="flex flex-1 flex-col gap-1">
                            <p
                              className={cn(
                                "text-[12px] font-semibold",
                                highlightTextClass
                              )}
                            >
                              {product.name}
                            </p>
                            {product.description && (
                              <p className="text-[12px] leading-relaxed text-[#6B7280]">
                                {product.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-1 items-center justify-between gap-4 lg:gap-8">
                          {product.size && (
                            <span className="inline-flex w-fit items-center rounded-full bg-[##AF97680D] px-3 py-1 text-[11px] text-[#4B5563]">
                              {product.size}
                            </span>
                          )}
                          {renderPrice(product)}
                          <button
                            className="inline-flex items-center gap-2 text-[14px] font-medium text-[#374957] transition hover:text-[#111827]"
                            type="button"
                          >
                            <Star
                              className="h-5 w-5 text-[#C2995B]"
                              strokeWidth={1.5}
                            />
                            {t("rateIt")}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </section>
        </div>

        <div className="flex flex-col gap-3">
          {hasAnyOrderMeta && (
            <section className="rounded-lg bg-white p-4 lg:p-5">
              <h3 className="text-lg font-semibold text-[#374957]">
                {t("orderTitle", { id: effectiveOrderId })}
              </h3>
              <div className="mt-2 space-y-2 text-sm text-[#4B5563]">
                {hasPaymentMethod && (
                  <div className="flex items-start justify-between gap-4">
                    <span className="font-medium">{t("paymentMethod")}</span>
                    <span className="text-right text-xs font-medium">
                      {paymentMethod}
                    </span>
                  </div>
                )}
                {hasAdditionalPaymentMethod && (
                  <div className="flex items-start justify-between gap-4">
                    <span className="font-medium">
                      {t("additionalPaymentMethod")}
                    </span>
                    <span className="text-right text-xs font-medium">
                      {additionalPaymentMethod}
                    </span>
                  </div>
                )}
                {hasDeliveryEstimate && (
                  <div className="flex items-start justify-between gap-4">
                    <span className="font-medium">{t("delivery")}</span>
                    <span className="text-right text-xs font-medium">
                      {deliveryEstimate}
                    </span>
                  </div>
                )}
              </div>
            </section>
          )}

          <section className="rounded-lg bg-white p-4 lg:p-5">
            <h3 className="text-lg font-semibold text-[#374957]">
              {t("breakdownTitle")}
            </h3>
            <div className="mt-2 space-y-2 text-sm font-medium text-[#4B5563]">
              <div className="flex items-center justify-between">
                <span>{t("subtotal")}</span>
                <LocalizedPrice price={formatAmount(subtotal)} />
              </div>
              <div className="flex items-center justify-between">
                {/* <span>{t("serviceFee")}</span> */}
                <span className="inline-flex items-center gap-1 text-sm font-medium text-[#4B5563]">
                  {t("serviceFee")}
                  {cart?.serviceFeeMessage && (
                    <Tooltip content={cart.serviceFeeMessage} position="right">
                      <svg
                        fill="none"
                        height="14"
                        viewBox="0 0 24 24"
                        width="14"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="9"
                          stroke="#9AA3AE"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M12 8.5v.5m0 2v4"
                          stroke="#9AA3AE"
                          strokeLinecap="round"
                          strokeWidth="1.5"
                        />
                      </svg>
                    </Tooltip>
                  )}
                  {!cart?.serviceFeeMessage && (
                    <svg
                      fill="none"
                      height="14"
                      viewBox="0 0 24 24"
                      width="14"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="#9AA3AE"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M12 8.5v.5m0 2v4"
                        stroke="#9AA3AE"
                        strokeLinecap="round"
                        strokeWidth="1.5"
                      />
                    </svg>
                  )}
                </span>
                <LocalizedPrice price={formatAmount(serviceFee)} />
              </div>
              <div className="flex items-center justify-between">
                <span>{t("shippingFee")}</span>
                <span className="text-[#00C7B1]">
                  {shippingFee === 0 ? (
                    t("shippingFree")
                  ) : (
                    <LocalizedPrice price={formatAmount(shippingFee)} />
                  )}
                </span>
              </div>
              {order?.discount && order.discount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-text-primary text-sm font-medium">
                    {t("discount")}
                  </span>
                  {renderDiscountPrice(order.discount)}
                </div>
              )}
              {mokafaaDiscount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-text-primary text-sm font-medium">
                    {t("rajhiMokafaa")}
                  </span>
                  {renderDiscountPrice(mokafaaDiscount)}
                </div>
              )}
              <div className="mt-2 flex items-center justify-between border-t border-[#EEF0F2] pt-3 text-sm font-semibold text-[#374957]">
                <div className="flex items-center gap-4">
                  {" "}
                  <span>{t("grandTotal")}</span>
                  {!isGlobal && (
                    <span className="text-[10px] font-normal text-[#BDC2C5]">
                      {t("includingTaxes")}
                    </span>
                  )}
                </div>
                <LocalizedPrice price={formatAmount(grandTotal)} />
              </div>
            </div>
          </section>

          {hasDeliveryAddress && (
            <section className="rounded-lg bg-white p-4 lg:p-5">
              <h3 className="text-lg font-semibold text-[#374957]">
                {t("deliveryAddress")}
              </h3>
              <div className="mt-2 space-y-2 text-sm font-medium text-[#4B5563]">
                {hasAddressLine && (
                  <>
                    {formattedAddressLines.map((line, i) => (
                      <p className="my-0 leading-6" key={i}>
                        {line}
                      </p>
                    ))}
                  </>
                )}
                {hasContactNumber && (
                  <p className="pt-2">
                    <span className="inline-block" dir="ltr">
                      {contactNumber}
                    </span>
                  </p>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderInformation;
