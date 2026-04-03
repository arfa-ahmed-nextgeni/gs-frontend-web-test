"use client";

import React, { useEffect } from "react";

import Image from "next/image";

import { useDirection } from "@radix-ui/react-direction";
import { useTranslations } from "next-intl";

import CloseIcon from "@/assets/icons/close-icon.svg";
import { ViewOrderDetails } from "@/components/customer/orders/view-order/view-order-details";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useViewOrderContext } from "@/contexts/view-order-context";

export const ViewOrderDrawerLayout = ({ orderId }: { orderId: string }) => {
  const t = useTranslations("CustomerViewOrderPage");

  const direction = useDirection();

  const { closeDrawer, loadOrderData } = useViewOrderContext();
  useEffect(() => {
    if (orderId) {
      loadOrderData(orderId);
    }
  }, [orderId, loadOrderData]);

  return (
    <Drawer
      direction={direction === "ltr" ? "right" : "left"}
      dismissible={false}
      open={true}
    >
      <DrawerContent className="!w-107.5 bg-bg-body border-none">
        <DrawerHeader className="bg-bg-default relative p-0">
          <DrawerTitle className="sr-only">{t("title")}</DrawerTitle>
          <DrawerDescription className="sr-only">
            Order details and information
          </DrawerDescription>
          <button
            className="bg-bg-default absolute left-0 top-0 hidden size-10 -translate-x-full items-center justify-center lg:flex rtl:right-0 rtl:translate-x-full"
            onClick={closeDrawer}
          >
            <Image alt="Close" src={CloseIcon} />
          </button>
        </DrawerHeader>
        <ViewOrderDetails />
      </DrawerContent>
    </Drawer>
  );
};
