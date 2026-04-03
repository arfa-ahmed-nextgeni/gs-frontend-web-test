"use client";

import { ComponentProps, PropsWithChildren } from "react";

import { Link } from "@/i18n/navigation";
import { usePathname } from "@/i18n/navigation";
import { trackSettingsOpen } from "@/lib/analytics/events";
import { cn } from "@/lib/utils";

export const AccountNavLink = ({
  children,
  className,
  href,
  section,
}: PropsWithChildren<{ section?: string } & ComponentProps<typeof Link>>) => {
  const pathname = usePathname();

  const handleClick = () => {
    // Track settings_open when each section on account area is clicked
    if (section) {
      trackSettingsOpen(section);
    }
  };

  return (
    <Link
      className={cn(className, {
        "bg-bg-surface ps-7.5": pathname === href,
      })}
      href={href}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
};
