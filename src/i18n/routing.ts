import { defineRouting } from "next-intl/routing";

import {
  NEXT_PUBLIC_DOMAIN_AE,
  NEXT_PUBLIC_DOMAIN_BH,
  NEXT_PUBLIC_DOMAIN_BOULEVARD,
  NEXT_PUBLIC_DOMAIN_FABIAN,
  NEXT_PUBLIC_DOMAIN_GLOBAL,
  NEXT_PUBLIC_DOMAIN_IQ,
  NEXT_PUBLIC_DOMAIN_KW,
  NEXT_PUBLIC_DOMAIN_OM,
  NEXT_PUBLIC_DOMAIN_SA,
  NEXT_PUBLIC_DOMAIN_SURRATI,
} from "@/lib/config/client-env";
import {
  DEFAULT_LOCALE,
  Locale,
  LocalePathPrefix,
  SUPPORTED_LOCALES,
} from "@/lib/constants/i18n";

export const routing = defineRouting({
  alternateLinks: false,
  defaultLocale: DEFAULT_LOCALE,

  domains: [
    {
      defaultLocale: Locale.ar_SA,
      domain: NEXT_PUBLIC_DOMAIN_SA,
      locales: [Locale.en_SA, Locale.ar_SA],
    },
    {
      defaultLocale: Locale.ar_KW,
      domain: NEXT_PUBLIC_DOMAIN_KW,
      locales: [Locale.en_KW, Locale.ar_KW],
    },
    {
      defaultLocale: Locale.ar_AE,
      domain: NEXT_PUBLIC_DOMAIN_AE,
      locales: [Locale.en_AE, Locale.ar_AE],
    },
    {
      defaultLocale: Locale.ar_OM,
      domain: NEXT_PUBLIC_DOMAIN_OM,
      locales: [Locale.en_OM, Locale.ar_OM],
    },
    {
      defaultLocale: Locale.en_GLOBAL,
      domain: NEXT_PUBLIC_DOMAIN_GLOBAL,
      locales: [Locale.en_GLOBAL, Locale.ar_GLOBAL],
    },
    {
      defaultLocale: Locale.ar_boulevard,
      domain: NEXT_PUBLIC_DOMAIN_BOULEVARD,
      locales: [Locale.en_boulevard, Locale.ar_boulevard],
    },
    {
      defaultLocale: Locale.ar_surrati,
      domain: NEXT_PUBLIC_DOMAIN_SURRATI,
      locales: [Locale.en_surrati, Locale.ar_surrati],
    },
    {
      defaultLocale: Locale.ar_fabian,
      domain: NEXT_PUBLIC_DOMAIN_FABIAN,
      locales: [Locale.en_fabian, Locale.ar_fabian],
    },
    {
      defaultLocale: Locale.ar_IQ,
      domain: NEXT_PUBLIC_DOMAIN_IQ,
      locales: [Locale.en_IQ, Locale.ar_IQ],
    },
    {
      defaultLocale: Locale.ar_BH,
      domain: NEXT_PUBLIC_DOMAIN_BH,
      locales: [Locale.en_BH, Locale.ar_BH],
    },
  ],
  localeDetection: false,

  localePrefix: {
    mode: "as-needed",
    prefixes: {
      [Locale.ar_AE]: LocalePathPrefix.AR,
      [Locale.ar_BH]: LocalePathPrefix.AR,
      [Locale.ar_boulevard]: LocalePathPrefix.AR,
      [Locale.ar_fabian]: LocalePathPrefix.AR,
      [Locale.ar_GLOBAL]: LocalePathPrefix.AR,
      [Locale.ar_IQ]: LocalePathPrefix.AR,
      [Locale.ar_KW]: LocalePathPrefix.AR,
      [Locale.ar_OM]: LocalePathPrefix.AR,
      [Locale.ar_SA]: LocalePathPrefix.AR,
      [Locale.ar_surrati]: LocalePathPrefix.AR,
      [Locale.en_AE]: LocalePathPrefix.EN,
      [Locale.en_BH]: LocalePathPrefix.EN,
      [Locale.en_boulevard]: LocalePathPrefix.EN,
      [Locale.en_fabian]: LocalePathPrefix.EN,
      [Locale.en_GLOBAL]: LocalePathPrefix.EN,
      [Locale.en_IQ]: LocalePathPrefix.EN,
      [Locale.en_KW]: LocalePathPrefix.EN,
      [Locale.en_OM]: LocalePathPrefix.EN,
      [Locale.en_SA]: LocalePathPrefix.EN,
      [Locale.en_surrati]: LocalePathPrefix.EN,
    },
  },

  locales: SUPPORTED_LOCALES,
});
