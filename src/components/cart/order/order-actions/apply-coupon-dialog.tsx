"use client";

import { useState } from "react";

import Image from "next/image";

import { useTranslations } from "next-intl";

import CloseIcon from "@/assets/icons/close-icon.svg";
import PlusIcon from "@/assets/icons/plus-icon.svg";
import { CartPromocodeViewExpandTracker } from "@/components/analytics/cart-promocode-view-expand-tracker";
import { CheckoutPromocodeViewExpandTracker } from "@/components/analytics/checkout-promocode-view-expand-tracker";
import { ApplyCouponToCartForm } from "@/components/cart/order/order-actions/apply-coupon-to-cart-form";
import {
  CouponRow,
  RotatingIcon,
} from "@/components/cart/order/order-summary/order-summary-helpers";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useRemoveCouponFromCart } from "@/hooks/mutations/cart/use-remove-coupon-from-cart";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { cn } from "@/lib/utils";

type ApplyCouponDialogProps = {
  appliedCoupon?: string;
  applyCouponDisabled: boolean;
};

export const ApplyCouponDialog = ({
  appliedCoupon,
  applyCouponDisabled = false,
}: ApplyCouponDialogProps) => {
  const t = useTranslations("CartPage.orderSummary.applyCoupon");
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const { isPending, mutate: removeCoupon } = useRemoveCouponFromCart();

  const closeDialog = () => setOpen(false);

  // --- Disabled (coupon active) ---
  if (applyCouponDisabled) {
    return (
      <CouponRow
        disabled
        label={t("title")}
        labelClasses="text-text-muted cursor-not-allowed"
        right={<></>}
      />
    );
  }

  // --- Mobile Version ---
  if (isMobile) {
    return (
      <>
        <CartPromocodeViewExpandTracker isDialogOpen={open} />
        <CheckoutPromocodeViewExpandTracker isDialogOpen={open} />
        <Dialog onOpenChange={setOpen} open={open}>
          {appliedCoupon ? (
            // ✅ Coupon applied — only cross icon is clickable
            <CouponRow
              disabled
              label={appliedCoupon}
              labelClasses="text-btn-bg-teal"
              right={
                isPending ? (
                  <Spinner className="size-3.75" size={15} variant="dark" />
                ) : (
                  <RotatingIcon
                    active
                    activeSrc={CloseIcon}
                    inactiveSrc={CloseIcon}
                    onClickAction={(e) => {
                      e?.stopPropagation();
                      removeCoupon();
                    }}
                    size={18}
                  />
                )
              }
            />
          ) : (
            // ❌ No coupon — whole area opens dialog
            <DialogTrigger asChild>
              <CouponRow
                label={t("trigger")}
                onClick={() => setOpen(true)}
                right={
                  <RotatingIcon
                    active={open}
                    activeSrc={CloseIcon}
                    inactiveSrc={PlusIcon}
                    size={18}
                  />
                }
              />
            </DialogTrigger>
          )}

          <DialogContent
            className={cn(
              "translate-none max-w-auto font-gilroy bottom-0 left-0 top-auto w-full rounded-none p-0"
            )}
            showCloseButton={false}
          >
            <DialogHeader className="py-3.75 border-border-base flex flex-row items-center justify-between border-b px-5">
              <DialogTitle className="text-text-primary text-xl font-medium">
                {t("title")}
              </DialogTitle>
              <DialogClose>
                <Image alt="close" className="size-5" src={CloseIcon} />
              </DialogClose>
            </DialogHeader>

            <div className="flex flex-col overflow-y-auto">
              <DialogDescription className="text-text-tertiary px-5 text-sm font-normal">
                {t("description")}
              </DialogDescription>
              <ApplyCouponToCartForm
                closeDialogAction={closeDialog}
                containerProps={{ className: "px-5 pb-5" }}
              />
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // --- Web Version ---
  return (
    <>
      <CartPromocodeViewExpandTracker isDialogOpen={open} />
      <CheckoutPromocodeViewExpandTracker isDialogOpen={open} />
      <Dialog onOpenChange={setOpen} open={open}>
        {appliedCoupon ? (
          <CouponRow
            disabled
            label={appliedCoupon}
            labelClasses="text-btn-bg-teal"
            right={
              isPending ? (
                <Spinner size={18} variant="dark" />
              ) : (
                <RotatingIcon
                  active
                  activeSrc={CloseIcon}
                  inactiveSrc={CloseIcon}
                  onClickAction={(e) => {
                    e?.stopPropagation();
                    removeCoupon();
                  }}
                  size={18}
                />
              )
            }
          />
        ) : (
          <DialogTrigger asChild>
            <CouponRow
              label={t("title")}
              onClick={() => setOpen(true)}
              right={
                <RotatingIcon
                  active={open}
                  activeSrc={CloseIcon}
                  inactiveSrc={PlusIcon}
                  size={18}
                />
              }
            />
          </DialogTrigger>
        )}

        <DialogContent
          className="w-100 font-gilroy max-h-[90dvh] gap-0 overflow-y-auto"
          showCloseButton={true}
        >
          <DialogHeader className="mt-7.5 gap-4">
            <DialogTitle className="text-text-primary text-4xl font-normal">
              {t("title")}
            </DialogTitle>
          </DialogHeader>

          <DialogDescription className="text-text-tertiary mt-2 text-sm font-normal">
            {t("description")}
          </DialogDescription>

          <ApplyCouponToCartForm closeDialogAction={closeDialog} />
        </DialogContent>
      </Dialog>
    </>
  );
};
