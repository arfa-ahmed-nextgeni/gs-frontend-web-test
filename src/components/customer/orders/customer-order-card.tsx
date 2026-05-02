"use client";

import { useTransition } from "react";

import Image from "next/image";

import { useLocale, useTranslations } from "next-intl";

import ArrowRightIcon from "@/assets/icons/arrow-right.svg";
import CancelIcon from "@/assets/icons/cancel.svg";
import Download from "@/assets/icons/download.svg";
import TrackIcon from "@/assets/icons/locate.svg";
import ReorderIcon from "@/assets/icons/re-order.svg";
import { ProductImageWithFallback } from "@/components/product/product-image-with-fallback";
import { useToastContext } from "@/components/providers/toast-provider";
import { LocalizedPrice } from "@/components/shared/localized-price";
import { useOrdersContext } from "@/contexts/orders-context";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useReorderCartActions } from "@/hooks/use-reorder-cart-actions";
import { Link, useRouter } from "@/i18n/navigation";
import { trackCancelOrder, trackQuickAction } from "@/lib/analytics/events";
import { Order } from "@/lib/models/customer-orders";
import { formatPrice } from "@/lib/utils/price";

interface OrderCardProps {
  onCancel?: () => void;
  onEdit?: () => void;
  onInvoice?: () => void;
  onReorder?: () => void;
  onTrackOrder?: () => void;
  order: Order;
}

export const CustomerOrderCard = ({
  onCancel, // eslint-disable-line @typescript-eslint/no-unused-vars
  // onEdit: _onEdit,
  // onInvoice: _onInvoice,
  onReorder, // eslint-disable-line @typescript-eslint/no-unused-vars
  // onTrackOrder: _onTrackOrder,
  order,
}: OrderCardProps) => {
  const t = useTranslations("CustomerOrdersPage");
  const locale = useLocale();
  const { cancelOrder, reorderOrder } = useOrdersContext();
  const { showError, showSuccess } = useToastContext();
  const isMobile = useIsMobile();
  const router = useRouter();
  const { handleSuccessfulReorder } = useReorderCartActions();
  const [isReorderPending, startReorderTransition] = useTransition();
  const [isTrackPending, startTrackTransition] = useTransition();
  const [isCancelPending, startCancelTransition] = useTransition();
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (locale.includes("ar")) {
      const day = date.getDate();
      const month = date.toLocaleDateString("ar-SA-u-ca-gregory", {
        month: "long",
      });
      const year = date.getFullYear();
      const hour = date.getHours();
      const minute = date.getMinutes().toString().padStart(2, "0");
      const period = hour >= 12 ? "مساءً" : "صباحاً";
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;

      return `${day} ${month} ${year}, الساعة ${displayHour}:${minute} ${period}`;
    }
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      hour: "numeric",
      hour12: true,
      minute: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

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

  const config = getStatusConfig(order.status);

  const getAvailableActions = () => {
    if (order.user_actions && order.user_actions.length > 0) {
      return order.user_actions.map(
        (action) => action?.action?.toLowerCase() || ""
      );
    }

    // Fallback to status-based logic if user_actions is not available
    switch (order.status.toLowerCase()) {
      case "completed":
      case "delivered":
      case "delivery_in_progress":
        return ["track"];
      default:
        return [""];
    }
  };

  const handleTrackOrder = () => {
    // Track quick_action when any action is clicked from order detail screen
    trackQuickAction("track");

    const trackingNumber = order.increment_id;
    const orderNumber = order.id;

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

  const availableActions = getAvailableActions();

  // Invoice URL generation for download anchor
  const rawInvoice = order.order_invoice_url || "";
  const invoiceIsAbsolute = /^https?:\/\//i.test(rawInvoice);
  const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "";
  const invoiceFilename = `invoice-${order.number || order.increment_id || order.id || "order"}.pdf`;
  const invoiceUrlBase = rawInvoice
    ? invoiceIsAbsolute
      ? rawInvoice
      : `${backendBaseUrl.replace(/\/$/, "")}/${rawInvoice.replace(/^\//, "")}`
    : "";
  const invoiceUrl = invoiceUrlBase
    ? invoiceUrlBase.endsWith(".pdf")
      ? invoiceUrlBase
      : `${invoiceUrlBase}.pdf`
    : "";
  const canShowInvoice =
    !!rawInvoice.trim() && availableActions.includes("invoice");

  const handleCancelOrder = async () => {
    const toastPosition = isMobile ? "top" : "bottom";

    // Track cancel_order when cancel button clicked from popup of cancel permission in order detail screen
    trackCancelOrder(order.increment_id || order.id || "");
    // Track quick_action when any action is clicked from order detail screen
    trackQuickAction("cancel");

    try {
      const result = await cancelOrder(order.increment_id || order.id || "");
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
    const toastPosition = isMobile ? "top" : "bottom";

    // Track quick_action when any action is clicked from order detail screen
    trackQuickAction("reorder");

    try {
      const result = await reorderOrder(
        order.increment_id || order.id || "",
        false
      );
      if (result.success) {
        // Refresh cart and open cart drawer
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

  return (
    <div className="bg-bg-default border-border-base w-full max-w-[394px] rounded-xl border lg:mx-0">
      <Link
        href={`/customer/orders/view/${order.id}`}
        title={`View order #${order.id}`}
      >
        <div className="flex h-[114px] cursor-pointer items-start justify-between p-3 transition-colors hover:bg-gray-50 lg:cursor-pointer lg:p-5">
          <div className="flex flex-col space-y-2 lg:space-y-3.5">
            <p className="text-text-secondary text-xs lg:text-xs">
              {t("orderCard.orderDate")}
            </p>
            <p className="text-text-primary text-[15px] font-semibold">
              {formatDate(order.order_date)}
            </p>
            <p className="text-text-primary text-sm font-normal">
              {t("orderCard.orderNumber")}
              {order.number}
            </p>
          </div>

          <div className="flex flex-col items-end space-y-2 lg:space-y-3.5">
            <p className="text-text-secondary text-xs">
              {t("orderCard.total")}
            </p>
            <p className="text-text-primary text-[15px] font-semibold">
              <LocalizedPrice
                price={formatPrice({
                  amount: order.total.grand_total.value,
                  currencyCode: order.total.grand_total.currency,
                })}
              />
            </p>
            <div className="flex items-center gap-1">
              {order.items.some(
                (item) =>
                  item.product?.image?.url &&
                  item.product.image.url.trim() !== "" &&
                  !item.product?.image?.url.includes("Placeholder.jpg")
              ) && (
                <div className="flex items-center">
                  {order.items.slice(0, 3).map((item, index) => {
                    if (
                      !item.product?.image?.url &&
                      item.product?.image?.url.includes("Placeholder.jpg")
                    ) {
                      return null;
                    }
                    return (
                      <div
                        className="relative"
                        key={`${item.product_sku}-${index}`}
                      >
                        <ProductImageWithFallback
                          alt={item.product_name || "Product image"}
                          className="rounded-5xl size-5 object-cover shadow-2xl"
                          height={20}
                          src={item.product?.image?.url || ""}
                          width={20}
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              <Image
                alt="View details"
                className="text-text-secondary rtl:rotate-180"
                height={20}
                src={ArrowRightIcon}
                width={20}
              />
            </div>
          </div>
        </div>
      </Link>

      <div className="border-border-base flex items-center justify-between border-t px-3 py-2 lg:px-3 lg:py-2">
        <div
          className="h-[25px] rounded-xl px-2 py-1 text-[10px] font-medium text-white lg:px-4 lg:text-[11px]"
          style={{ backgroundColor: config.bgColor, color: config.textColor }}
        >
          {order.status || "Processed"}
        </div>

        <div className="flex items-center gap-1 lg:gap-3">
          {canShowInvoice && (
            <a
              className="flex items-center gap-1 py-1 text-[10px] lg:py-1 lg:text-xs"
              download={invoiceFilename}
              href={invoiceUrl}
              rel="noopener noreferrer"
            >
              <Image
                alt="download icon"
                height={15}
                src={Download}
                unoptimized
                width={15}
              />
              {t("orderCard.actions.invoice")}
            </a>
          )}

          {availableActions.includes("reorder") && (
            <button
              className="flex items-center gap-1 py-1 text-[10px] disabled:cursor-not-allowed disabled:opacity-60 lg:py-1.5 lg:text-xs"
              disabled={isReorderPending}
              onClick={() =>
                startReorderTransition(async () => {
                  await handleReorderOrder();
                })
              }
              type="button"
            >
              <Image
                alt="reorder icon"
                height={15}
                src={ReorderIcon}
                unoptimized
                width={15}
              />
              {t("orderCard.actions.repeatOrder")}
              {isReorderPending && (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" />
              )}
            </button>
          )}

          {availableActions.includes("track") && (
            <button
              className="flex items-center gap-1 py-1 text-[10px] disabled:cursor-not-allowed disabled:opacity-60 lg:py-1.5 lg:text-xs"
              disabled={isTrackPending}
              onClick={() =>
                startTrackTransition(() => {
                  handleTrackOrder();
                })
              }
              type="button"
            >
              <Image
                alt="track icon"
                height={15}
                src={TrackIcon}
                unoptimized
                width={15}
              />
              {t("orderCard.actions.track")}
              {isTrackPending && (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" />
              )}
            </button>
          )}
          {/* 
          {availableActions.includes("edit") && (
            <button
              className="flex items-center gap-1 py-1 text-[10px] lg:text-xs lg:py-1.5"
              onClick={() => onEdit?.()}
            >
              <Image
                alt="edit icon"
                height={15}
                src={EditIcon}
                unoptimized
                width={15}
              />
              {t("orderCard.actions.edit")}
            </button>
          )} */}

          {availableActions.includes("cancel_immediate") && (
            <button
              className="flex items-center gap-1 py-1 text-[10px] text-red-600 disabled:cursor-not-allowed disabled:opacity-60 lg:py-1.5 lg:text-xs"
              disabled={isCancelPending}
              onClick={() =>
                startCancelTransition(async () => {
                  await handleCancelOrder();
                })
              }
              type="button"
            >
              <Image
                alt="cancel icon"
                height={15}
                src={CancelIcon}
                unoptimized
                width={15}
              />
              {t("orderCard.actions.cancel" as any)}
              {isCancelPending && (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-300 border-t-red-600" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
