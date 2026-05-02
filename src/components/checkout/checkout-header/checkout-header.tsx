"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import Image from "next/image";

import { useTranslations } from "next-intl";

import BackIcon from "@/assets/icons/back-icon.svg";
import ShieldIcon from "@/assets/icons/Shield.svg";
import { GoldenScentLogo } from "@/components/icons/golden-scent-logo";
import { JoinBanner } from "@/components/shared/join-banner";
import { useCustomerQuery } from "@/hooks/queries/use-customer-query";
import { useRouteMatch } from "@/hooks/use-route-match";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants/routes";

interface CheckoutHeaderProps {
  email?: null | string;
  logoSlot?: ReactNode;
}

export function CheckoutHeader({ email, logoSlot }: CheckoutHeaderProps) {
  const t = useTranslations("CheckoutPage");
  const { isOrderConfirmation } = useRouteMatch();
  const { data: currentCustomer, isLoading: isCustomerLoading } =
    useCustomerQuery();
  const resolvedEmail = email ?? currentCustomer?.email;
  const [shouldShowJoinBanner, setShouldShowJoinBanner] = useState(false);

  // Only show banner after customer data is loaded and user has no email
  useEffect(() => {
    if (!isCustomerLoading && isOrderConfirmation) {
      // Add delay to ensure customer data is fully resolved
      const timer = setTimeout(() => {
        setShouldShowJoinBanner(!resolvedEmail);
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [isCustomerLoading, isOrderConfirmation, resolvedEmail]);

  return (
    <>
      {/* Mobile Header */}
      <div className="mb-5 flex h-[50px] items-center justify-between bg-white px-4 py-4 lg:hidden lg:h-[70px]">
        <div className="flex items-center gap-3">
          <Link
            className="text-text-primary rtl:rotate-180"
            href="/cart"
            title="Back to cart"
          >
            <Image alt="back" className="h-5 w-5" src={BackIcon} />
          </Link>
          <span className="text-text-primary text-[20px] font-medium">
            {t("header.secureCheckout")}
          </span>
        </div>
        <div className="flex items-center">
          <Image alt="secure" className="h-5 w-5" src={ShieldIcon} />
        </div>
      </div>

      {/* Desktop Header */}
      <div className="bg-bg-default px-30 mb-0 hidden h-[70px] grid-cols-[1fr_auto_1fr] items-center py-4 lg:grid">
        <div className="flex items-center">
          <Link href={ROUTES.ROOT} title="Go to homepage">
            {logoSlot ?? <GoldenScentLogo className="h-10 w-auto" />}
          </Link>
        </div>
        <div className="text-text-primary text-center text-lg font-medium">
          {t("header.secureCheckout")}
        </div>
        <div className="flex items-center justify-end gap-2 text-xs text-[#374957]">
          <span className="inline-flex size-5 items-center justify-center">
            <Image alt="secure" className="h-5 w-5" src={ShieldIcon} />
          </span>
          <span dangerouslySetInnerHTML={{ __html: t("header.trustText") }} />
        </div>
      </div>
      {shouldShowJoinBanner && (
        <JoinBanner
          linkText={t("header.joinHere")}
          showMobile={false}
          text={t("header.joinBannerText")}
        />
      )}
    </>
  );
}
