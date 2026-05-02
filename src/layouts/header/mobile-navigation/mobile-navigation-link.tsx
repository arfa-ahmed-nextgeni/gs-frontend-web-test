"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { serializeMobileNavigationClickOriginPayload } from "@/layouts/header/mobile-navigation/mobile-navigation-click-origin-dataset";
import { MOBILE_NAVIGATION_CLICK_ORIGIN_DATA_ATTRIBUTE } from "@/lib/constants/tracking-data-attributes";
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
  const serializedClickOriginPayload =
    serializeMobileNavigationClickOriginPayload({
      position,
    });

  return (
    <Link
      {...{
        [MOBILE_NAVIGATION_CLICK_ORIGIN_DATA_ATTRIBUTE]:
          serializedClickOriginPayload,
      }}
      aria-disabled={isActivePath}
      className={cn(className, {
        "pointer-events-none font-bold": isActivePath,
      })}
      href={href}
      style={style}
      title={label}
    >
      {label}
    </Link>
  );
};
