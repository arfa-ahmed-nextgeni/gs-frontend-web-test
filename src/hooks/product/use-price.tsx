import { useMemo } from "react";

import { useLocale } from "next-intl";

export function formatPrice({
  amount,
  currencyCode,
  locale,
}: {
  amount: number;
  currencyCode: string;
  locale: string;
}): string {
  const formatCurrency = new Intl.NumberFormat(locale, {
    currency: currencyCode,
    maximumFractionDigits: 0,
    style: "currency",
  });

  return formatCurrency.format(amount);
}

export function formatVariantPrice({
  amount,
  baseAmount,
  currencyCode,
  locale,
}: {
  amount: number;
  baseAmount: number;
  currencyCode: string;
  locale: string;
}): {
  basePrice: null | string;
  discount: null | string;
  price: string;
} {
  const hasDiscount = baseAmount > amount;
  const formatDiscount = new Intl.NumberFormat(locale, { style: "percent" });
  const discount = hasDiscount
    ? formatDiscount.format((baseAmount - amount) / baseAmount)
    : null;

  const price = formatPrice({ amount, currencyCode, locale });
  const basePrice = hasDiscount
    ? formatPrice({ amount: baseAmount, currencyCode, locale })
    : null;

  return { basePrice, discount, price };
}

export default function usePrice(
  data?: {
    amount: number;
    baseAmount?: number;
    currencyCode: string;
  } | null
): {
  basePrice: null | string;
  discount: null | string;
  price: string;
} {
  const { amount, baseAmount, currencyCode } = data ?? {};
  const locale = useLocale();

  const value = useMemo(() => {
    if (typeof amount !== "number" || !currencyCode) return "";

    return baseAmount !== undefined
      ? formatVariantPrice({ amount, baseAmount, currencyCode, locale })
      : formatPrice({ amount, currencyCode, locale });
  }, [amount, baseAmount, currencyCode, locale]);

  return typeof value === "string"
    ? { basePrice: null, discount: null, price: value }
    : value;
}
