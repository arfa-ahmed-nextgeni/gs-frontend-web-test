import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import type { Locale } from "@/lib/constants/i18n";

dayjs.extend(utc);
dayjs.extend(timezone);

const KSA_TIME_ZONE = "Asia/Riyadh";

/**
 * Formats a date string to DD/MM/YYYY format.
 * Returns the original string if formatting fails.
 */
export function formatDate(dateString: string): string {
  try {
    return dayjs(dateString).format("DD/MM/YYYY");
  } catch {
    return dateString;
  }
}

/**
 * Parses a timezone-less order date as KSA time and formats it in the selected store's timezone.
 */
export function formatOrderDate(
  dateString: string,
  locale: Locale,
  options?: {
    formatLocale?: string;
    month?: "long" | "short";
  }
): string {
  const date = dayjs.tz(dateString, KSA_TIME_ZONE);

  if (!date.isValid()) return dateString;

  const timeZone = getStoreTimeZone(locale);

  if (options?.formatLocale?.startsWith("ar")) {
    const storeDate = date.tz(timeZone);
    const day = storeDate.date();
    const month = new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
      month: options.month ?? "long",
      timeZone,
    }).format(date.toDate());
    const year = storeDate.year();
    const hour = storeDate.hour();
    const minute = storeDate.minute().toString().padStart(2, "0");
    const period = hour >= 12 ? "مساءً" : "صباحاً";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;

    return `${day} ${month} ${year}, الساعة ${displayHour}:${minute} ${period}`;
  }

  return new Intl.DateTimeFormat(options?.formatLocale ?? "en-US", {
    day: "numeric",
    hour: "numeric",
    hour12: true,
    minute: "2-digit",
    month: options?.month ?? "short",
    timeZone,
    year: "numeric",
  }).format(date.toDate());
}

/**
 * Parses API timestamps without a timezone suffix as UTC.
 */
export function parseUtcDate(dateString: string): Date {
  return dayjs.utc(dateString).toDate();
}

function getStoreTimeZone(locale: Locale): string {
  if (locale.endsWith("-AE")) return "Asia/Dubai";
  if (locale.endsWith("-BH")) return "Asia/Bahrain";
  if (locale.endsWith("-IQ")) return "Asia/Baghdad";
  if (locale.endsWith("-KW")) return "Asia/Kuwait";
  if (locale.endsWith("-OM")) return "Asia/Muscat";
  if (locale.endsWith("-GLOBAL")) return "UTC";

  return KSA_TIME_ZONE;
}
