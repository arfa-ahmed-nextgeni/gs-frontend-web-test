import { ARABIC_ALPHABETS } from "@/lib/constants/i18n";

export type ArabicAlphabet = (typeof ARABIC_ALPHABETS)[number];

export type Brand = {
  image: string;
  name: string;
  uid: string;
  urlKey: string;
  urlPath: string;
};

export type GroupedBrands = Record<string, Brand[]>;
