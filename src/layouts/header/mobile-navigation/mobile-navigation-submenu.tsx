"use client";

import { useState } from "react";

import { ArrowDownIcon } from "@/components/icons/arrow-down-icon";
import { usePathname } from "@/i18n/navigation";
import { trackMobileNavigationClick } from "@/layouts/header/mobile-navigation/mobile-navigation-click-origin";
import { MobileNavigationLink } from "@/layouts/header/mobile-navigation/mobile-navigation-link";
import { cn } from "@/lib/utils";

import type { MainMenuType } from "@/lib/types/ui-types";

export const MobileNavigationSubmenu = ({
  item,
  position,
}: {
  item: MainMenuType;
  position: number;
}) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="transition-default relative flex flex-col items-center overflow-hidden">
      <button
        className="text-text-primary relative inline-flex items-center gap-1 text-xl font-medium"
        onClick={() => {
          trackMobileNavigationClick(pathname, position);
          setIsOpen((prev) => !prev);
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
          <MobileNavigationLink
            activePath={subItem.path}
            className="transition-default before:transition-default focus:before:bg-bg-success text-text-primary relative text-base font-medium before:absolute before:bottom-[-1px] before:start-0 before:h-[2px] before:w-0 before:content-[''] focus:outline-none focus:before:w-full"
            href={subItem.path}
            key={subItem.id}
            label={subItem.label}
            position={position}
            style={subItem.style}
          />
        ))}
      </div>
    </div>
  );
};
