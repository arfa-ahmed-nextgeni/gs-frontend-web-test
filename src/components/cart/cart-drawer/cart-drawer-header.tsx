"use client";

import { useTranslations } from "next-intl";

import { DrawerHeaderBar } from "@/components/shared/drawer-header-bar";
import { useCartDrawer } from "@/contexts/cart-drawer-context";

export const CartDrawerHeader = () => {
  const { closeCartDrawer } = useCartDrawer();

  const t = useTranslations("CartPage.drawer");

  return <DrawerHeaderBar onClose={closeCartDrawer} title={t("title")} />;
};
