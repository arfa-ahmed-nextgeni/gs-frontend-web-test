import UaeFlag from "@/assets/flags/ae-flag.svg";
import ArFlag from "@/assets/flags/ar-flag.svg";
import BahrainFlag from "@/assets/flags/bh-flag.svg";
import EnFlag from "@/assets/flags/en-flag.svg";
import GlobalFlag from "@/assets/flags/global-flag.svg";
import IraqFlag from "@/assets/flags/iq-flag.svg";
import KuwaitFlag from "@/assets/flags/kw-flag.svg";
import OmanFlag from "@/assets/flags/om-flag.svg";
import SaudiFlag from "@/assets/flags/sa-flag.svg";
import { CurrencyEnum } from "@/graphql/graphql";
import {
  NEXT_PUBLIC_DOMAIN_AE,
  NEXT_PUBLIC_DOMAIN_BH,
  NEXT_PUBLIC_DOMAIN_BOULEVARD,
  NEXT_PUBLIC_DOMAIN_GLOBAL,
  NEXT_PUBLIC_DOMAIN_IQ,
  NEXT_PUBLIC_DOMAIN_KW,
  NEXT_PUBLIC_DOMAIN_OM,
  NEXT_PUBLIC_DOMAIN_SA,
} from "@/lib/config/client-env";

export const enum Locale {
  ar_AE = "ar-AE",
  ar_BH = "ar-BH",
  ar_boulevard = "ar-BLVD",
  ar_GLOBAL = "ar-GLOBAL",
  ar_IQ = "ar-IQ",
  ar_KW = "ar-KW",
  ar_OM = "ar-OM",
  ar_SA = "ar-SA",
  en_AE = "en-AE",
  en_BH = "en-BH",
  en_boulevard = "en-BLVD",
  en_GLOBAL = "en-GLOBAL",
  en_IQ = "en-IQ",
  en_KW = "en-KW",
  en_OM = "en-OM",
  en_SA = "en-SA",
}

export const enum LocalePathPrefix {
  AR = "/ar",
  EN = "/en",
}

export const DEFAULT_LOCALE = Locale.en_SA;

export const SUPPORTED_LOCALES = [
  Locale.ar_AE,
  Locale.ar_GLOBAL,
  Locale.ar_KW,
  Locale.ar_OM,
  Locale.ar_SA,
  Locale.en_AE,
  Locale.en_GLOBAL,
  Locale.en_KW,
  Locale.en_OM,
  Locale.en_SA,
  Locale.ar_boulevard,
  Locale.en_boulevard,
  Locale.ar_IQ,
  Locale.en_IQ,
  Locale.en_BH,
  Locale.ar_BH,
] as const;

export const enum CountryCode {
  Bahrain = "BH",
  Emirates = "AE",
  Global = "GLOBAL",
  Iraq = "IQ",
  Kuwait = "KW",
  Oman = "OM",
  Saudi = "SA",
}

export const enum LanguageCode {
  AR = "ar",
  EN = "en",
}

export const enum StoreCode {
  ar_ae = "ar_ae",
  ar_bh = "ar_bh",
  ar_boulevard = "ar_boulevard",
  ar_global = "ar_global",
  ar_iq = "ar_iq",
  ar_kw = "ar_kw",
  ar_om = "ar_om",
  ar_sa = "ar_sa",
  en_ae = "en_ae",
  en_bh = "en_bh",
  en_boulevard = "en_boulevard",
  en_global = "en_global",
  en_iq = "en_iq",
  en_kw = "en_kw",
  en_om = "en_om",
  en_sa = "en_sa",
}

export const GLOBAL_STORES = [StoreCode.en_global, StoreCode.ar_global];

export const STORE_TO_CURRENCY_CODE = {
  [StoreCode.ar_ae]: CurrencyEnum.Aed,
  [StoreCode.ar_bh]: CurrencyEnum.Bhd,
  [StoreCode.ar_boulevard]: CurrencyEnum.Sar,
  [StoreCode.ar_global]: CurrencyEnum.Usd,
  [StoreCode.ar_iq]: CurrencyEnum.Iqd,
  [StoreCode.ar_kw]: CurrencyEnum.Kwd,
  [StoreCode.ar_om]: CurrencyEnum.Omr,
  [StoreCode.ar_sa]: CurrencyEnum.Sar,
  [StoreCode.en_ae]: CurrencyEnum.Aed,
  [StoreCode.en_bh]: CurrencyEnum.Bhd,
  [StoreCode.en_boulevard]: CurrencyEnum.Sar,
  [StoreCode.en_global]: CurrencyEnum.Usd,
  [StoreCode.en_iq]: CurrencyEnum.Iqd,
  [StoreCode.en_kw]: CurrencyEnum.Kwd,
  [StoreCode.en_om]: CurrencyEnum.Omr,
  [StoreCode.en_sa]: CurrencyEnum.Sar,
} as const;

export const STORE_TO_LOCALE = {
  [StoreCode.ar_ae]: Locale.ar_AE,
  [StoreCode.ar_bh]: Locale.ar_BH,
  [StoreCode.ar_boulevard]: Locale.ar_boulevard,
  [StoreCode.ar_global]: Locale.ar_GLOBAL,
  [StoreCode.ar_iq]: Locale.ar_IQ,
  [StoreCode.ar_kw]: Locale.ar_KW,
  [StoreCode.ar_om]: Locale.ar_OM,
  [StoreCode.ar_sa]: Locale.ar_SA,
  [StoreCode.en_ae]: Locale.en_AE,
  [StoreCode.en_bh]: Locale.en_BH,
  [StoreCode.en_boulevard]: Locale.en_boulevard,
  [StoreCode.en_global]: Locale.en_GLOBAL,
  [StoreCode.en_iq]: Locale.en_IQ,
  [StoreCode.en_kw]: Locale.en_KW,
  [StoreCode.en_om]: Locale.en_OM,
  [StoreCode.en_sa]: Locale.en_SA,
} as const;

export const LOCALE_TO_STORE = {
  [Locale.ar_AE]: StoreCode.ar_ae,
  [Locale.ar_BH]: StoreCode.ar_bh,
  [Locale.ar_boulevard]: StoreCode.ar_boulevard,
  [Locale.ar_GLOBAL]: StoreCode.ar_global,
  [Locale.ar_IQ]: StoreCode.ar_iq,
  [Locale.ar_KW]: StoreCode.ar_kw,
  [Locale.ar_OM]: StoreCode.ar_om,
  [Locale.ar_SA]: StoreCode.ar_sa,
  [Locale.en_AE]: StoreCode.en_ae,
  [Locale.en_BH]: StoreCode.en_bh,
  [Locale.en_boulevard]: StoreCode.en_boulevard,
  [Locale.en_GLOBAL]: StoreCode.en_global,
  [Locale.en_IQ]: StoreCode.en_iq,
  [Locale.en_KW]: StoreCode.en_kw,
  [Locale.en_OM]: StoreCode.en_om,
  [Locale.en_SA]: StoreCode.en_sa,
} as const;

export const COUNTRY_CODE_TO_DOMAIN = {
  [CountryCode.Bahrain]: NEXT_PUBLIC_DOMAIN_BH,
  [CountryCode.Emirates]: NEXT_PUBLIC_DOMAIN_AE,
  [CountryCode.Global]: NEXT_PUBLIC_DOMAIN_GLOBAL,
  [CountryCode.Iraq]: NEXT_PUBLIC_DOMAIN_IQ,
  [CountryCode.Kuwait]: NEXT_PUBLIC_DOMAIN_KW,
  [CountryCode.Oman]: NEXT_PUBLIC_DOMAIN_OM,
  [CountryCode.Saudi]: NEXT_PUBLIC_DOMAIN_SA,
} as const;

export const LOCALE_TO_DOMAIN = {
  [Locale.ar_AE]: NEXT_PUBLIC_DOMAIN_AE,
  [Locale.ar_BH]: NEXT_PUBLIC_DOMAIN_BH,
  [Locale.ar_boulevard]: NEXT_PUBLIC_DOMAIN_BOULEVARD,
  [Locale.ar_GLOBAL]: NEXT_PUBLIC_DOMAIN_GLOBAL,
  [Locale.ar_IQ]: NEXT_PUBLIC_DOMAIN_IQ,
  [Locale.ar_KW]: NEXT_PUBLIC_DOMAIN_KW,
  [Locale.ar_OM]: NEXT_PUBLIC_DOMAIN_OM,
  [Locale.ar_SA]: NEXT_PUBLIC_DOMAIN_SA,
  [Locale.en_AE]: NEXT_PUBLIC_DOMAIN_AE,
  [Locale.en_BH]: NEXT_PUBLIC_DOMAIN_BH,
  [Locale.en_boulevard]: NEXT_PUBLIC_DOMAIN_BOULEVARD,
  [Locale.en_GLOBAL]: NEXT_PUBLIC_DOMAIN_GLOBAL,
  [Locale.en_IQ]: NEXT_PUBLIC_DOMAIN_IQ,
  [Locale.en_KW]: NEXT_PUBLIC_DOMAIN_KW,
  [Locale.en_OM]: NEXT_PUBLIC_DOMAIN_OM,
  [Locale.en_SA]: NEXT_PUBLIC_DOMAIN_SA,
} as const;

export const DOMAIN_TO_COUNTRY_CODE = {
  [NEXT_PUBLIC_DOMAIN_AE]: CountryCode.Emirates,
  [NEXT_PUBLIC_DOMAIN_BH]: CountryCode.Bahrain,
  [NEXT_PUBLIC_DOMAIN_BOULEVARD]: CountryCode.Saudi,
  [NEXT_PUBLIC_DOMAIN_GLOBAL]: CountryCode.Global,
  [NEXT_PUBLIC_DOMAIN_IQ]: CountryCode.Iraq,
  [NEXT_PUBLIC_DOMAIN_KW]: CountryCode.Kuwait,
  [NEXT_PUBLIC_DOMAIN_OM]: CountryCode.Oman,
  [NEXT_PUBLIC_DOMAIN_SA]: CountryCode.Saudi,
} as const;

export const COUNTRY_CODE_TO_FLAG = {
  [CountryCode.Bahrain]: BahrainFlag,
  [CountryCode.Emirates]: UaeFlag,
  [CountryCode.Global]: GlobalFlag,
  [CountryCode.Iraq]: IraqFlag,
  [CountryCode.Kuwait]: KuwaitFlag,
  [CountryCode.Oman]: OmanFlag,
  [CountryCode.Saudi]: SaudiFlag,
} as const;

export const COUNTRY_CODE_TO_NAME: Record<string, string> = {
  [CountryCode.Bahrain]: "Bahrain",
  [CountryCode.Emirates]: "UAE",
  [CountryCode.Global]: "Global",
  [CountryCode.Iraq]: "Iraq",
  [CountryCode.Kuwait]: "Kuwait",
  [CountryCode.Oman]: "Oman",
  [CountryCode.Saudi]: "Saudi Arabia",
};

export const LANGUAGE_SWITCH_OPTIONS = [
  {
    className: "font-gilroy",
    icon: EnFlag,
    value: LanguageCode.EN,
  },
  {
    className: "font-cairo",
    icon: ArFlag,
    value: LanguageCode.AR,
  },
] as const;

export const LOCALE_SWITCH_OPTIONS = [
  {
    arLocale: LanguageCode.AR,
    code: CountryCode.Saudi,
    domain: NEXT_PUBLIC_DOMAIN_SA,
    enLocale: LanguageCode.EN,
  },
  {
    arLocale: LanguageCode.AR,
    code: CountryCode.Kuwait,
    domain: NEXT_PUBLIC_DOMAIN_KW,
    enLocale: LanguageCode.EN,
  },
  {
    arLocale: LanguageCode.AR,
    code: CountryCode.Emirates,
    domain: NEXT_PUBLIC_DOMAIN_AE,
    enLocale: LanguageCode.EN,
  },
  {
    arLocale: LanguageCode.AR,
    code: CountryCode.Oman,
    domain: NEXT_PUBLIC_DOMAIN_OM,
    enLocale: LanguageCode.EN,
  },
  {
    arLocale: LanguageCode.AR,
    code: CountryCode.Global,
    domain: NEXT_PUBLIC_DOMAIN_GLOBAL,
    enLocale: LanguageCode.EN,
  },
] as const;

export const TABBY_TAMARA_INSTALLMENTS_ENABLED_STORES = [
  StoreCode.ar_sa,
  StoreCode.en_sa,
  StoreCode.ar_ae,
  StoreCode.en_ae,
];

export const LOCALE_TO_TIMEZONE = {
  [Locale.ar_AE]: "Asia/Dubai",
  [Locale.ar_BH]: "Asia/Bahrain",
  [Locale.ar_boulevard]: "Asia/Riyadh",
  [Locale.ar_GLOBAL]: "Asia/Riyadh",
  [Locale.ar_IQ]: "Asia/Baghdad",
  [Locale.ar_KW]: "Asia/Kuwait",
  [Locale.ar_OM]: "Asia/Muscat",
  [Locale.ar_SA]: "Asia/Riyadh",
  [Locale.en_AE]: "Asia/Dubai",
  [Locale.en_BH]: "Asia/Bahrain",
  [Locale.en_boulevard]: "Asia/Riyadh",
  [Locale.en_GLOBAL]: "Asia/Riyadh",
  [Locale.en_IQ]: "Asia/Baghdad",
  [Locale.en_KW]: "Asia/Kuwait",
  [Locale.en_OM]: "Asia/Muscat",
  [Locale.en_SA]: "Asia/Riyadh",
} as const;

export const ARABIC_ALPHABETS = [
  "ا",
  "ب",
  "ت",
  "ث",
  "ج",
  "ح",
  "خ",
  "د",
  "ذ",
  "ر",
  "ز",
  "س",
  "ش",
  "ص",
  "ض",
  "ط",
  "ظ",
  "ع",
  "غ",
  "ف",
  "ق",
  "ك",
  "ل",
  "م",
  "ن",
  "ه",
  "و",
  "ي",
] as const;
