import type { Document } from "@contentful/rich-text-types";

import type { ContentDisplayOn } from "@/lib/types/contentful/display-on";

export type NavHeaderData = {
  menuHeaderLabel?: string;
  seeAllLabel?: string;
  subMenu?: NavMenuEntryData[];
};

export type NavMenuEntryData = {
  fields?: {
    childMenu?: NavMenuEntryData[];
    configuration?: {
      brandsUrlKeys?: string[];
      style?: React.CSSProperties;
    };
    order?: string;
    slug?: string;
    subMenu?: NavMenuEntryData[];
    title?: string;
    url?: string;
  };
};

export type PromoBannerData = {
  configuration?: {
    style?: React.CSSProperties;
  };
  displayOn?: ContentDisplayOn;
  text: Document;
  url: string;
};
