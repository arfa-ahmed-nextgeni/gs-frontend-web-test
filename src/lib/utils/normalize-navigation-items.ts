import { normalizeStyles } from "@/lib/utils/style-normalization";

import type { MainMenuType, SubMenuType } from "@/lib/types/ui-types";

export function normalizeNavigationItems(
  items: MainMenuType[] | undefined
): MainMenuType[] {
  return (items ?? []).map((item) => ({
    id: String(item.id),
    label: item.label,
    path: item.path,
    style: normalizeStyles(item.style),
    subMenu: normalizeNavigationSubMenu(item.subMenu),
  }));
}

function normalizeNavigationSubMenu(
  items: SubMenuType[] | undefined
): SubMenuType[] | undefined {
  const navigationItems = items?.map((item) => ({
    id: String(item.id),
    image: item.image,
    label: item.label,
    path: item.path,
    style: normalizeStyles(item.style),
    subMenu: normalizeNavigationSubMenu(item.subMenu),
  }));

  return navigationItems?.length ? navigationItems : undefined;
}
