"use client";

import { useTranslations } from "next-intl";

import { AddPickupPointViewSkeleton } from "@/components/checkout/add-pickup-point/skeletons/add-pickup-point-view-skeleton";
import { DrawerLayout } from "@/components/shared/layouts/drawer-layout";
import { useCheckoutContext } from "@/contexts/checkout-context";
import { useRouter } from "@/i18n/navigation";

export function AddPickupPointPageSkeleton() {
  const router = useRouter();

  const {
    cameFromShippingOptionDrawer,
    setCameFromShippingOptionDrawer,
    setIsShippingOptionDrawerOpen,
  } = useCheckoutContext();

  const t = useTranslations("AddPickupPointPage");

  const handleClose = () => {
    if (cameFromShippingOptionDrawer) {
      // only reopen shipping option drawer if we came from it
      setIsShippingOptionDrawerOpen(true);
      setCameFromShippingOptionDrawer(false);
    }
    router.back();
  };

  return (
    <DrawerLayout
      contentContainerClassName="flex"
      onBack={handleClose}
      onClose={handleClose}
      showBackButton
      showDesktopBackButton={cameFromShippingOptionDrawer}
      title={t("title")}
    >
      <AddPickupPointViewSkeleton />
    </DrawerLayout>
  );
}
