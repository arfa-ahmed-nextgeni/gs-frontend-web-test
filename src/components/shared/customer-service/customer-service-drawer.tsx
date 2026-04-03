"use client";

import { type ReactNode } from "react";

import Image from "next/image";

import { useTranslations } from "next-intl";

import CloseIcon from "@/assets/icons/close-icon.svg";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useIsMobileBottomNavHidden } from "@/hooks/use-is-mobile-bottom-nav-hidden";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function CustomerServiceDrawer({ children }: { children: ReactNode }) {
  const t = useTranslations("CustomerServiceActionSheet");
  const router = useRouter();
  const isMobileBottomNavHidden = useIsMobileBottomNavHidden();

  const closeDialog = () => {
    router.back();
  };

  return (
    <Drawer direction="bottom" open>
      <DrawerContent
        className={cn(
          "bg-bg-default pb-15 border-none data-[vaul-drawer-direction=bottom]:rounded-t-none",
          {
            "pb-0": isMobileBottomNavHidden,
          }
        )}
      >
        <DrawerHeader className="py-3.75 border-border-base flex flex-row justify-between border-b px-5">
          <DrawerTitle className="text-text-primary text-xl font-medium">
            {t("title")}
          </DrawerTitle>
          <DrawerClose asChild>
            <button aria-label="Close" onClick={closeDialog} type="button">
              <Image alt="close" className="size-5" src={CloseIcon} />
            </button>
          </DrawerClose>
        </DrawerHeader>
        <div className="gap-7.5 flex flex-col overflow-y-auto px-5 pb-5 pt-10">
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
