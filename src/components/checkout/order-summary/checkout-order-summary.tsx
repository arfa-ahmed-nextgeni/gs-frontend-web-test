"use client";

import { useEffect, useMemo, useRef } from "react";

import { useTranslations } from "next-intl";

import { CashbackDisplay } from "@/components/checkout/order-summary/cashback-display";
import { CheckoutProductCard } from "@/components/checkout/order-summary/checkout-product-card";
import { LocalizedPrice } from "@/components/shared/localized-price";
import { Tooltip } from "@/components/shared/tooltip";
import { CarouselContainer } from "@/components/ui/carousel/carousel-container";
import { CarouselItem } from "@/components/ui/carousel/carousel-item";
import { useCarousel } from "@/components/ui/carousel/index";
import { useCart } from "@/contexts/use-cart";
import { useStoreCode } from "@/hooks/i18n/use-store-code";
import { useIsMounted } from "@/hooks/use-is-mounted";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils/price";

interface CheckoutOrderSummaryProps {
  currencyCode: string;
  deductions: OrderSummaryDeductions;
  totalDue: number;
  totals: OrderSummaryTotals;
}

interface OrderSummaryDeductions {
  discount: number;
  mokafaa: number;
  totalSavings: number;
  wallet: number;
}

interface OrderSummaryTotals {
  baseShippingFee: number;
  grandTotal: number;
  serviceFee: number;
  shippingFee: number;
  subtotal: number;
}

export function CheckoutOrderSummary({
  currencyCode,
  deductions,
  totalDue,
  totals,
}: CheckoutOrderSummaryProps) {
  const t = useTranslations("CheckoutPage.orderSummary");
  const tDelivery = useTranslations("CheckoutPage.delivery");
  const { cart } = useCart();
  const { isGlobal } = useStoreCode();
  const isMounted = useIsMounted();

  // Calculate order summary data from cart
  const data = useMemo(() => {
    if (!cart) {
      return {
        giftCount: 0,
        itemCount: 0,
      };
    }

    const cartItems = cart.items.filter((item) => !item.isGwp) || [];
    const giftItems = cart.items.filter((item) => item.isGwp) || [];
    const giftCount = giftItems.reduce((sum, item) => sum + item.quantity, 0);
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return {
      giftCount,
      itemCount,
    };
  }, [cart]);

  const renderPrice = (
    amount: number,
    showMinus = false,
    valueClassName?: string,
    containerClassName?: string
  ) => {
    const formattedPrice = formatPrice({ amount, currencyCode });
    return (
      <LocalizedPrice
        containerProps={{
          className: cn("inline-flex items-center", containerClassName),
        }}
        price={showMinus ? `-${formattedPrice}` : formattedPrice}
        valueProps={valueClassName ? { className: valueClassName } : undefined}
      />
    );
  };

  const cartItems = cart?.items.filter((item) => !item.isGwp) || [];
  const giftItems = cart?.items.filter((item) => item.isGwp) || [];
  const giftCount = giftItems.reduce((sum, item) => sum + item.quantity, 0);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const displayItemCount = isMounted && cart ? itemCount : data?.itemCount || 0;
  const displayGiftCount = isMounted && cart ? giftCount : data?.giftCount || 0;
  const hasItems = isMounted
    ? cartItems.length > 0
    : (data?.itemCount || 0) > 0;

  function CarouselWheelHandler() {
    const { api, canScrollNext, canScrollPrev, scrollNext, scrollPrev } =
      useCarousel();
    const containerRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
      if (!api) return;

      // Find the carousel container element - use closest parent with data-slot
      const findCarouselContent = () => {
        // Try to find the carousel content element in the nearest parent
        let current = containerRef.current;
        while (current) {
          const carouselContent = current.querySelector(
            '[data-slot="carousel-content"]'
          ) as HTMLElement | null;
          if (carouselContent) return carouselContent;
          current = current.parentElement;
        }
        // Fallback to document query (less ideal but works)
        return document.querySelector(
          '[data-slot="carousel-content"]'
        ) as HTMLElement | null;
      };

      const carouselContent = findCarouselContent();
      if (!carouselContent) return;

      const handleWheel = (e: WheelEvent) => {
        // If horizontal scroll is detected, let it pass through
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
          return;
        }

        // Vertical scroll (trackpad) - convert to horizontal carousel scroll
        if (Math.abs(e.deltaY) > 5) {
          e.preventDefault();
          if (e.deltaY > 0 && canScrollNext) {
            scrollNext();
          } else if (e.deltaY < 0 && canScrollPrev) {
            scrollPrev();
          }
        }
      };

      carouselContent.addEventListener("wheel", handleWheel as EventListener, {
        passive: false,
      });

      return () => {
        carouselContent.removeEventListener(
          "wheel",
          handleWheel as EventListener
        );
      };
    }, [api, canScrollNext, canScrollPrev, scrollNext, scrollPrev]);

    // Create a hidden div to help find the carousel container
    return (
      <div
        className="hidden"
        ref={containerRef as React.RefObject<HTMLDivElement>}
      />
    );
  }

  return (
    <section className="shadow-xs rounded-2xl bg-white p-5">
      <h2 className="text-text-primary mb-4 hidden text-xl font-medium lg:mb-4 lg:block lg:text-[25px] lg:font-semibold">
        {t("title")}
      </h2>

      {(hasItems || data) && (
        <>
          <p className="text-text-tertiary mb-4 text-[15px] font-normal">
            {displayGiftCount > 0
              ? t("itemsInBag", {
                  count: displayItemCount.toString(),
                  gifts: displayGiftCount.toString(),
                })
              : t("itemsInBagNoGifts", {
                  count: displayItemCount.toString(),
                })}
          </p>

          {/* Products Display */}
          {hasItems && cartItems.length > 0 && (
            <div className="mb-3 border-b border-[#F3F3F3] pb-3">
              {cartItems.length === 1 ? (
                // Single product display
                <CheckoutProductCard item={cartItems[0]} />
              ) : (
                // Multiple products - slider with peek effect
                <div className="relative">
                  <CarouselContainer
                    carouselProps={{
                      opts: {
                        align: "start",
                        containScroll: "trimSnaps",
                        dragFree: true,
                        slidesToScroll: 1,
                        watchDrag: true,
                      },
                    }}
                    contentProps={{
                      className:
                        " cursor-grab active:cursor-grabbing select-none touch-pan-x",
                      containerProps: {
                        className: "touch-pan-x",
                      },
                    }}
                    nextButtonProps={{
                      className: "hidden",
                    }}
                    previousButtonProps={{
                      className: "hidden",
                    }}
                  >
                    <CarouselWheelHandler />
                    {cartItems.map((item) => (
                      <CarouselItem
                        className="min-w-0 flex-shrink-0 basis-[calc(100%-30%)] sm:basis-[70%]"
                        key={item.uidInCart || item.id}
                      >
                        <CheckoutProductCard item={item} />
                      </CarouselItem>
                    ))}
                  </CarouselContainer>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Totals */}
      <div className="mt-3 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-text-tertiary text-sm font-medium">
            {t("subtotal")}
          </span>
          <LocalizedPrice
            containerProps={{ className: "inline-flex items-center" }}
            price={formatPrice({ amount: totals.subtotal, currencyCode })}
            valueProps={{ className: "text-[#5D5D5D]" }}
          />
        </div>

        {totals.serviceFee > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-text-tertiary inline-flex items-center gap-1 text-sm font-medium">
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
            <LocalizedPrice
              containerProps={{ className: "inline-flex items-center" }}
              price={formatPrice({ amount: totals.serviceFee, currencyCode })}
              valueProps={{ className: "text-[#5D5D5D]" }}
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-text-tertiary text-sm font-medium">
            {t("shippingFee")}
          </span>
          <span className="inline-flex items-center gap-2">
            {totals.shippingFee > 0 ? (
              <LocalizedPrice
                containerProps={{ className: "inline-flex items-center" }}
                price={formatPrice({
                  amount: totals.shippingFee,
                  currencyCode,
                })}
                valueProps={{ className: "text-[#5D5D5D]" }}
              />
            ) : (
              <>
                <LocalizedPrice
                  containerProps={{ className: "inline-flex items-center" }}
                  price={formatPrice({
                    amount: totals.baseShippingFee || totals.shippingFee,
                    currencyCode,
                  })}
                  valueProps={{ className: "text-[#BDC2C5] line-through" }}
                />
                <span className="text-text-teal text-[15px] font-medium">
                  {tDelivery("free")}
                </span>
              </>
            )}
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between border-t border-[#F3F3F3] pt-2 font-semibold">
          <div className="flex flex-row items-center gap-3">
            <span className="text-text-primary text-sm font-semibold">
              {t("grandTotal")}
            </span>
            {!isGlobal && (
              <span className="text-text-tertiary text-[10px] font-normal">
                {t("includingTaxes")}
              </span>
            )}
          </div>
          <LocalizedPrice
            containerProps={{ className: "inline-flex items-center" }}
            price={formatPrice({ amount: totals.grandTotal, currencyCode })}
            valueProps={{ className: "text-xs font-normal" }}
          />
        </div>

        {/* Deductions */}
        {(deductions.discount > 0 ||
          deductions.mokafaa > 0 ||
          deductions.wallet > 0) && (
          <div className="space-y-2 pt-2">
            {deductions.discount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-text-primary text-sm font-medium">
                  {t("discount")}
                </span>
                {renderPrice(
                  deductions.discount,
                  true,
                  "text-sm font-medium text-text-teal",
                  "text-text-teal"
                )}
              </div>
            )}
            {deductions.mokafaa > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-text-primary text-sm font-medium">
                  {t("rajhiMokafaa")}
                </span>
                {renderPrice(
                  deductions.mokafaa,
                  true,
                  "text-sm font-medium text-text-teal"
                )}
              </div>
            )}
            {deductions.wallet > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-text-primary text-sm font-medium">
                  {t("walletBalance")}
                </span>
                {renderPrice(
                  deductions.wallet,
                  true,
                  "text-sm font-medium text-text-teal"
                )}
              </div>
            )}
          </div>
        )}

        {/* Savings message */}
        {deductions.totalSavings > 0 && (
          <div
            className="flex h-[32px] items-center justify-center rounded-[5px] bg-[#E6F7F5]"
            dir="ltr"
          >
            <span className="text-text-primary text-xs font-medium">
              {deductions.mokafaa > 0 ? t("youUsed") : t("youSaved")}{" "}
              <LocalizedPrice
                containerProps={{ className: "inline-flex items-center" }}
                price={formatPrice({
                  amount: deductions.totalSavings,
                  currencyCode,
                })}
              />{" "}
              {t("inThisOrder")}
            </span>
          </div>
        )}

        {deductions.mokafaa > 0 && (
          <div className="text-success flex items-center justify-between border-t border-[#F3F3F3] pt-2">
            <span className="text-text-primary text-sm font-semibold">
              {t("totalDue")}
            </span>
            <LocalizedPrice
              containerProps={{ className: "inline-flex items-center" }}
              price={formatPrice({ amount: totalDue, currencyCode })}
              valueProps={{ className: "text-sm font-semibold" }}
            />
          </div>
        )}

        {/* Cashback */}
        {deductions.wallet > 0 && (
          <CashbackDisplay
            currencyCode={currencyCode}
            grandTotal={totals.grandTotal}
          />
        )}
      </div>
    </section>
  );
}
