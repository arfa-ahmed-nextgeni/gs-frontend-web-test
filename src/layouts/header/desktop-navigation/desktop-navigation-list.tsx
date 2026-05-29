import { ArrowDownIcon } from "@/components/icons/arrow-down-icon";
import { BlurDiv } from "@/components/ui/blur-div";
import { DesktopNavigationLink } from "@/layouts/header/desktop-navigation/desktop-navigation-link";
import { getCategoryUrl } from "@/layouts/header/navigation-utils";
import { ZIndexLevel } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

import type { DesktopNavigationUrlType } from "@/lib/analytics/models/event-models";
import type {
  HeaderNavigationType,
  MainMenuType,
  SubMenuType,
} from "@/lib/types/ui-types";

const DESKTOP_SUBMENU_COLUMN_COUNT = 4;
const DESKTOP_SUBMENU_GRID_COLUMN_CLASSES: Record<number, string> = {
  1: "grid-cols-[172px]",
  2: "grid-cols-[172px_172px]",
  3: "grid-cols-[172px_172px_172px]",
  4: "grid-cols-[172px_172px_172px_172px]",
};

function getUrlType(path: string): DesktopNavigationUrlType {
  if (!path || typeof path !== "string") return "category";
  const p = path.toLowerCase();
  if (p.includes("/lp/")) return "lp";
  if (p.includes("brands")) return "brands";
  return "category";
}

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

const isValidSubmenuItem = (
  item: null | SubMenuType | undefined
): item is SubMenuType => Boolean(item && item.id && item.label);

const getSubmenuColumns = (
  subMenu: SubMenuType[] | undefined
): SubMenuType[][] => {
  const validItems = subMenu?.filter(isValidSubmenuItem) ?? [];

  if (validItems.length === 0) {
    return [];
  }

  const remainingItems = validItems.slice(1);
  const remainingColumnCount = Math.min(
    DESKTOP_SUBMENU_COLUMN_COUNT - 1,
    remainingItems.length
  );

  const columns = [validItems.slice(0, 1)];

  if (remainingColumnCount === 0) {
    return columns;
  }

  const itemsPerColumn = Math.ceil(
    remainingItems.length / remainingColumnCount
  );

  for (let i = 0; i < remainingColumnCount; i += 1) {
    const start = i * itemsPerColumn;
    const column = remainingItems.slice(start, start + itemsPerColumn);

    if (column.length > 0) {
      columns.push(column);
    }
  }

  return columns;
};

export const DesktopNavigationList = ({
  headerNavigation,
}: {
  headerNavigation: HeaderNavigationType;
}) => {
  const { items: navigationItems, menuHeaderLabel } = headerNavigation;
  const safeNavigationItems = Array.isArray(navigationItems)
    ? navigationItems
    : [];

  return (
    <nav className="transition-default relative flex flex-row justify-between">
      {safeNavigationItems.map((item: MainMenuType, index: number) => {
        if (!item || !item.id || !item.label) {
          return null;
        }

        const resolvedMenuHeaderLabel = getMenuHeaderLabel(
          menuHeaderLabel,
          item.label
        );
        const submenuColumns = getSubmenuColumns(item.subMenu);
        const hasSubmenu = submenuColumns.length > 0;
        const submenuGridColumnClass =
          DESKTOP_SUBMENU_GRID_COLUMN_CLASSES[submenuColumns.length];

        const finalPath = getCategoryUrl(item.path || "");

        const navigationItemContent = (
          <>
            <DesktopNavigationLink
              className="text-text-primary before:transition-default group-hover:before:bg-bg-success before:inset-s-0 relative inline-flex items-center py-4 text-sm font-medium before:absolute before:-bottom-px before:h-1 before:w-0 before:content-[''] group-hover:outline-none group-hover:before:w-full"
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

            {hasSubmenu && (
              <div className="transition-default bg-bg-default inset-s-0 absolute top-full z-10 grid w-full grid-rows-[0fr] overflow-hidden rounded-b-xl opacity-0 shadow-[0px_1px_1px_0px_rgba(0,0,0,0.05),0px_20px_36px_0px_rgba(55,73,87,0.1)] group-hover:grid-rows-[1fr] group-hover:opacity-100">
                <div className="min-h-0 overflow-hidden">
                  <div
                    className={cn(
                      "gap-x-25 px-7.5 pb-7.5 pt-8.75 grid",
                      submenuGridColumnClass
                    )}
                  >
                    {submenuColumns.map((column, columnIndex) => (
                      <div
                        className={cn(
                          "flex w-full min-w-0 flex-col items-start",
                          columnIndex === 0 ? "gap-2" : "gap-5"
                        )}
                        key={`${item.id}-${columnIndex}`}
                      >
                        {columnIndex === 0 && (
                          <DesktopNavigationLink
                            className="text-text-success transition-default hover:text-text-success pb-1.25 flex items-center gap-1 whitespace-nowrap text-sm font-bold"
                            href={finalPath}
                            title={resolvedMenuHeaderLabel}
                            tracking={getTrackingPayload(
                              item,
                              undefined,
                              index + 1
                            )}
                          >
                            {resolvedMenuHeaderLabel}
                            <ArrowDownIcon
                              className="-rotate-90 rtl:rotate-90"
                              fill="currentColor"
                            />
                          </DesktopNavigationLink>
                        )}

                        {column.map((menu) => (
                          <DesktopNavigationSubmenuItem
                            item={item}
                            key={menu.id}
                            menu={menu}
                            position={index + 1}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        );

        return hasSubmenu ? (
          <BlurDiv className="group" hoverLevel={ZIndexLevel.z5} key={item.id}>
            {navigationItemContent}
          </BlurDiv>
        ) : (
          <div className="group" key={item.id}>
            {navigationItemContent}
          </div>
        );
      })}
    </nav>
  );
};

function DesktopNavigationSubmenuItem({
  item,
  menu,
  position,
}: {
  item: MainMenuType;
  menu: SubMenuType;
  position: number;
}) {
  const submenuPath = getCategoryUrl(menu.path || "");
  const childMenu = menu.subMenu?.filter(isValidSubmenuItem) ?? [];
  const hasChildMenu = childMenu.length > 0;

  return (
    <div className="pb-1.25 flex w-full min-w-0 flex-col items-start gap-2.5">
      <DesktopNavigationLink
        className="text-text-primary transition-default hover:text-text-primary flex w-full min-w-0 items-center gap-1 whitespace-nowrap text-sm font-medium"
        href={submenuPath}
        style={menu.style || undefined}
        title={menu.label}
        tracking={getTrackingPayload(item, menu, position)}
      >
        <span className="block min-w-0 max-w-[calc(100%-1rem)] truncate">
          {menu.label}
        </span>
        <ArrowDownIcon
          className={cn(
            "shrink-0",
            hasChildMenu ? "" : "-rotate-90 rtl:rotate-90"
          )}
          fill="currentColor"
        />
      </DesktopNavigationLink>

      {hasChildMenu && (
        <div className="flex w-full min-w-0 flex-col items-start gap-2">
          {childMenu.map((child) => {
            const childPath = getCategoryUrl(child.path || "");

            return (
              <DesktopNavigationLink
                className="text-text-secondary transition-default hover:text-text-primary block w-full min-w-0 truncate whitespace-nowrap text-sm font-medium"
                href={childPath}
                key={child.id}
                style={child.style || undefined}
                title={child.label}
                tracking={getTrackingPayload(item, child, position)}
              >
                {child.label}
              </DesktopNavigationLink>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getMenuHeaderLabel(
  menuHeaderLabel: string | undefined,
  fallback: string
) {
  const normalizedMenuHeaderLabel = menuHeaderLabel?.trim();

  return normalizedMenuHeaderLabel || fallback;
}
