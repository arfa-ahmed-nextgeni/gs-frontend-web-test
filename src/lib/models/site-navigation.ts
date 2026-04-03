import { CSSProperties } from "react";

import { NavHeaderData } from "@/lib/types/contentful/nav-header";
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

  constructor(data: NavHeaderData) {
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
          subMenu: fields.subMenu
            ? fields.subMenu
                .filter((item) => item && item.fields)
                .filter(({ fields }) => fields && fields.title)
                .map(({ fields }) => {
                  if (!fields) return null;

                  return new NavigationItem({
                    id: fields.title || "unknown",
                    label: fields.title || "Untitled",
                    path: fields.url || "#",
                    style: fields.configuration?.style,
                  });
                })
                .filter((item) => item !== null)
            : undefined,
        });
      })
      .filter((item) => item !== null);
  }
}
