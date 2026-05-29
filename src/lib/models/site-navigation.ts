import { CSSProperties } from "react";

import {
  NavHeaderData,
  NavMenuEntryData,
} from "@/lib/types/contentful/nav-header";
import { MainMenuType, SubMenuType } from "@/lib/types/ui-types";

export class NavigationItem implements MainMenuType {
  public brandsUrlKeys?: string[];
  public id: string;
  public label: string;
  public path: string;
  public style?: CSSProperties;
  public subMenu?: SubMenuType[];

  constructor({
    brandsUrlKeys,
    id,
    label,
    path,
    style,
    subMenu,
  }: {
    brandsUrlKeys?: string[];
    className?: string;
    id: string;
    label: string;
    path: string;
    style?: CSSProperties;
    subMenu?: SubMenuType[];
  }) {
    this.id = id;
    this.label = label;
    this.path = path;
    this.subMenu = subMenu;
    this.style = style;
    this.brandsUrlKeys = brandsUrlKeys;
  }
}

export class SiteNavigation {
  public items: NavigationItem[];
  public menuHeaderLabel?: string;
  public seeAllLabel?: string;

  constructor(data: NavHeaderData) {
    this.menuHeaderLabel = data?.menuHeaderLabel;
    this.seeAllLabel = data?.seeAllLabel;

    // Handle case where data or subMenu might be undefined/null
    if (!data || !data.subMenu || !Array.isArray(data.subMenu)) {
      this.items = [];
      return;
    }

    this.items = data.subMenu
      .filter((item) => item && item.fields)
      .filter(({ fields }) => fields && (fields.title || fields.slug))
      .map(({ fields }) => {
        if (!fields) return null;

        return new NavigationItem({
          brandsUrlKeys: fields.configuration?.brandsUrlKeys,
          id: fields.slug || fields.title || "unknown",
          label: fields.title || "Untitled",
          path: fields.url || "#",
          style: fields.configuration?.style,
          subMenu: mapNavigationItems(fields.subMenu),
        });
      })
      .filter((item) => item !== null);
  }
}

function mapNavigationItems(
  items: NavMenuEntryData[] | undefined
): SubMenuType[] | undefined {
  if (!items || !Array.isArray(items)) {
    return undefined;
  }

  const navigationItems = items
    .filter((item) => item && item.fields)
    .filter(({ fields }) => fields && (fields.title || fields.slug))
    .map(({ fields }) => {
      if (!fields) return null;

      return new NavigationItem({
        id: fields.slug || fields.title || "unknown",
        label: fields.title || "Untitled",
        path: fields.url || "#",
        style: fields.configuration?.style,
        subMenu: mapNavigationItems(fields.childMenu),
      });
    })
    .filter((item) => item !== null);

  return navigationItems.length > 0 ? navigationItems : undefined;
}
