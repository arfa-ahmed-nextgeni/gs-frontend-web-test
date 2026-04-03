"use client";

import Image from "next/image";

import { useTranslations } from "next-intl";

import SalutingFaceEmoji from "@/assets/images/saluting-face-emoji.svg";
import { Button } from "@/components/ui/button";
import { useAuthUI } from "@/contexts/auth-ui-context";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants/routes";

export const GuestPanel = () => {
  const t = useTranslations("AccountPage.guest");

  const { showOtpLoginPopup } = useAuthUI();

  const isMobile = useIsMobile();

  const handleProfileClick = () => {
    showOtpLoginPopup();
  };

  return (
    <>
      <div className="bg-bg-default mx-5 flex flex-col gap-5 rounded-xl p-5 lg:mx-0">
        <div className="flex flex-row items-center gap-1">
          <p className="text-text-primary text-xl font-medium">{t("title")}</p>
          <Image
            alt="salute emoji"
            className="size-5"
            height={20}
            src={SalutingFaceEmoji}
            unoptimized
            width={20}
          />
        </div>
        <div className="text-text-secondary text-sm font-medium">
          {t("description")}
        </div>
        {isMobile ? (
          <Link
            className="h-12.5 bg-bg-brand rounded-4xl px-7.5 text-text-inverse flex w-fit items-center justify-center text-xl font-medium"
            href={ROUTES.CUSTOMER.LOGIN}
          >
            {t("loginButton")}
          </Link>
        ) : (
          <Button
            className="h-12.5 bg-bg-brand rounded-4xl px-7.5 text-text-inverse flex w-fit items-center justify-center text-xl font-medium"
            onClick={handleProfileClick}
          >
            {t("loginButton")}
          </Button>
        )}
      </div>
    </>
  );
};
