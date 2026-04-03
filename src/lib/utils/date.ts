import dayjs from "dayjs";

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
