"use client";

import { Suspense, use } from "react";

import Image from "next/image";

import { useTranslations } from "next-intl";

import ShieldIcon from "@/assets/icons/Shield.svg";
import { GiftEditTracker } from "@/components/analytics/gift-edit-tracker";
import { AddGiftWrappingForm } from "@/components/checkout/delivery/gift-wrapping/add-gift-wrapping-form";
import { AddGiftWrappingFormSkeleton } from "@/components/checkout/delivery/gift-wrapping/add-gift-wrapping-form-skeleton";
import { DrawerLayout } from "@/components/shared/layouts/drawer-layout";
import { useCart } from "@/contexts/use-cart";
import { useRouter } from "@/i18n/navigation";

import type { GiftWrappingResolvedData } from "@/components/checkout/delivery/gift-wrapping/types";

interface AddGiftWrappingDrawerLayoutProps {
  defaultGiftMessage?: string;
  giftDataPromise: Promise<GiftWrappingResolvedData>;
  selectedSku?: string;
}

interface AddGiftWrappingFormContentProps {
  defaultGiftMessage?: string;
  giftDataPromise: Promise<GiftWrappingResolvedData>;
  isEditMode: boolean;
}

const AddGiftWrappingFormContent = ({
  defaultGiftMessage,
  giftDataPromise,
  isEditMode,
}: AddGiftWrappingFormContentProps) => {
  const { defaultSelectedGiftId, giftSections } = use(giftDataPromise);
  const { cart } = useCart();

  const existingWrapItem =
    isEditMode && cart
      ? (cart.items.find((item) => item.isWrap) ?? null)
      : null;

  return (
    <>
      <GiftEditTracker
        defaultSelectedGiftId={defaultSelectedGiftId}
        isEditMode={isEditMode}
      />
      <AddGiftWrappingForm
        defaultGiftMessage={defaultGiftMessage}
        defaultSelectedGiftId={defaultSelectedGiftId}
        existingWrapItem={existingWrapItem}
        giftSections={giftSections}
        isEditMode={isEditMode}
      />
    </>
  );
};

export const AddGiftWrappingDrawerLayout = ({
  defaultGiftMessage,
  giftDataPromise,
  selectedSku,
}: AddGiftWrappingDrawerLayoutProps) => {
  const router = useRouter();

  const t = useTranslations("CheckoutPage.AddGiftWrappingDrawer");

  // Check if we're in edit mode (selectedSku indicates edit mode)
  const isEditMode = !!selectedSku;

  return (
    <DrawerLayout
      contentContainerClassName="flex"
      mobileHeaderEndContent={
        <Image
          alt="shield"
          className="size-5"
          height={20}
          src={ShieldIcon}
          width={20}
        />
      }
      onBack={router.back}
      onClose={router.back}
      showBackButton={true}
      showDesktopBackButton={false}
      title={t("title")}
    >
      <Suspense fallback={<AddGiftWrappingFormSkeleton />}>
        <AddGiftWrappingFormContent
          defaultGiftMessage={defaultGiftMessage}
          giftDataPromise={giftDataPromise}
          isEditMode={isEditMode}
        />
      </Suspense>
    </DrawerLayout>
  );
};
