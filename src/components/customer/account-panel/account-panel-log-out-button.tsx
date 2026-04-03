"use client";

import Image from "next/image";

import { useTranslations } from "next-intl";

import LogOutIcon from "@/assets/icons/log-out-icon.svg";
import { Button } from "@/components/ui/button";
import { useStoreCode } from "@/hooks/i18n/use-store-code";
import { useLogout } from "@/hooks/use-logout";

export const AccountPanelLogOutButton = () => {
  const t = useTranslations("AccountPage.menu");

  const { storeCode } = useStoreCode();

  const { logout } = useLogout();

  const handleLogout = async () => {
    await logout(storeCode);
  };

  return (
    <Button
      className="border-border-base h-12.5 bg-bg-default flex flex-row justify-start gap-5 rounded-none border-b px-5 lg:hidden"
      onClick={handleLogout}
    >
      <Image
        alt=""
        className="aspect-square"
        height={20}
        src={LogOutIcon}
        unoptimized
        width={20}
      />
      <span className="text-text-danger text-xl font-medium">
        {t("logOut")}
      </span>
    </Button>
  );
};
