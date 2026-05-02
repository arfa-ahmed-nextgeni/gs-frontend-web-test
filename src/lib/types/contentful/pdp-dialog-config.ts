import type { Document } from "@contentful/rich-text-types";

export type CashbackDialogContent = {
  imageHeight?: number;
  imageUrl: string;
  imageWidth?: number;
  title?: string;
};

export type OriginalProductDialogContent = {
  content: Document;
  title: string;
};

export type PdpDialogConfig = {
  cashback?: CashbackDialogContent;
  originalProduct?: OriginalProductDialogContent;
};

export type PdpDialogConfigAssetData = {
  fields?: {
    description?: string;
    file?: {
      contentType?: string;
      details?: {
        image?: {
          height: number;
          width: number;
        };
      };
      fileName?: string;
      url?: string;
    };
    title?: string;
  };
  sys?: {
    id?: string;
  };
};

export type PdpDialogConfigData = {
  items?: Array<{
    fields?: {
      cashbackDialogImage?: PdpDialogConfigAssetData;
      cashbackDialogTitle?: string;
      countryCode?: string;
      internalName?: string;
      originalProductDialogContent?: Document;
      originalProductDialogTitle?: string;
    };
  }>;
};
