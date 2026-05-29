import { ArrowDownIcon } from "@/components/icons/arrow-down-icon";
import { Link } from "@/i18n/navigation";
import { MobileNavigationAccordionResetOnSectionChange } from "@/layouts/header/mobile-navigation/mobile-navigation-accordion-reset-on-section-change";
import { serializeMobileNavigationClickOriginPayload } from "@/layouts/header/mobile-navigation/mobile-navigation-click-origin-dataset";
import {
  MOBILE_NAVIGATION_ACCORDION_ATTRIBUTES,
  MOBILE_NAVIGATION_ROOT_ATTRIBUTES,
  MOBILE_NAVIGATION_SECTION_NAME,
} from "@/layouts/header/mobile-navigation/mobile-navigation-dom-constants";
import { getCategoryUrl } from "@/layouts/header/navigation-utils";
import { MOBILE_NAVIGATION_CLICK_ORIGIN_DATA_ATTRIBUTE } from "@/lib/constants/tracking-data-attributes";
import { ZIndexLevel } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

import type {
  HeaderNavigationType,
  MainMenuType,
  SubMenuType,
} from "@/lib/types/ui-types";

const MOBILE_NAVIGATION_LAYOUT_CLASS_NAME = "mobile-navigation-layout";

type NavigationItemWithSubMenu = { subMenu: SubMenuType[] } & MainMenuType;
type NavigationPanelContent = {
  headerItem: MainMenuType;
  menuItems: SubMenuType[];
};

type SelectableNavigationItem = {
  controlId: string;
  item: NavigationItemWithSubMenu;
  panelId: string;
};

type SubMenuItemWithSubMenu = { subMenu: SubMenuType[] } & SubMenuType;

export function MobileNavigationMenu({
  headerNavigation,
}: {
  headerNavigation: HeaderNavigationType;
}) {
  const {
    items: navigationItems,
    menuHeaderLabel,
    seeAllLabel,
  } = headerNavigation;
  const selectableItems = getSelectableNavigationItems(navigationItems);
  const selectableItemsById = getSelectableItemsById(selectableItems);

  return (
    <aside
      aria-label="Mobile menu"
      className={cn(
        "mobile-navigation-panel bg-bg-body flex h-[calc(100dvh-var(--mobile-header-height)-3.75rem-env(safe-area-inset-bottom))] flex-col overflow-hidden lg:hidden",
        ZIndexLevel.z30
      )}
      {...MOBILE_NAVIGATION_ROOT_ATTRIBUTES}
    >
      <MobileNavigationAccordionResetOnSectionChange />
      <MobileNavigationPanelSelectionStyles items={selectableItems} />
      <MobileNavigationSectionControls items={selectableItems} />

      <div className="mobile-navigation-layout grid min-h-0 flex-1 grid-cols-[minmax(8.75rem,33vw)_1fr] gap-2 overflow-hidden">
        <MobileNavigationMainMenu
          navigationItems={navigationItems}
          selectableItemsById={selectableItemsById}
        />
        <MobileNavigationPanels
          items={selectableItems}
          menuHeaderLabel={menuHeaderLabel}
          seeAllLabel={seeAllLabel}
        />
      </div>
    </aside>
  );
}

function getMenuHeaderLabel(
  menuHeaderLabel: string | undefined,
  fallback: string
) {
  const normalizedMenuHeaderLabel = menuHeaderLabel?.trim();

  return normalizedMenuHeaderLabel || fallback;
}

function getNavigationHref(path: string) {
  if (!path || path === "#") {
    return "#";
  }

  return getCategoryUrl(path);
}

function getNavigationPanelContent(
  item: NavigationItemWithSubMenu
): NavigationPanelContent {
  return {
    headerItem: item,
    menuItems: item.subMenu,
  };
}

function getPanelSelectionStyles(items: SelectableNavigationItem[]) {
  return items
    .map(
      ({ controlId, panelId }) => `
        #${controlId}:checked ~ .${MOBILE_NAVIGATION_LAYOUT_CLASS_NAME} label[for="${controlId}"] {
          background: var(--color-bg-success);
          font-weight: 700;
        }

        #${controlId}:checked ~ .${MOBILE_NAVIGATION_LAYOUT_CLASS_NAME} [data-mobile-navigation-panel="${panelId}"] {
          display: block;
        }
      `
    )
    .join("\n");
}

function getSelectableItemsById(items: SelectableNavigationItem[]) {
  const selectableItemsById = new Map<
    MainMenuType["id"],
    SelectableNavigationItem
  >();

  items.forEach((item) => {
    if (!selectableItemsById.has(item.item.id)) {
      selectableItemsById.set(item.item.id, item);
    }
  });

  return selectableItemsById;
}

function getSelectableNavigationItems(
  navigationItems: MainMenuType[]
): SelectableNavigationItem[] {
  return navigationItems.filter(hasSubMenu).map((item, index) => ({
    controlId: `mobile-navigation-control-${index}`,
    item,
    panelId: `mobile-navigation-panel-${index}`,
  }));
}

function getTrackingAttributes(position: number) {
  return {
    [MOBILE_NAVIGATION_CLICK_ORIGIN_DATA_ATTRIBUTE]:
      serializeMobileNavigationClickOriginPayload({ position }),
  };
}

function hasSubMenu<T extends MainMenuType | SubMenuType>(
  item: T | undefined
): item is { subMenu: SubMenuType[] } & T {
  return !!item?.subMenu?.length;
}

function MobileNavigationAccordionItem({
  defaultOpen,
  item,
  position,
  seeAllLabel,
}: {
  defaultOpen: boolean;
  item: SubMenuItemWithSubMenu;
  position: number;
  seeAllLabel?: string;
}) {
  const trackingAttributes = getTrackingAttributes(position);
  const href = getNavigationHref(item.path);
  const visibleSeeAllLabel = seeAllLabel?.trim() || undefined;
  const hasSeeAllLink = href !== "#" && !!visibleSeeAllLabel;

  return (
    <details
      className="bg-bg-default group relative"
      open={defaultOpen}
      {...MOBILE_NAVIGATION_ACCORDION_ATTRIBUTES}
    >
      <summary
        {...trackingAttributes}
        className={cn(
          "text-text-primary transition-default border-border-base group-open:bg-bg-body relative flex min-h-10 list-none items-center justify-between gap-5 border-b px-5 py-2.5 text-sm font-medium group-open:font-bold [&::-webkit-details-marker]:hidden",
          hasSeeAllLink ? "group-open:pe-25 pe-10" : "pe-10"
        )}
        style={item.style}
      >
        <MobileNavigationRowLabel label={item.label} />
        <span className="inset-e-5 absolute top-1/2 -translate-y-1/2">
          <MobileNavigationArrow variant="accordion" />
        </span>
      </summary>

      {hasSeeAllLink && (
        <Link
          {...trackingAttributes}
          className="text-text-secondary inset-e-10 absolute top-0 flex min-h-10 items-center px-1 text-xs font-normal"
          href={href}
          title={item.label}
        >
          {visibleSeeAllLabel}
        </Link>
      )}

      <div className="bg-bg-body flex flex-col gap-px">
        {item.subMenu.map((child) => (
          <MobileNavigationChildLink
            item={child}
            key={child.id}
            trackingAttributes={trackingAttributes}
          />
        ))}
      </div>
    </details>
  );
}

function MobileNavigationArrow({
  variant,
}: {
  variant: "accordion" | "link" | "placeholder";
}) {
  return (
    <ArrowDownIcon
      aria-hidden="true"
      className={cn(
        "size-3 shrink-0",
        variant === "accordion" && "transition-default group-open:rotate-180",
        variant === "link" && "-rotate-90 rtl:rotate-90",
        variant === "placeholder" && "opacity-0"
      )}
    />
  );
}

function MobileNavigationChildLink({
  item,
  trackingAttributes,
}: {
  item: SubMenuType;
  trackingAttributes: Record<string, string>;
}) {
  const href = getNavigationHref(item.path);

  return (
    <Link
      {...trackingAttributes}
      className="text-text-secondary border-border-base bg-bg-body min-h-7.5 py-1.25 flex items-center border-b px-5 text-sm font-medium"
      href={href}
      style={item.style}
      title={item.label}
    >
      {item.label}
    </Link>
  );
}

function MobileNavigationMainMenu({
  navigationItems,
  selectableItemsById,
}: {
  navigationItems: MainMenuType[];
  selectableItemsById: Map<MainMenuType["id"], SelectableNavigationItem>;
}) {
  return (
    <nav
      aria-label="Main menu"
      className="scrollbar-hidden bg-bg-default min-h-0 overflow-y-auto py-2"
    >
      {navigationItems.map((item, index) => (
        <MobileNavigationTopLevelItem
          item={item}
          key={item.id}
          position={index + 1}
          selectableItem={selectableItemsById.get(item.id)}
        />
      ))}
    </nav>
  );
}

function MobileNavigationPanel({
  item,
  menuHeaderLabel,
  panelId,
  seeAllLabel,
}: {
  item: NavigationItemWithSubMenu;
  menuHeaderLabel?: string;
  panelId: string;
  seeAllLabel?: string;
}) {
  return (
    <section
      aria-label={item.label}
      className="hidden"
      data-mobile-navigation-panel={panelId}
    >
      <MobileNavigationPanelContent
        item={item}
        menuHeaderLabel={menuHeaderLabel}
        seeAllLabel={seeAllLabel}
      />
    </section>
  );
}

function MobileNavigationPanelContent({
  item,
  menuHeaderLabel,
  seeAllLabel,
}: {
  item: NavigationItemWithSubMenu;
  menuHeaderLabel?: string;
  seeAllLabel?: string;
}) {
  const { headerItem, menuItems } = getNavigationPanelContent(item);

  return (
    <>
      <MobileNavigationPanelHeader
        item={headerItem}
        menuHeaderLabel={menuHeaderLabel}
      />

      {menuItems.map((subItem, index) => (
        <MobileNavigationSecondLevelItem
          defaultOpen={false}
          item={subItem}
          key={subItem.id}
          position={index + 1}
          seeAllLabel={seeAllLabel}
        />
      ))}
    </>
  );
}

function MobileNavigationPanelHeader({
  item,
  menuHeaderLabel,
}: {
  item: MainMenuType;
  menuHeaderLabel?: string;
}) {
  const href = getNavigationHref(item.path);
  const resolvedMenuHeaderLabel = getMenuHeaderLabel(
    menuHeaderLabel,
    item.label
  );

  if (href !== "#") {
    return (
      <Link
        className="text-text-primary bg-bg-default flex min-h-10 items-center justify-between gap-5 px-5 py-2.5 text-sm font-bold shadow-[0_1px_0_#f3f3f3]"
        href={href}
        title={resolvedMenuHeaderLabel}
      >
        <MobileNavigationRowLabel label={resolvedMenuHeaderLabel} />
        <MobileNavigationArrow variant="placeholder" />
      </Link>
    );
  }

  return (
    <div
      className="text-text-primary bg-bg-default flex min-h-10 items-center justify-between gap-5 px-5 py-2.5 text-sm font-bold shadow-[0_1px_0_#f3f3f3]"
      style={item.style}
    >
      <MobileNavigationRowLabel label={resolvedMenuHeaderLabel} />
      <MobileNavigationArrow variant="placeholder" />
    </div>
  );
}

function MobileNavigationPanels({
  items,
  menuHeaderLabel,
  seeAllLabel,
}: {
  items: SelectableNavigationItem[];
  menuHeaderLabel?: string;
  seeAllLabel?: string;
}) {
  return (
    <div className="scrollbar-hidden bg-bg-default min-h-0 overflow-y-auto py-2">
      {items.map(({ item, panelId }) => (
        <MobileNavigationPanel
          item={item}
          key={panelId}
          menuHeaderLabel={menuHeaderLabel}
          panelId={panelId}
          seeAllLabel={seeAllLabel}
        />
      ))}
    </div>
  );
}

function MobileNavigationPanelSelectionStyles({
  items,
}: {
  items: SelectableNavigationItem[];
}) {
  return <style>{getPanelSelectionStyles(items)}</style>;
}

function MobileNavigationRowLabel({ label }: { label: string }) {
  return <span className="min-w-0 truncate">{label}</span>;
}

function MobileNavigationSecondLevelItem({
  defaultOpen,
  item,
  position,
  seeAllLabel,
}: {
  defaultOpen: boolean;
  item: SubMenuType;
  position: number;
  seeAllLabel?: string;
}) {
  if (hasSubMenu(item)) {
    return (
      <MobileNavigationAccordionItem
        defaultOpen={defaultOpen}
        item={item}
        position={position}
        seeAllLabel={seeAllLabel}
      />
    );
  }

  return <MobileNavigationSecondLevelLink item={item} position={position} />;
}

function MobileNavigationSecondLevelLink({
  item,
  position,
}: {
  item: SubMenuType;
  position: number;
}) {
  const href = getNavigationHref(item.path);

  return (
    <Link
      {...getTrackingAttributes(position)}
      className="text-text-primary border-border-base bg-bg-default flex min-h-10 items-center justify-between gap-5 border-b px-5 py-2.5 text-sm font-medium"
      href={href}
      style={item.style}
      title={item.label}
    >
      <MobileNavigationRowLabel label={item.label} />
      <MobileNavigationArrow variant="link" />
    </Link>
  );
}

function MobileNavigationSectionControls({
  items,
}: {
  items: SelectableNavigationItem[];
}) {
  return (
    <>
      {items.map(({ controlId }, index) => (
        <input
          className="sr-only"
          defaultChecked={index === 0}
          id={controlId}
          key={controlId}
          name={MOBILE_NAVIGATION_SECTION_NAME}
          type="radio"
        />
      ))}
    </>
  );
}

function MobileNavigationTopLevelItem({
  item,
  position,
  selectableItem,
}: {
  item: MainMenuType;
  position: number;
  selectableItem: SelectableNavigationItem | undefined;
}) {
  const trackingAttributes = getTrackingAttributes(position);

  if (selectableItem) {
    return (
      <label
        {...trackingAttributes}
        className="text-text-primary transition-default flex min-h-10 w-full cursor-pointer items-center px-4 text-start text-sm font-medium"
        htmlFor={selectableItem.controlId}
        style={item.style}
      >
        {item.label}
      </label>
    );
  }

  const href = getNavigationHref(item.path);

  return (
    <Link
      {...trackingAttributes}
      className="text-text-primary transition-default flex min-h-10 w-full cursor-pointer items-center px-4 text-start text-sm font-medium"
      href={href}
      style={item.style}
      title={item.label}
    >
      {item.label}
    </Link>
  );
}
