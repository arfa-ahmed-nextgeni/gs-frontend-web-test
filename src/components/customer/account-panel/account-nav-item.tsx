"use client";

import { PropsWithChildren } from "react";

import Image from "next/image";

import { useTranslations } from "next-intl";

import ArrowRightIcon from "@/assets/icons/arrow-right.svg";
import {
  AccountNavEntry,
  AccountNavId,
} from "@/components/customer/account-panel/account-menu.config";
import { AccountNavLink } from "@/components/customer/account-panel/account-nav-link";
import { ShareNavAction } from "@/components/customer/account-panel/share-nav-action";
import { cn } from "@/lib/utils";

export const AccountNavItem = ({
  children,
  className,
  href,
  icon,
  id,
  labelKey,
}: PropsWithChildren<AccountNavEntry>) => {
  const t = useTranslations("AccountPage.menu");

  const ContainerElement =
    id === AccountNavId.InviteFriends ? ShareNavAction : AccountNavLink;

  // Map AccountNavId to section names for settings_open event
  const getSectionName = (navId: AccountNavId): string => {
    const sectionMap: Record<AccountNavId, string> = {
      [AccountNavId.About]: "about_us",
      [AccountNavId.Address]: "my_address",
      [AccountNavId.Cards]: "my_cards",
      [AccountNavId.Country]: "store_selection",
      [AccountNavId.CustomerService]: "customer_service",
      [AccountNavId.InviteFriends]: "invite_friends",
      [AccountNavId.Orders]: "my_orders",
      [AccountNavId.Profile]: "account_update",
      [AccountNavId.SwitchLanguage]: "switch_language",
      [AccountNavId.Wishlist]: "my_wishlist",
    };
    return sectionMap[navId] || navId;
  };

  const sectionName = getSectionName(id);

  return (
    <ContainerElement
      className={cn(
        "transition-default border-border-base h-12.5 bg-bg-default flex w-full flex-row items-center justify-between border-b px-5",
        "hover:bg-bg-surface hover:pl-7.5 rtl:hover:pr-7.5 rtl:hover:pl-5",
        className
      )}
      href={href}
      {...(ContainerElement === AccountNavLink && { section: sectionName })}
    >
      <div className="flex flex-row items-center gap-5">
        <Image
          alt=""
          className="aspect-square size-5"
          height={20}
          src={icon}
          unoptimized
          width={20}
        />
        <span className="text-text-primary text-xl font-medium">
          {t(labelKey as any)}
        </span>
      </div>
      <div className="flex flex-row gap-5">
        {children}
        <Image
          alt=""
          className="aspect-square rtl:rotate-180"
          height={20}
          src={ArrowRightIcon}
          unoptimized
          width={20}
        />
      </div>
    </ContainerElement>
  );
};
