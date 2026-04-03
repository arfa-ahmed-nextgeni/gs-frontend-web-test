"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { trackMobileNavigationClick } from "@/layouts/header/mobile-navigation/mobile-navigation-click-origin";
import { cn } from "@/lib/utils";

type MobileNavigationLinkProps = {
  activePath: string;
  className: string;
  href: string;
  label: string;
  position: number;
  style?: React.CSSProperties;
};

export const MobileNavigationLink = ({
  activePath,
  className,
  href,
  label,
  position,
  style,
}: MobileNavigationLinkProps) => {
  const pathname = usePathname();
  const isActivePath =
    pathname === activePath || pathname.startsWith(`${activePath}/`);

  return (
    <Link
      aria-disabled={isActivePath}
      className={cn(className, {
        "pointer-events-none font-bold": isActivePath,
      })}
      href={href}
      onClick={() => trackMobileNavigationClick(pathname, position)}
      prefetch={false}
      style={style}
      title={label}
    >
      {label}
    </Link>
  );
};
