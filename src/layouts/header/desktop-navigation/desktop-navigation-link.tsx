import type { CSSProperties, ReactNode } from "react";

import { BlurLink } from "@/components/ui/blur-link";
import { Link } from "@/i18n/navigation";
import { serializeDesktopNavigationTrackingPayload } from "@/layouts/header/desktop-navigation/desktop-navigation-tracking-dataset";
import { DESKTOP_NAVIGATION_TRACKING_DATA_ATTRIBUTE } from "@/lib/constants/tracking-data-attributes";
import { ZIndexLevel } from "@/lib/constants/ui";

import type { DesktopNavigationTrackingPayload } from "@/layouts/header/desktop-navigation/desktop-navigation-tracking-dataset";

export const DesktopNavigationLink = ({
  children,
  className,
  hoverLevel,
  href,
  style,
  title,
  tracking,
}: {
  children: ReactNode;
  className: string;
  hoverLevel?: ZIndexLevel;
  href: string;
  style?: CSSProperties;
  title: string;
  tracking: DesktopNavigationTrackingPayload;
}) => {
  const serializedTrackingPayload =
    serializeDesktopNavigationTrackingPayload(tracking);

  const trackingAttributes = {
    [DESKTOP_NAVIGATION_TRACKING_DATA_ATTRIBUTE]: serializedTrackingPayload,
  };

  if (hoverLevel) {
    return (
      <BlurLink
        {...trackingAttributes}
        className={className}
        hoverLevel={hoverLevel}
        href={href}
        style={style}
        title={title}
      >
        {children}
      </BlurLink>
    );
  }

  return (
    <Link
      {...trackingAttributes}
      className={className}
      href={href}
      style={style}
      title={title}
    >
      {children}
    </Link>
  );
};
