"use client";

import { useDirection } from "@radix-ui/react-direction";
import { useTranslations } from "next-intl";

import { AddressFormSkeleton } from "@/components/customer/addresses/manage-address/address-form-skeleton";
import { DrawerHeaderBar } from "@/components/shared/drawer-header-bar";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useRouter } from "@/i18n/navigation";

export function EditAddressPageSkeleton() {
  const t = useTranslations("CustomerAddAddressPage");

  const router = useRouter();

  const direction = useDirection();

  const isMobile = useIsMobile();

  if (isMobile) {
    return <AddressFormSkeleton />;
  }

  return (
    <Drawer
      direction={direction === "ltr" ? "right" : "left"}
      dismissible={false}
      open={true}
    >
      <DrawerContent className="!w-107.5 bg-bg-body border-none">
        <DrawerHeaderBar onClose={router.back} title={t("editTitle")} />
        <AddressFormSkeleton />
      </DrawerContent>
    </Drawer>
  );
}
