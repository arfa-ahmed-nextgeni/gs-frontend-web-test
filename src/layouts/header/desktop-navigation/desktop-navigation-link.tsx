"use client";

import type { CSSProperties, ReactNode } from "react";

import { BlurLink } from "@/components/ui/blur-link";
import { Link } from "@/i18n/navigation";
import { getCurrentDesktopNavigationLpId } from "@/layouts/header/desktop-navigation/desktop-navigation-click-origin";
import { clickOriginTrackingManager } from "@/lib/analytics/click-origin-tracking-manager";
import { trackDesktopNavigation } from "@/lib/analytics/events";
import { ZIndexLevel } from "@/lib/constants/ui";

import type { DesktopNavigationUrlType } from "@/lib/analytics/models/event-models";

type DesktopNavigationTrackingPayload = {
  categoryId?: string;
  categoryMeta?: {
    "category.id": string;
    "category.name": string;
  };
  lpId: string;
  lpName: string;
  position: number;
  title: string;
  urlType: DesktopNavigationUrlType;
};

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
  const handleClick = () => {
    const pathname = window.location.pathname;

    clickOriginTrackingManager.setClickOrigin({
      lp_id: getCurrentDesktopNavigationLpId(pathname),
      origin: "top_menu",
      position: tracking.position,
    });

    trackDesktopNavigation(
      {
        category_id: tracking.categoryId,
        lp_id: tracking.lpId,
        lp_name: tracking.lpName,
        title: tracking.title,
        type: "webview",
        url_type: tracking.urlType,
      },
      tracking.categoryMeta
    );
  };

  if (hoverLevel) {
    return (
      <BlurLink
        className={className}
        hoverLevel={hoverLevel}
        href={href}
        onClick={handleClick}
        prefetch={false}
        style={style}
        title={title}
      >
        {children}
      </BlurLink>
    );
  }

  return (
    <Link
      className={className}
      href={href}
      onClick={handleClick}
      prefetch={false}
      style={style}
      title={title}
    >
      {children}
    </Link>
  );
};
