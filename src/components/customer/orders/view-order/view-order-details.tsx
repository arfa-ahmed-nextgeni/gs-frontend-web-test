"use client";

import React, { useRef, useState, useTransition } from "react";

import Image from "next/image";

import { useLocale, useTranslations } from "next-intl";

import CancelIcon from "@/assets/icons/cancel.svg";
import Download from "@/assets/icons/download.svg";
import LocateIcon from "@/assets/icons/locate.svg";
import ReorderIcon from "@/assets/icons/re-order.svg";
import { productPlaceholder } from "@/assets/placeholders";
import { useToastContext } from "@/components/providers/toast-provider";
import { LocalizedPrice } from "@/components/shared/localized-price";
import { useOrdersContext } from "@/contexts/orders-context";
import { useViewOrderContext } from "@/contexts/view-order-context";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useReorderCartActions } from "@/hooks/use-reorder-cart-actions";
import { useRouter } from "@/i18n/navigation";
import {
  trackCancelOrder,
  trackQuickAction,
  trackTrackOrder,
} from "@/lib/analytics/events";
import { buildTrackOrderPropertiesFromOrder } from "@/lib/analytics/utils/build-properties";
import { QueryParamsKey } from "@/lib/constants/query-params";
import { formatPrice } from "@/lib/utils/price";

import type { Locale } from "@/lib/constants/i18n";

// import EditIcon from "@/assets/icons/edit-icon.svg";
// import ReturnItemIcon from "@/assets/icons/Return.svg";
// import StarIcon from "@/assets/icons/star-icon.svg";
// import { StrikethroughText } from "@/components/shared/strikethrough-text";

export const ViewOrderDetails = () => {
  const t = useTranslations("CustomerViewOrderPage");
  const { isLoading, orderData } = useViewOrderContext();
  const { cancelOrder, reorderOrder } = useOrdersContext();
  const { showError, showSuccess } = useToastContext();
  const isMobile = useIsMobile();
  const locale = useLocale() as Locale;
  const router = useRouter();
  const { handleSuccessfulReorder } = useReorderCartActions();
  const [isDownloadInvoicePending, startDownloadInvoiceTransition] =
    useTransition();
  const [isTrackOrderPending, startTrackOrderTransition] = useTransition();
  const [isReorderPending, startReorderTransition] = useTransition();
  const [isCancelPending, startCancelTransition] = useTransition();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  if (!orderData) {
    return null;
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleCancelOrder = async () => {
    if (!orderData?.id) return;

    const toastPosition = isMobile ? "top" : "bottom";

    // Track quick_action when any action is clicked from order detail screen
    trackQuickAction("cancel");

    // Track cancel_order when cancel button clicked from popup of cancel permission in order detail screen
    trackCancelOrder(orderData.id);

    try {
      const result = await cancelOrder(orderData.id);
      if (result.success) {
        showSuccess(
          "Order Cancelled",
          "Your order has been successfully cancelled.",
          toastPosition
        );
      } else {
        showError(
          "Cancellation Failed",
          result.message || "Failed to cancel order. Please try again.",
          toastPosition
        );
      }
    } catch {
      showError(
        "Cancellation Failed",
        "An unexpected error occurred. Please try again.",
        toastPosition
      );
    }
  };

  const handleReorderOrder = async () => {
    if (!orderData?.increment_id) return;

    // Track quick_action when any action is clicked from order detail screen
    trackQuickAction("reorder");

    const toastPosition = isMobile ? "top" : "bottom";

    try {
      const result = await reorderOrder(orderData.increment_id, false);
      if (result.success) {
        await handleSuccessfulReorder();

        showSuccess(
          "Order Added to Cart",
          result.message ||
            "Items from this order have been added to your cart.",
          toastPosition
        );
      } else {
        showError(
          "Reorder Failed",
          result.message || "Failed to add items to cart. Please try again.",
          toastPosition
        );
      }
    } catch {
      showError(
        "Reorder Failed",
        "An unexpected error occurred. Please try again.",
        toastPosition
      );
    }
  };

  const handleTrackOrder = () => {
    if (!orderData) return;

    // Track track-order event when track order button is clicked
    const trackOrderProperties = buildTrackOrderPropertiesFromOrder(orderData);
    trackTrackOrder(trackOrderProperties);

    // Track quick_action when any action is clicked from order detail screen
    trackQuickAction("track");

    const trackingNumber = orderData.increment_id;
    const orderNumber = orderData.id;

    if (trackingNumber && orderNumber) {
      router.push(
        `/track-order?orderNumber=${encodeURIComponent(orderNumber)}&trackingNumber=${encodeURIComponent(trackingNumber)}`
      );
    } else if (orderNumber) {
      router.push(
        `/track-order?orderNumber=${encodeURIComponent(orderNumber)}`
      );
    } else {
      router.push("/track-order");
    }
  };

  const handleDownloadInvoice = async () => {
    if (!orderData?.id) return;

    // Track quick_action when any action is clicked from order detail screen
    trackQuickAction("download_invoice");

    try {
      const response = await fetch(
        `/api/customer/orders/invoice-url?orderId=${orderData.id}&${QueryParamsKey.Locale}=${locale}`
      );
      const data = await response.json();
      if (data && data.pdf_url) {
        window.open(data.pdf_url, "_blank");
      } else {
        console.error("PDF URL not found in response:", data.message);
      }
    } catch (error) {
      console.error("Error downloading invoice:", error);
    }
  };

  const canCancelOrder = () => {
    if (orderData.user_actions && orderData.user_actions.length > 0) {
      return orderData.user_actions.some(
        (action) => action?.action?.toLowerCase() === "cancel_immediate"
      );
    }
    return false;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          <p className="text-gray-600">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            {t("orderNotFound")}
          </h2>
          <p className="text-gray-600">{t("orderNotFoundDescription")}</p>
        </div>
      </div>
    );
  }

  const getStatusConfig = (statusName: string) => {
    const configs = {
      Canceled: {
        bgColor: "#FE5000",
        textColor: "#FFFFFF",
      },
      Complete: {
        bgColor: "#76D671",
        textColor: "#FFFFFF",
      },
      Delivered: {
        bgColor: "#76D671",
        textColor: "#FFFFFF",
      },
      Processed: {
        bgColor: "#FFA500",
        textColor: "#FFFFFF",
      },
      Processing: {
        bgColor: "#FFA500",
        textColor: "#FFFFFF",
      },
      Returned: {
        bgColor: "#EF4444",
        textColor: "#FFFFFF",
      },
      Shipped: {
        bgColor: "#2568F2",
        textColor: "#FFFFFF",
      },
    };

    return (
      configs[statusName as keyof typeof configs] || {
        bgColor: "#FFA500",
        textColor: "#FFFFFF",
      }
    );
  };

  // const getProgressSteps = (status: string) => {
  //   const steps = [
  //     { completed: false, name: t("status.confirmed") },
  //     { completed: false, name: t("status.processed") },
  //     { completed: false, name: t("status.shipped") },
  //     { completed: false, name: t("status.delivered") },
  //   ];

  //   switch (status) {
  //     case "Delivered":
  //       steps[0].completed = true;
  //       steps[1].completed = true;
  //       steps[2].completed = true;
  //       steps[3].completed = true;
  //       break;
  //     case "Processed":
  //       steps[0].completed = true;
  //       steps[1].completed = true;
  //       break;
  //     case "Returned":
  //       steps[0].completed = true;
  //       steps[1].completed = true;
  //       steps[2].completed = true;
  //       break;
  //     case "Shipped":
  //       steps[0].completed = true;
  //       steps[1].completed = true;
  //       steps[2].completed = true;
  //       break;
  //   }

  //   return steps;
  // };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const config = getStatusConfig(orderData.status || "Processed");
  // const progressSteps = getProgressSteps(orderData.status || "Processed");

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="mt-0 bg-white p-5 lg:mt-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-text-primary text-[15px] font-semibold">
            {t("orderNumber")} #
            {orderData.number || orderData.increment_id || orderData.id}
          </h2>
        </div>

        <div className="mb-5 text-xs text-[#5D5D5D]">
          <div className="flex items-center justify-between">
            <p>
              {t("orderPlacedOn")} {formatDate(orderData.order_date)}
            </p>
            <div
              className="h-[25px] rounded-[10px] px-2.5 py-1 text-[11px] font-medium text-white"
              style={{
                backgroundColor: config.bgColor,
                color: config.textColor,
              }}
            >
              {orderData.status || t("status.processed")}
            </div>
          </div>
          {/* <p>{t("shippedOn")} {formatDate(orderData.order_date)}</p> */}
        </div>

        {/* <div className="flex items-center justify-between">
          {progressSteps.map((step, index) => (
            <div className="flex flex-col" key={`step-${index}`}>
              <div className="flex flex-row items-center">
                <div
                  className={`mr-2 flex h-3 w-3 items-center justify-center rounded-full text-xs font-medium rtl:ml-2 ${
                    step.completed
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step.completed ? (
                    <span className="text-[6px]">✓</span>
                  ) : (
                    <span className="text-[6px] text-white">✓</span>
                  )}
                </div>
                <span
                  className={`mt-1 text-xs ${step.completed ? "text-gray-900" : "text-gray-400"}`}
                >
                  {step.name}
                </span>
              </div>
              <div className="w-22.5 mt-2 h-1.5 rounded-full bg-gray-200">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    step.completed ? "bg-green-500" : "bg-gray-200"
                  }`}
                  style={{ width: step.completed ? "100%" : "0%" }}
                />
              </div>
            </div>
          ))}
        </div> */}
      </div>

      <div className="px-5 pb-5">
        <div className="mb-4 bg-white"></div>

        <div className="mb-4">
          <h3 className="text-text-secondary mb-2.5 text-sm font-semibold">
            {t("orderedProducts")} ({orderData.items?.length || 0} {t("items")})
          </h3>
          <div className="relative w-full">
            <div
              className={`flex gap-3 overflow-x-auto overflow-y-hidden rounded-[10px] ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              ref={scrollContainerRef}
              style={{
                maxWidth: "100%",
                msOverflowStyle: "none",
                scrollbarWidth: "none",
                scrollBehavior: isDragging ? "auto" : "smooth",
                width: "100%",
              }}
            >
              {orderData.items?.map((item: any, index: number) => (
                <div
                  className="w-[265px] min-w-[265px] flex-shrink-0 rounded-[10px] bg-white"
                  key={`${item.id}-${index}`}
                >
                  <div className="flex items-center gap-1 px-2">
                    <div className="my-2.5 h-20 w-20 items-center justify-center overflow-hidden rounded-[10px] bg-gray-100">
                      <Image
                        alt={item.product_name || "Product image"}
                        className="h-full w-full object-cover"
                        height={80}
                        src={
                          item.product?.image?.url &&
                          item.product.image.url.trim() !== ""
                            ? item.product.image.url
                            : productPlaceholder
                        }
                        width={80}
                      />
                    </div>

                    <div className="flex-1">
                      <div>
                        <h4 className="text-text-primary line-clamp-1 text-xs font-semibold">
                          {item.product_name ||
                            item.product?.short_name ||
                            "Product"}
                        </h4>
                        <p className="text-text-primary line-clamp-2 text-xs">
                          SKU: {item.product_sku}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-base">
                          {item.product_sale_price && (
                            <span className="font-semibold text-[#5D5D5D]">
                              <LocalizedPrice
                                price={formatPrice({
                                  amount: item.product_sale_price.value || 0,
                                  currencyCode:
                                    item.product_sale_price.currency || "SAR",
                                })}
                              />
                            </span>
                          )}
                        </div>
                        <span className="single-line text-xs text-gray-600">
                          {t("quantity")}: {item.quantity_ordered}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-text-secondary font-gilroy mb-2.5 text-sm font-medium">
            {t("paymentSummary")}
          </h3>
          <div className="rounded-[10px] bg-white p-4 text-sm">
            <div className="mb-2 flex justify-between">
              <span className="text-text-primary text-sm">{t("subtotal")}</span>
              <span className="text-[#5D5D5D]">
                <LocalizedPrice
                  price={formatPrice({
                    amount: orderData.total?.subtotal?.value || 0,
                    currencyCode: orderData.total?.subtotal?.currency || "SAR",
                  })}
                />
              </span>
            </div>
            {orderData.total?.discounts &&
              orderData.total.discounts.length > 0 && (
                <div className="mb-2 flex justify-between">
                  <span className="text-[#FE5000]">{t("discount")}</span>
                  <span className="text-[#FE5000]">
                    <LocalizedPrice
                      price={formatPrice({
                        amount: orderData.total.discounts.reduce(
                          (sum, discount) =>
                            sum + (discount.amount?.value || 0),
                          0
                        ),
                        currencyCode:
                          orderData.total.discounts[0]?.amount?.currency ||
                          "SAR",
                      })}
                    />
                  </span>
                </div>
              )}
            <div className="mb-4 flex justify-between">
              <span className="text-text-primary text-sm">
                {t("shippingFee")}
              </span>
              <span className="text-text-secondary text-xs">
                {orderData.total?.shipping_handling?.total_amount?.value ===
                0 ? (
                  t("free")
                ) : (
                  <LocalizedPrice
                    price={formatPrice({
                      amount:
                        orderData.total?.shipping_handling?.total_amount
                          ?.value || 0,
                      currencyCode:
                        orderData.total?.shipping_handling?.total_amount
                          ?.currency || "SAR",
                    })}
                  />
                )}
              </span>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="text-text-primary">{t("grandTotal")}</span>
              <span className="text-[#5D5D5D]">
                <LocalizedPrice
                  price={formatPrice({
                    amount: orderData.total?.grand_total?.value || 0,
                    currencyCode:
                      orderData.total?.grand_total?.currency || "SAR",
                  })}
                />
              </span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-text-secondary font-gilroy mb-2 text-sm font-medium">
            {t("paymentMethods")}
          </h3>
          <div className="space-y-2 rounded-[10px] bg-white p-4 text-sm">
            {orderData.payment_methods?.map((method: any, index: number) => (
              <div className="flex justify-between" key={`payment-${index}`}>
                <span className="text-text-primary text-sm">
                  {method.name || method.type}
                </span>
                <span className="text-[#5D5D5D]">
                  <LocalizedPrice
                    price={formatPrice({
                      amount: orderData.total?.grand_total?.value || 0,
                      currencyCode:
                        orderData.total?.grand_total?.currency || "SAR",
                    })}
                  />
                </span>
              </div>
            )) || (
              <div className="flex justify-between">
                <span className="text-text-primary text-sm">
                  Payment Method
                </span>
                <span className="text-[#5D5D5D]">
                  <LocalizedPrice
                    price={formatPrice({
                      amount: orderData.total?.grand_total?.value || 0,
                      currencyCode:
                        orderData.total?.grand_total?.currency || "SAR",
                    })}
                  />
                </span>
              </div>
            )}
            {orderData.total?.mokafaa_discount &&
              orderData.total.mokafaa_discount.value > 0 && (
                <div className="flex justify-between">
                  <span className="text-text-primary text-sm">
                    {t("rajhiMokafaa")}
                  </span>
                  <span className="text-text-tertiary text-xs">
                    <LocalizedPrice
                      price={formatPrice({
                        amount: orderData.total.mokafaa_discount.value,
                        currencyCode: orderData.total.mokafaa_discount.currency,
                      })}
                    />
                  </span>
                </div>
              )}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-text-secondary font-gilroy mb-2.5 text-sm font-medium">
            {t("deliveryInfo")}
          </h3>
          <div className="space-y-2 rounded-[10px] bg-white p-4 text-sm text-gray-600">
            <div className="flex items-center gap-11">
              <span className="text-text-secondary text-xs">{t("name")}</span>
              <p className="text-text-primary text-sm font-medium">
                {orderData.shipping_address
                  ? `${orderData.shipping_address.firstname} ${orderData.shipping_address.lastname}`
                  : orderData.billing_address
                    ? `${orderData.billing_address.firstname} ${orderData.billing_address.lastname}`
                    : "Name not available"}
              </p>
            </div>
            <div className="flex items-center gap-8">
              <span className="text-text-secondary text-xs">
                {t("address")}
              </span>
              <p className="text-text-primary text-sm font-medium">
                {orderData.shipping_address
                  ? `${orderData.shipping_address.city}, ${orderData.shipping_address.street?.join(", ")}`
                  : orderData.billing_address
                    ? `${orderData.billing_address.city}, ${orderData.billing_address.street?.join(", ")}`
                    : "Address not available"}
              </p>
            </div>
            <div className="flex items-center gap-10">
              <span className="text-text-secondary text-xs">{t("mobile")}</span>
              <p className="text-text-primary text-sm font-medium" dir="ltr">
                {orderData.shipping_address?.telephone ||
                  orderData.billing_address?.telephone ||
                  "Phone not available"}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-text-secondary font-gilroy mb-2 text-sm font-medium">
            {t("whatWouldYouLikeToDo")}
          </h3>
          <div className="flex flex-wrap gap-3 rounded-[10px] bg-white p-4 pb-6">
            <div className="flex flex-row flex-wrap gap-2">
              {orderData.id && (
                <button
                  className="flex items-center space-x-1.5 rounded-[10px] py-1 text-left transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isDownloadInvoicePending}
                  onClick={() =>
                    startDownloadInvoiceTransition(async () => {
                      await handleDownloadInvoice();
                    })
                  }
                  type="button"
                >
                  <Image alt="download" height={15} src={Download} width={15} />
                  <span className="text-sm text-gray-700">
                    {t("downloadInvoice")}
                  </span>
                  {isDownloadInvoicePending && (
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" />
                  )}
                </button>
              )}
              <button
                className="flex items-center space-x-1.5 rounded-[10px] py-1 text-left transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isTrackOrderPending}
                onClick={() =>
                  startTrackOrderTransition(() => {
                    handleTrackOrder();
                  })
                }
                type="button"
              >
                <Image alt="track" height={15} src={LocateIcon} width={15} />
                <span className="text-sm text-gray-700">{t("trackOrder")}</span>
                {isTrackOrderPending && (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" />
                )}
              </button>
            </div>

            <div className="flex flex-row gap-2">
              {/* <button className="flex items-center space-x-1.5 rounded-[10px] text-left transition-colors hover:bg-gray-100">
                <Image
                  alt="return"
                  height={15}
                  src={ReturnItemIcon}
                  width={15}
                />
                <span className="text-sm text-gray-700">
                  {t("returnProduct")}
                </span>
              </button> */}
              {orderData.user_actions?.some(
                (action) => action?.action?.toLowerCase() === "reorder"
              ) && (
                <button
                  className="flex items-center space-x-1.5 rounded-[10px] text-left transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isReorderPending}
                  onClick={() =>
                    startReorderTransition(async () => {
                      await handleReorderOrder();
                    })
                  }
                  type="button"
                >
                  <Image
                    alt="reorder"
                    height={15}
                    src={ReorderIcon}
                    width={15}
                  />
                  <span className="text-sm text-gray-700">{t("reorder")}</span>
                  {isReorderPending && (
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" />
                  )}
                </button>
              )}
              {/* <button className="flex items-center space-x-1.5 rounded-[10px] text-left transition-colors hover:bg-gray-100">
                <Image alt="edit" height={15} src={EditIcon} width={15} />
                <span className="text-sm text-gray-700">{t("edit")}</span>
              </button> */}
              {canCancelOrder() && (
                <button
                  className="flex items-center space-x-1.5 rounded-[10px] text-left transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isCancelPending}
                  onClick={() =>
                    startCancelTransition(async () => {
                      await handleCancelOrder();
                    })
                  }
                  type="button"
                >
                  <Image alt="cancel" height={15} src={CancelIcon} width={15} />
                  <span className="text-sm text-gray-700">
                    {t("cancelOrder")}
                  </span>
                  {isCancelPending && (
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" />
                  )}
                </button>
              )}
            </div>

            {/* <div className="flex flex-row gap-2">
              <button className="flex items-center space-x-1.5 rounded-[10px] py-1 text-left transition-colors hover:bg-gray-100">
                <Image alt="rate" height={15} src={StarIcon} width={15} />
                <span className="text-sm text-gray-700">{t("rateOrder")}</span>
              </button>
              <button className="flex items-center space-x-1.5 rounded-[10px] py-1 text-left transition-colors hover:bg-gray-100">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
                <span className="text-sm text-gray-700">
                  {t("whereIsMyOrder")}
                </span>
              </button>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};
