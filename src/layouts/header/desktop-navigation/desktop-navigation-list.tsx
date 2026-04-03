"use client";

import { ArrowDownIcon } from "@/components/icons/arrow-down-icon";
import { BlurLink } from "@/components/ui/blur-link";
import { Link } from "@/i18n/navigation";
import { usePathname } from "@/i18n/navigation";
import { clickOriginTrackingManager } from "@/lib/analytics/click-origin-tracking-manager";
import { trackDesktopNavigation } from "@/lib/analytics/events";
import { ROUTES } from "@/lib/constants/routes";
import { ZIndexLevel } from "@/lib/constants/ui";
import { MainMenuType, SubMenuType } from "@/lib/types/ui-types";
import { cn } from "@/lib/utils";

import type { DesktopNavigationUrlType } from "@/lib/analytics/models/event-models";

function getUrlType(path: string): DesktopNavigationUrlType {
  if (!path || typeof path !== "string") return "category";
  const p = path.toLowerCase();
  if (p.includes("/lp/")) return "lp";
  if (p.includes("brands")) return "brands";
  return "category";
}

const getCategoryUrl = (path: string): string => {
  if (!path || typeof path !== "string") {
    return "/";
  }

  if (path.includes("/category/") || path.includes("/categories/")) {
    const parts = path.split("/");
    const categorySlug = parts[parts.length - 1];
    return `/c/${categorySlug}`;
  }
  if (path.startsWith("/c/")) {
    return path;
  }
  if (!path.startsWith("/") && !path.includes("http")) {
    return `/c/${path}`;
  }

  return path;
};

// Track navigation click with Lp and optional Category data
const handleNavClick = (
  item: MainMenuType,
  subMenuItem: SubMenuType | undefined,
  position: number,
  currentLpId?: string
) => {
  const path = subMenuItem ? subMenuItem.path : item.path;
  const urlType = getUrlType(path ?? "");
  const title = subMenuItem ? subMenuItem.label : item.label;
  const categoryId =
    urlType === "category" || urlType === "brands"
      ? String(subMenuItem?.id ?? item.id)
      : undefined;

  clickOriginTrackingManager.setClickOrigin({
    lp_id: currentLpId,
    origin: "top_menu",
    position,
  });

  trackDesktopNavigation(
    {
      category_id: categoryId,
      lp_id: String(item.id),
      lp_name: item.label,
      title,
      type: "webview",
      url_type: urlType,
    },
    subMenuItem
      ? {
          "category.id": String(subMenuItem.id),
          "category.name": subMenuItem.label,
        }
      : undefined
  );
};

export const DesktopNavigationList = ({
  navigationItems,
}: {
  navigationItems: MainMenuType[];
}) => {
  const pathname = usePathname();
  const safeNavigationItems = Array.isArray(navigationItems)
    ? navigationItems
    : [];

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

  const currentLpId = getCurrentLpId();

  return (
    <nav className="transition-default flex flex-row justify-between">
      {safeNavigationItems.map((item: MainMenuType, index: number) => {
        if (!item || !item.id || !item.label) {
          return null;
        }

        const hasSubmenu = Boolean(
          item?.subMenu &&
            Array.isArray(item.subMenu) &&
            item.subMenu.length > 0
        );

        const finalPath = getCategoryUrl(item.path || "");

        return (
          <div className="group relative" key={item.id}>
            {hasSubmenu ? (
              <BlurLink
                className="text-text-primary before:transition-default group-hover:before:bg-bg-success relative inline-flex items-center py-4 text-sm font-medium before:absolute before:bottom-[-1px] before:start-0 before:h-[4px] before:w-0 before:content-[''] group-hover:outline-none group-hover:before:w-full"
                hoverLevel={ZIndexLevel.z5}
                href={finalPath}
                onClick={() =>
                  handleNavClick(item, undefined, index + 1, currentLpId)
                }
                prefetch={false}
                style={item.style || undefined}
                title={item.label}
              >
                {item.label}

                {hasSubmenu && (
                  <ArrowDownIcon className="transition-default ms-1 group-hover:rotate-180" />
                )}
              </BlurLink>
            ) : (
              <Link
                className="text-text-primary before:transition-default group-hover:before:bg-bg-success relative inline-flex items-center py-4 text-sm font-medium before:absolute before:bottom-[-1px] before:start-0 before:h-[4px] before:w-0 before:content-[''] group-hover:outline-none group-hover:before:w-full"
                href={finalPath}
                onClick={() =>
                  handleNavClick(item, undefined, index + 1, currentLpId)
                }
                prefetch={false}
                style={item.style || undefined}
                title={item.label}
              >
                {item.label}
              </Link>
            )}

            {hasSubmenu && (
              <div className="transition-default group-hover:max-h-50 bg-bg-default absolute start-0 max-h-0 w-48 overflow-hidden rounded-b-xl group-hover:opacity-100">
                {item.subMenu?.map((menu) => {
                  if (!menu || !menu.id || !menu.label) {
                    return null;
                  }
                  const submenuPath = getCategoryUrl(menu.path || "");
                  return (
                    <BlurLink
                      className={cn(
                        "text-text-primary border-border-base transition-default hover:bg-bg-surface flex items-center justify-between border-b px-7 py-2 text-sm last:border-none",
                        "hover:pl-10 hover:pr-7 rtl:hover:pl-7 rtl:hover:pr-10"
                      )}
                      hoverLevel={ZIndexLevel.z5}
                      href={submenuPath}
                      key={menu.id}
                      onClick={() =>
                        handleNavClick(item, menu, index + 1, currentLpId)
                      }
                      style={menu.style || undefined}
                      title={menu.label}
                    >
                      {menu.label}
                    </BlurLink>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
};
