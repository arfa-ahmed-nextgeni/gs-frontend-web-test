type FormatPriceOpts = {
  maximumFractionDigits?: number;
  minimumFractionDigits?: number;
  useCurrencyDisplayCode?: boolean;
  useGrouping?: boolean;
};

const formatterCache = new Map<string, Intl.NumberFormat>();
const currencyConfig = {
  AED: {
    match: [/AED/i, /د\.إ/],
    symbol: "<",
  },
  SAR: {
    match: [/SAR/i, /ر\.س/],
    symbol: ">",
  },
} as const;

type SupportedCurrencyCode = keyof typeof currencyConfig;

export function findCurrencyConfig(price?: string) {
  const match = (
    Object.entries(currencyConfig) as Array<
      [SupportedCurrencyCode, (typeof currencyConfig)[SupportedCurrencyCode]]
    >
  ).find(([, config]) => config.match.some((regex) => regex.test(price || "")));

  if (!match) {
    return null;
  }

  const [code, config] = match;

  return {
    code,
    ...config,
  };
}

export function formatPrice({
  amount,
  currencyCode,
  locale = "en-US",
  options,
}: {
  amount: number;
  currencyCode: string;
  locale?: string;
  options?: FormatPriceOpts;
}): string {
  const min = options?.minimumFractionDigits ?? 0;
  const max = options?.maximumFractionDigits ?? 0;
  const currencyDisplay = options?.useCurrencyDisplayCode ? "code" : "symbol";
  const useGrouping = options?.useGrouping ?? true;

  const formatter = getFormatter(
    locale,
    currencyCode,
    min,
    max,
    currencyDisplay,
    useGrouping
  );

  return formatter.format(amount);
}

function getFormatter(
  locale: string,
  currency: string,
  minFraction = 0,
  maxFraction = 0,
  currencyDisplay: "code" | "symbol" = "symbol",
  useGrouping = true
) {
  const key = `${locale}:${currency}:${minFraction}:${maxFraction}:${currencyDisplay}:${useGrouping}`;
  let f = formatterCache.get(key);
  if (!f) {
    f = new Intl.NumberFormat(locale, {
      currency,
      currencyDisplay,
      maximumFractionDigits: maxFraction,
      minimumFractionDigits: minFraction,
      numberingSystem: "latn",
      style: "currency",
      useGrouping,
    });
    formatterCache.set(key, f);
  }
  return f;
}
