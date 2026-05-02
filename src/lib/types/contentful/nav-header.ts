import type { Document } from "@contentful/rich-text-types";

export type NavHeaderData = {
  subMenu?: {
    fields?: {
      configuration?: {
        brandsUrlKeys?: string[];
        style?: React.CSSProperties;
      };
      order?: string;
      slug?: string;
      subMenu?: {
        fields?: {
          configuration?: {
            style?: React.CSSProperties;
          };
          order?: string;
          title?: string;
          url?: string;
        };
      }[];
      title?: string;
      url?: string;
    };
  }[];
};

export type PromoBannerData = {
  configuration?: {
    style?: React.CSSProperties;
  };
  text: Document;
  url: string;
};
