"use client";

import React, { PropsWithChildren } from "react";

import Image from "next/image";

import { useDirection } from "@radix-ui/react-direction";

import BackIcon from "@/assets/icons/back-icon.svg";
import CloseIcon from "@/assets/icons/close-icon.svg";
import ShieldIcon from "@/assets/icons/Shield.svg";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { cn } from "@/lib/utils";

type DrawerLayoutProps = PropsWithChildren<{
  className?: string;
  contentContainerClassName?: string;
  mobileHeaderEndContent?: React.ReactNode;
  onBack?: () => void;
  onClose: () => void;
  secondaryAction?: {
    icon?: string;
    label?: string;
    onClick?: () => void;
    show?: boolean;
  };
  showBackButton?: boolean;
  showDesktopBackButton?: boolean;
  title: string;
  titleClassName?: string;
  widthClassName?: string;
}>;

export function DrawerLayout({
  children,
  className,
  contentContainerClassName,
  mobileHeaderEndContent,
  onBack,
  onClose,
  secondaryAction,
  showBackButton = false,
  showDesktopBackButton = false,
  title,
  titleClassName,
  widthClassName = "!w-107.5",
}: DrawerLayoutProps) {
  const isMobile = useIsMobile();
  const direction = useDirection();
  const mobileHeaderAction =
    mobileHeaderEndContent ??
    (secondaryAction?.show && secondaryAction.icon && (
      <button
        aria-label={secondaryAction.label ?? "Secondary action"}
        onClick={secondaryAction.onClick}
      >
        <Image
          alt={secondaryAction.label ?? "Secondary action"}
          className="object-contain"
          height={20}
          priority
          src={secondaryAction.icon}
          unoptimized
          width={20}
        />
      </button>
    ));

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[999] flex flex-col bg-white">
        <div className="items-left flex items-center justify-between gap-3 px-4 py-4">
          <button
            aria-label={showBackButton ? "Back" : "Close"}
            onClick={showBackButton && onBack ? onBack : onClose}
          >
            <Image
              alt={showBackButton ? "Back" : "Close"}
              className={showBackButton ? "rtl:rotate-180" : ""}
              priority
              src={showBackButton ? BackIcon : CloseIcon}
              unoptimized
            />
          </button>
          <h2 className="text-text-primary flex-1 text-left text-[20px] font-medium rtl:text-right">
            {title}
          </h2>
          {mobileHeaderAction ? (
            <div>{mobileHeaderAction}</div>
          ) : (
            <Image
              alt="Secure"
              height={20}
              priority
              src={ShieldIcon as string}
              unoptimized
              width={20}
            />
          )}
        </div>
        <div
          className={cn("flex-1 overflow-y-auto", contentContainerClassName)}
        >
          {children}
        </div>
      </div>
    );
  }

  const drawerDirection = direction === "ltr" ? "right" : "left";

  return (
    <Drawer direction={drawerDirection} dismissible={false} open>
      <DrawerContent
        animated={false}
        className={cn(widthClassName, "bg-bg-body border-none")}
      >
        <DrawerHeader
          className={cn(
            "bg-bg-default border-border-base h-15 lg:pt-7.5 relative flex shrink-0 flex-row items-center justify-between border-b px-5 lg:h-16",
            className
          )}
        >
          <div className="flex flex-1 flex-row items-center gap-5">
            {showDesktopBackButton && onBack ? (
              <button aria-label="Back" onClick={onBack}>
                <Image
                  alt="Back"
                  className="rtl:rotate-180"
                  priority
                  src={BackIcon}
                  unoptimized
                />
              </button>
            ) : (
              <button aria-label="Close" onClick={onClose}>
                <Image alt="Close" priority src={CloseIcon} unoptimized />
              </button>
            )}
            <DrawerTitle
              className={cn(
                "text-text-primary flex-1 text-left text-xl font-medium leading-none rtl:text-right",
                titleClassName
              )}
            >
              {title}
            </DrawerTitle>
          </div>

          {secondaryAction?.show && secondaryAction?.icon && (
            <button
              aria-label={secondaryAction.label ?? "Secondary action"}
              onClick={secondaryAction.onClick}
            >
              <Image
                alt={secondaryAction.label ?? "Secondary action"}
                className="object-contain"
                height={20}
                priority
                src={secondaryAction.icon}
                unoptimized
                width={20}
              />
            </button>
          )}
        </DrawerHeader>

        {children}
      </DrawerContent>
    </Drawer>
  );
}
