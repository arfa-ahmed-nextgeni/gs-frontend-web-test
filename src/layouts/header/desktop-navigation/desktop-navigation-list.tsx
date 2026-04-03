import { ArrowDownIcon } from "@/components/icons/arrow-down-icon";
import { DesktopNavigationLink } from "@/layouts/header/desktop-navigation/desktop-navigation-link";
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

const getTrackingPayload = (
  item: MainMenuType,
  subMenuItem: SubMenuType | undefined,
  position: number
) => {
  const path = subMenuItem ? subMenuItem.path : item.path;
  const urlType = getUrlType(path ?? "");
  const title = subMenuItem ? subMenuItem.label : item.label;
  const categoryId =
    urlType === "category" || urlType === "brands"
      ? String(subMenuItem?.id ?? item.id)
      : undefined;

  return {
    categoryId,
    categoryMeta: subMenuItem
      ? {
          "category.id": String(subMenuItem.id),
          "category.name": subMenuItem.label,
        }
      : undefined,
    lpId: String(item.id),
    lpName: item.label,
    position,
    title,
    urlType,
  };
};

export const DesktopNavigationList = ({
  navigationItems,
}: {
  navigationItems: MainMenuType[];
}) => {
  const safeNavigationItems = Array.isArray(navigationItems)
    ? navigationItems
    : [];

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
              <DesktopNavigationLink
                className="text-text-primary before:transition-default group-hover:before:bg-bg-success relative inline-flex items-center py-4 text-sm font-medium before:absolute before:bottom-[-1px] before:start-0 before:h-[4px] before:w-0 before:content-[''] group-hover:outline-none group-hover:before:w-full"
                hoverLevel={ZIndexLevel.z5}
                href={finalPath}
                style={item.style || undefined}
                title={item.label}
                tracking={getTrackingPayload(item, undefined, index + 1)}
              >
                {item.label}

                {hasSubmenu && (
                  <ArrowDownIcon className="transition-default ms-1 group-hover:rotate-180" />
                )}
              </DesktopNavigationLink>
            ) : (
              <DesktopNavigationLink
                className="text-text-primary before:transition-default group-hover:before:bg-bg-success relative inline-flex items-center py-4 text-sm font-medium before:absolute before:bottom-[-1px] before:start-0 before:h-[4px] before:w-0 before:content-[''] group-hover:outline-none group-hover:before:w-full"
                href={finalPath}
                style={item.style || undefined}
                title={item.label}
                tracking={getTrackingPayload(item, undefined, index + 1)}
              >
                {item.label}
              </DesktopNavigationLink>
            )}

            {hasSubmenu && (
              <div className="transition-default group-hover:max-h-50 bg-bg-default absolute start-0 max-h-0 w-48 overflow-hidden rounded-b-xl group-hover:opacity-100">
                {item.subMenu?.map((menu) => {
                  if (!menu || !menu.id || !menu.label) {
                    return null;
                  }
                  const submenuPath = getCategoryUrl(menu.path || "");
                  return (
                    <DesktopNavigationLink
                      className={cn(
                        "text-text-primary border-border-base transition-default hover:bg-bg-surface flex items-center justify-between border-b px-7 py-2 text-sm last:border-none",
                        "hover:pl-10 hover:pr-7 rtl:hover:pl-7 rtl:hover:pr-10"
                      )}
                      hoverLevel={ZIndexLevel.z5}
                      href={submenuPath}
                      key={menu.id}
                      style={menu.style || undefined}
                      title={menu.label}
                      tracking={getTrackingPayload(item, menu, index + 1)}
                    >
                      {menu.label}
                    </DesktopNavigationLink>
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
