import { ReactNode } from "react";

import type { StaticImport } from "next/dist/shared/lib/get-img-props";

import AddressIcon from "@/assets/icons/address-icon.svg";
import CustomerServiceIcon from "@/assets/icons/customer-service-icon.svg";
import GlobeIcon from "@/assets/icons/globe-icon.svg";
import InfoIcon from "@/assets/icons/info-icon.svg";
import SwitchLanguageIcon from "@/assets/icons/languages-icon.svg";
import CardsIcon from "@/assets/icons/my-cards-icon.svg";
import OrdersIcon from "@/assets/icons/orders-icon.svg";
import ProfileMenuIcon from "@/assets/icons/profile-menu-icon.svg";
import ShareIcon from "@/assets/icons/share-icon.svg";
import WishlistMenuIcon from "@/assets/icons/wishlist-menu-icon.svg";
import { StoreCode } from "@/lib/constants/i18n";
import { ROUTES } from "@/lib/constants/routes";

export const enum AccountNavId {
  About = "about",
  Address = "address",
  Cards = "cards",
  Country = "country",
  CustomerService = "customer-service",
  InviteFriends = "invite-friends",
  Orders = "orders",
  Profile = "profile",
  SwitchLanguage = "switch-language",
  Wishlist = "wishlist",
}

export const ACCOUNT_MENU_PRIMARY: AccountNavEntry[] = [
  {
    href: ROUTES.CUSTOMER.PROFILE.ROOT,
    icon: ProfileMenuIcon,
    id: AccountNavId.Profile,
    labelKey: "profile",
  },
  {
    href: ROUTES.CUSTOMER.ORDERS,
    icon: OrdersIcon,
    id: AccountNavId.Orders,
    labelKey: "orders",
  },
  {
    href: ROUTES.CUSTOMER.PROFILE.ADDRESSES.ROOT,
    icon: AddressIcon,
    id: AccountNavId.Address,
    labelKey: "address",
  },
  {
    href: ROUTES.CUSTOMER.CARDS,
    icon: CardsIcon,
    id: AccountNavId.Cards,
    labelKey: "cards",
    visibleInStores: [StoreCode.ar_sa, StoreCode.en_sa],
  },
  {
    href: ROUTES.CUSTOMER.PROFILE.WISHLIST,
    icon: WishlistMenuIcon,
    id: AccountNavId.Wishlist,
    labelKey: "wishlist",
  },
  {
    className: "hidden lg:mt-2.5 lg:flex lg:rounded-t-xl",
    href: ROUTES.CUSTOMER_SERVICE,
    icon: CustomerServiceIcon,
    id: AccountNavId.CustomerService,
    labelKey: "customerService",
  },
];

export const ACCOUNT_MENU_SECONDARY: AccountNavEntry[] = [
  {
    href: ROUTES.CUSTOMER.LANGUAGE,
    icon: SwitchLanguageIcon,
    id: AccountNavId.SwitchLanguage,
    labelKey: "language",
  },
  {
    href: ROUTES.CUSTOMER.REGION,
    icon: GlobeIcon,
    id: AccountNavId.Country,
    labelKey: "country",
  },
  {
    className: "mt-2.5",
    href: ROUTES.CUSTOMER_SERVICE,
    icon: CustomerServiceIcon,
    id: AccountNavId.CustomerService,
    labelKey: "customerService",
  },
  {
    href: "#",
    icon: InfoIcon,
    id: AccountNavId.About,
    labelKey: "aboutGoldenScent",
  },
  {
    className: "",
    href: "#",
    icon: ShareIcon,
    id: AccountNavId.InviteFriends,
    labelKey: "inviteFriends",
  },
];

export type AccountNavEntry = {
  className?: string;
  href: string;
  icon: StaticImport | string;
  id: AccountNavId;
  labelKey: string;
  secondaryContent?: ReactNode;
  visibleInStores?: StoreCode[];
};
