import cardValidator from "card-validator";
import dayjs from "dayjs";

import { PaymentCardNetwork } from "@/lib/constants/payment-card";

export const detectPaymentCardNetwork = (bin: string) => {
  // Check for Mada FIRST (priority check) - Mada BINs might be incorrectly
  // identified as Mastercard by card-validator, so we need to check Mada before card-validator
  const cleanBin = bin.toString().replace(/\D/g, "");

  // Need at least 4 digits to start detection
  if (cleanBin.length < 4) {
    return PaymentCardNetwork.Unknown;
  }

  const madaBins = [
    "440647",
    "440795",
    "446404",
    "457865",
    "468540",
    "468541",
    "468542",
    "468543",
    "483010",
    "483011",
    "483012",
    "529741",
    "558848",
    "588845",
    "588846",
    "588847",
    "588848",
    "588849",
    "604906",
    "627606",
    "636120",
    "968201",
    "968202",
    "968203",
    "968204",
    "968205",
    "968206",
    "968207",
    "968208",
    "968209",
    "968210",
    "968211",
  ];

  const partialBin = cleanBin.substring(0, Math.min(cleanBin.length, 6));

  for (const madaBin of madaBins) {
    if (madaBin.startsWith(partialBin)) {
      return PaymentCardNetwork.Mada;
    }
  }

  if (cleanBin.length >= 6) {
    const numberValidation = cardValidator.number(bin);

    if (numberValidation.isPotentiallyValid) {
      const cardType = numberValidation.card?.type as PaymentCardNetwork;

      if (
        cardType === PaymentCardNetwork.Visa ||
        cardType === PaymentCardNetwork.Mastercard
      ) {
        return cardType;
      }
    }
  }

  return PaymentCardNetwork.Unknown;
};

export const formatPaymentCardExpiry = ({
  month,
  year,
}: {
  month: string;
  year: string;
}) => {
  const formattedMonth = month.padStart(2, "0");
  const formattedYear = year.slice(-2);
  return `${formattedMonth}/${formattedYear}`;
};

export const isPaymentCardExpired = ({
  month,
  year,
}: {
  month: string;
  year: string;
}) => {
  const expiryDate = dayjs(`${year}-${month.padStart(2, "0")}-01`).endOf(
    "month"
  );

  return dayjs().isAfter(expiryDate);
};

export const normalizePaymentCardNumber = (val: string) =>
  val.replace(/\D/g, "");

export const formatPaymentCardNumber = (value: string) => {
  const cleaned = normalizePaymentCardNumber(value);
  const formatted = cleaned.replace(/(\d{4})(?=\d)/g, "$1 ");
  return formatted.substring(0, 19);
};

export const formatPaymentCardExpiryDate = (value: string) => {
  const cleaned = normalizePaymentCardNumber(value);

  if (cleaned.length >= 2) {
    const month = cleaned.substring(0, 2);
    const year = cleaned.substring(2, 4);
    const monthNum = parseInt(month);

    if (monthNum > 12) {
      return "12" + (year ? "/" + year : "");
    }
    if (monthNum === 0) {
      return "01" + (year ? "/" + year : "");
    }

    return month + (year ? "/" + year : "");
  }

  return cleaned;
};

/**
 * Extracts BIN (Bank Identification Number) from payment card data.
 * For new cards, extracts first 6 digits from cardNumber.
 * For saved cards, uses the bin property from card data.
 *
 * @param cardNumber - Full card number (for new cards)
 * @param cardBin - BIN from saved card data (optional)
 * @returns BIN number (6 digits) or undefined if not available
 */
export function extractBinNumber(
  cardNumber?: string,
  cardBin?: string
): string | undefined {
  // For new cards: extract first 6 digits from cardNumber
  if (cardNumber && cardNumber.length >= 6) {
    return cardNumber.substring(0, 6);
  }

  // For saved cards: use BIN from card data
  if (cardBin && cardBin.length >= 6) {
    return cardBin.substring(0, 6);
  }

  return undefined;
}

/**
 * Parse card expiry like "05/25", "5/25", "05/2025" and return { month, year }.
 */
export function paymentCardExpiryToMonthYear(expiryRaw: string): {
  month: number;
  year: number;
} {
  const raw = expiryRaw.trim();

  // Accept formats: M/YY, MM/YY, MM/YYYY (allow spaces)
  const m = raw.match(/^(\d{1,2})\s*[\/\-]\s*(\d{2}|\d{4})$/);
  if (!m) {
    throw new Error(`cardExpiryToMonthYear: unexpected expiry format "${raw}"`);
  }

  const monthNum = Number(m[1]);
  const yearPart = m[2];

  // Convert 2-digit year to 4-digit (assume 2000-based, e.g. "25" -> 2025)
  const yearNum =
    yearPart.length === 2 ? 2000 + Number(yearPart) : Number(yearPart);

  return { month: monthNum, year: yearNum };
}
