import { useMemo } from "react";

import Image from "next/image";

import { Star } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import ConfettiIcon from "@/assets/gifs/Confetti.gif";
import { ProductImageWithFallback } from "@/components/product/product-image-with-fallback";
import { ProductReviewWriteLink } from "@/components/product/product-reviews/product-review-write-link";
import { JoinBanner } from "@/components/shared/join-banner";
import { LocalizedPrice } from "@/components/shared/localized-price";
import { ProductDetailsLink } from "@/components/shared/product-details-link";
import { useStoreConfig } from "@/contexts/store-config-context";
import { useStoreCode } from "@/hooks/i18n/use-store-code";
import { useCustomerQuery } from "@/hooks/queries/use-customer-query";
import { ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils";
import { getProductDetailsHref } from "@/lib/utils/get-product-details-href";
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

const highlightTextClass = "text-[#374957]";
const mutedTextClass = "text-[#85878A]";
const rateItClassName =
  "inline-flex items-center gap-[5px] whitespace-nowrap text-[14px] font-medium tracking-[0.28px] text-[#374957] transition hover:text-[#111827]";

export function OrderInformation({ order, orderId }: OrderInformationProps) {
  const { storeConfig } = useStoreConfig();
  const locale = useLocale();
  const t = useTranslations("OrderConfirmation");
  const { isGlobal, storeCode } = useStoreCode();
  const { data: currentCustomer, isLoading: isCustomerLoading } =
    useCustomerQuery();

  const currencyCode = storeConfig?.currencyCode || "SAR";
  const isArabic = locale === "ar";
  const isLoading = false;

  const items: DisplayOrderItem[] = useMemo(
    () =>
      (order?.products as DisplayOrderItem[] | undefined)?.map((item) => {
        const originalPrice = item.originalPrice ?? item.regularPrice;
        const hasRealOriginalPrice =
          typeof originalPrice === "number" &&
          originalPrice > (item.price || 0);

        return {
          ...item,
          description: item.description,
          originalPrice: hasRealOriginalPrice ? originalPrice : undefined,
          size: item.size,
        };
      }) || [],
    [order?.products]
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (acc, item) => acc + (item.price || 0) * (item.quantity || 0),
        0
      ),
    [items]
  );

  const shippingFee = order?.shipping_fee ?? 0;

  const codFee = order?.cod_fee ?? 0;

  const grandTotal = order?.total ?? 0;
  const mokafaaDiscount = order?.mokafaaDiscount || 0;

  const formatAmount = (amount: number) =>
    formatPrice({
      amount,
      currencyCode,
      locale,
    });

  const effectiveOrderId = orderId || order?.tracking_number || "—";

  const getProductReviewHref = (sku: string) => {
    return ROUTES.CHECKOUT.ADD_PRODUCT_REVIEW(encodeURIComponent(sku));
  };

  const deliveryEstimate =
    order?.deliveryLabel || t("fallbackDeliveryEstimate");

  const contactNumber = order?.contactPhone;

  const addressLine = order?.deliveryAddressText;

  const formattedAddressLines = useMemo(() => {
    if (!addressLine) return [];

    const filterPart = (s: string) => s !== "N/A" && s !== "0000";

    let parts = addressLine
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter((s) => Boolean(s) && filterPart(s));

    if (parts.length === 1) {
      const commaParts = addressLine
        .split(",")
        .map((s) => s.trim())
        .filter((s) => Boolean(s) && filterPart(s));
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
      <div className="flex flex-col items-end justify-center gap-2.5 text-right">
        {item.isGwp ? (
          <span className="text-[16px] font-semibold text-[#FE5000]">
            {t("free")}
          </span>
        ) : (
          <LocalizedPrice
            containerProps={{
              className: "text-[16px] font-semibold text-[#FE5000]",
            }}
            price={price}
          />
        )}
        {original && (
          <LocalizedPrice
            containerProps={{
              className: "text-[12px] text-[#85878A]",
            }}
            price={original}
            valueProps={{
              className: "line-through",
            }}
          />
        )}
      </div>
    );
  };

  const renderRateAction = (product: DisplayOrderItem) => {
    const content = (
      <>
        <Star className="h-[15px] w-[15px] text-[#AF9768]" strokeWidth={1.5} />
        {t("rateIt")}
      </>
    );

    if (!product.sku) {
      return (
        <button
          className={cn(rateItClassName, "opacity-60")}
          disabled
          type="button"
        >
          {content}
        </button>
      );
    }

    return (
      <ProductReviewWriteLink
        href={getProductReviewHref(product.sku)}
        loadingLinkProps={{ className: rateItClassName }}
      >
        {content}
      </ProductReviewWriteLink>
    );
  };

  const isEmpty = !items.length;

  return (
    <div className="pb-10 pt-2 lg:px-5 lg:pb-16">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[797px_394px] lg:gap-2.5">
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
                    {items.map((product, index) => {
                      const productHref = getProductDetailsHref({
                        sku: product.sku,
                        urlKey: product.urlKey,
                      });
                      const productLinkHref = product.isGwp
                        ? ""
                        : productHref || "#";

                      return (
                        <div
                          className="flex flex-col gap-4 px-5 py-2.5 lg:h-[100px] lg:flex-row lg:items-center lg:justify-between"
                          key={`${String(product.id ?? "")}-${index}`}
                        >
                          <div className="flex items-center gap-[21px]">
                            <div className="text-[15px] font-normal tracking-[0.3px] text-[#85878A]">
                              {`x${product.quantity}`}
                            </div>
                            <ProductDetailsLink
                              className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl"
                              href={productLinkHref}
                              title={product.name}
                            >
                              <ProductImageWithFallback
                                alt={product.name}
                                className="h-full w-full object-contain"
                                height={80}
                                key={product.image?.thumbnail || "placeholder"}
                                src={product.image?.thumbnail || ""}
                                width={80}
                              />
                            </ProductDetailsLink>
                            <ProductDetailsLink
                              className="flex w-[260px] flex-col gap-2.5"
                              href={productLinkHref}
                              title={product.name}
                            >
                              <p
                                className={cn(
                                  "line-clamp-1 text-[12px] font-semibold tracking-[0.24px]",
                                  highlightTextClass
                                )}
                              >
                                {product.brand}
                              </p>
                              <p
                                className={cn(
                                  "line-clamp-2 text-[12px] font-normal tracking-[0.24px]",
                                  highlightTextClass
                                )}
                              >
                                {product.name}
                              </p>
                            </ProductDetailsLink>
                          </div>

                          <div className="flex flex-1 items-center justify-between">
                            <div className="flex w-20 justify-start">
                              {product.size && (
                                <span className="h-6.25 inline-flex w-fit items-center justify-center whitespace-nowrap rounded-lg bg-[#AF9768]/5 px-2.5 py-2 text-[11px] font-medium tracking-[0.22px] text-[#374957]">
                                  {product.size}
                                </span>
                              )}
                            </div>
                            <div className="flex w-20 justify-end">
                              {renderPrice(product)}
                            </div>
                            <div className="flex w-20 justify-start">
                              {renderRateAction(product)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
                <LocalizedPrice
                  currencySymbolProps={{
                    className: "text-[1.4em]",
                  }}
                  price={formatAmount(subtotal)}
                />
              </div>
              {(order?.pointsToSpend ?? 0) > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-text-danger">
                    {t("loyalityPoints")}
                  </span>
                  <span className="text-text-danger">
                    <LocalizedPrice
                      currencySymbolProps={{
                        className: "text-[1.4em]",
                      }}
                      price={`-${formatAmount(order?.pointsToSpend ?? 0)}`}
                    />
                  </span>
                </div>
              )}
              {order?.discount && order.discount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-text-danger">{t("discount")}</span>
                  <span className="text-text-danger">
                    <LocalizedPrice
                      currencySymbolProps={{
                        className: "text-[1.4em]",
                      }}
                      price={`-${formatAmount(order.discount)}`}
                    />
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span>{t("shippingFee")}</span>
                <span className="text-text-teal">
                  {shippingFee === 0 ? (
                    t("shippingFree")
                  ) : (
                    <LocalizedPrice
                      currencySymbolProps={{
                        className: "text-[1.4em]",
                      }}
                      price={formatAmount(shippingFee)}
                    />
                  )}
                </span>
              </div>
              {codFee > 0 && (
                <div className="flex items-center justify-between">
                  <span>{t("codFee")}</span>
                  <LocalizedPrice
                    currencySymbolProps={{
                      className: "text-[1.4em]",
                    }}
                    price={formatAmount(codFee)}
                  />
                </div>
              )}
              {mokafaaDiscount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-text-primary text-sm font-medium">
                    {t("rajhiMokafaa")}
                  </span>
                  <LocalizedPrice
                    currencySymbolProps={{
                      className: "text-[1.4em]",
                    }}
                    price={formatAmount(mokafaaDiscount)}
                  />
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
              {(storeConfig?.cashbackPercent ?? 0) > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-text-primary text-sm font-medium">
                    {t("cashback")}
                  </span>
                  <LocalizedPrice
                    containerProps={{
                      className: "text-text-teal",
                    }}
                    currencySymbolProps={{
                      className: "text-[1.4em]",
                    }}
                    price={formatAmount(
                      Math.round(
                        grandTotal * (storeConfig?.cashbackPercent ?? 0)
                      )
                    )}
                  />
                </div>
              )}
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
