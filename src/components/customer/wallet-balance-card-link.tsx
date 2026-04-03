"use client";

import { ComponentProps, PropsWithChildren } from "react";

import { Link } from "@/i18n/navigation";
import { trackSettingsOpen } from "@/lib/analytics/events";
import { ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils";

interface WalletBalanceCardLinkProps
  extends Omit<ComponentProps<typeof Link>, "href"> {
  disableNavigation?: boolean;
}

export function WalletBalanceCardLink({
  children,
  className,
  disableNavigation = false,
  ...props
}: PropsWithChildren<WalletBalanceCardLinkProps>) {
  const handleClick = () => {
    // Track settings_open when wallet balance card is clicked
    if (!disableNavigation) {
      trackSettingsOpen("wallet_history");
    }
  };

  return (
    <Link
      {...props}
      className="block"
      href={ROUTES.CUSTOMER.WALLET}
      onClick={handleClick}
    >
      <div
        className={cn(
          "bg-bg-success flex h-[133px] flex-row justify-between rounded-2xl p-5",
          className
        )}
      >
        {children}
      </div>
    </Link>
  );
}
