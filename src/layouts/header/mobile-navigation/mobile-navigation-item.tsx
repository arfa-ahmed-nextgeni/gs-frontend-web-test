"use client";

import { useState } from "react";

import { ArrowDownIcon } from "@/components/icons/arrow-down-icon";
import { Link } from "@/i18n/navigation";
import { usePathname } from "@/i18n/navigation";
import { clickOriginTrackingManager } from "@/lib/analytics/click-origin-tracking-manager";
import { ROUTES } from "@/lib/constants/routes";
import { MainMenuType } from "@/lib/types/ui-types";
import { cn } from "@/lib/utils";

export const MobileNavigationItem = ({
  item,
  position,
}: {
  item: MainMenuType;
  position: number;
}) => {
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);

  const toggleSubmenu = () => {
    setIsOpen(!isOpen);
  };

  // Extract current LP ID from pathname if on a landing page
  // Landing pages follow pattern: /[locale]/lp/[slug]
  const getCurrentLpId = (): string | undefined => {
    const lpMatch = pathname.match(/\/lp\/([^/]+)/);
    if (lpMatch && lpMatch[1]) {
      return lpMatch[1];
    } else if (pathname === ROUTES.HOME) {
      return "landing page";
    }
    return undefined;
  };

  const handleNavClick = () => {
    // Track click origin for top_menu
    // Use source LP ID (current page) if available, not destination
    const currentLpId = getCurrentLpId();
    clickOriginTrackingManager.setClickOrigin({
      lp_id: currentLpId,
      origin: "top_menu",
      position,
    });
  };

  const hasSubmenu = Array.isArray(item.subMenu);

  const isActivePath = pathname.includes(item.path);

  if (hasSubmenu) {
    return (
      <div className="transition-default relative flex flex-col items-center overflow-hidden">
        <button
          className="text-text-primary relative inline-flex items-center gap-1 text-xl font-medium"
          onClick={() => {
            handleNavClick();
            toggleSubmenu();
          }}
          style={item.style}
        >
          {item.label}
          <ArrowDownIcon
            className={cn(
              "transition-default ms-1",
              isOpen ? "rotate-180" : "rotate-0"
            )}
          />
        </button>
        <div
          className={cn(
            "transition-default relative flex flex-col items-center gap-2",
            isOpen ? "max-h-50 py-2" : "max-h-0 py-0"
          )}
        >
          {item.subMenu?.map((subItem) => (
            <Link
              aria-disabled={isActivePath}
              className={cn(
                "transition-default before:transition-default focus:before:bg-bg-success text-text-primary relative text-base font-medium before:absolute before:bottom-[-1px] before:start-0 before:h-[2px] before:w-0 before:content-[''] focus:outline-none focus:before:w-full",
                {
                  "pointer-events-none font-bold": isActivePath,
                }
              )}
              href={subItem.path}
              key={subItem.id}
              onClick={() => handleNavClick()}
              prefetch={false}
              style={subItem.style}
              title={subItem.label}
            >
              {subItem.label}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Link
      aria-disabled={isActivePath}
      className={cn(
        "transition-default before:transition-default focus:before:bg-bg-success text-text-primary relative inline-flex items-center text-xl font-medium before:absolute before:bottom-[-1px] before:start-0 before:h-[4px] before:w-0 before:content-[''] focus:outline-none focus:before:w-full",
        {
          "pointer-events-none font-bold": isActivePath,
        }
      )}
      href={item.path}
      onClick={() => handleNavClick()}
      prefetch={false}
      style={item.style}
      title={item.label}
    >
      {item.label}
    </Link>
  );
};
