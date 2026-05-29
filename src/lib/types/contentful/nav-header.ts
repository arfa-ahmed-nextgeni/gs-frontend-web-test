import type { Document } from "@contentful/rich-text-types";

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
  text: Document;
  url: string;
};
