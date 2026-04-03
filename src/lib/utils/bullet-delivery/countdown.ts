import dayjs, { type Dayjs } from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import type { Store } from "@/lib/models/stores";

dayjs.extend(utc);
dayjs.extend(timezone);

export interface BulletCountdownData {
  afterCutoff: boolean;
  hours?: number;
  minutes?: number;
  remainingMs: number;
  withinWindow: boolean;
}

/**
 * Get bullet delivery countdown data
 * Reuses logic from ProductDetailsBulletDeliveryBadge
 */
export function getBulletCountdownData(
  bulletConfig: null | Store["bulletDeliveryConfig"] | undefined,
  now: Dayjs | null | undefined
): BulletCountdownData | null {
  if (!bulletConfig || !now) return null;

  const { cutOffTime, endHour, startHour } = bulletConfig;
  if (!startHour || !endHour || !cutOffTime) return null;

  const storeTimezone = "Asia/Riyadh";

  const parseStoreTime = (timeStr: string) => {
    const [h = 0, m = 0, s = 0] = timeStr.split(":").map(Number);
    return dayjs().tz(storeTimezone).hour(h).minute(m).second(s);
  };

  const start = parseStoreTime(startHour);
  const end = parseStoreTime(endHour);
  const cutoff = parseStoreTime(cutOffTime);
  const nowDate = now.tz(storeTimezone);

  const withinWindow = nowDate.isAfter(start) && nowDate.isBefore(end);
  const afterCutoff = nowDate.isAfter(cutoff);

  if (afterCutoff) {
    return { afterCutoff, remainingMs: 0, withinWindow };
  }

  const remainingMs = end.diff(nowDate);
  if (remainingMs <= 0) {
    return { afterCutoff: false, remainingMs: 0, withinWindow };
  }

  const d = dayjs.duration(remainingMs);
  return {
    afterCutoff: false,
    hours: Math.floor(d.asHours()),
    minutes: d.minutes(),
    remainingMs,
    withinWindow,
  };
}

/**
 * Get bullet delivery countdown data based on city-specific time window
 * Used in checkout where city-specific time windows are applied
 */
export function getBulletCountdownDataByCity(
  city: null | string | undefined,
  bulletConfig: null | Store["bulletDeliveryConfig"] | undefined,
  now: Dayjs | null | undefined
): BulletCountdownData | null {
  if (!city || !bulletConfig || !now) return null;

  const cityTimeWindow = bulletConfig.cities?.[city];
  if (!cityTimeWindow) return null;

  // Parse time window format: "HH:mm:ss - HH:mm:ss"
  const [startTimeStr, endTimeStr] = cityTimeWindow
    .split(" - ")
    .map((s) => s.trim());
  if (!startTimeStr || !endTimeStr) return null;

  const storeTimezone = "Asia/Riyadh";

  const parseStoreTime = (timeStr: string) => {
    const [h = 0, m = 0, s = 0] = timeStr.split(":").map(Number);
    return dayjs().tz(storeTimezone).hour(h).minute(m).second(s);
  };

  const end = parseStoreTime(endTimeStr);
  const nowDate = now.tz(storeTimezone);

  const withinWindow =
    parseStoreTime(startTimeStr).isBefore(nowDate) && nowDate.isBefore(end);

  // For city-specific windows, we calculate remaining time until end of window
  const remainingMs = end.diff(nowDate);
  if (remainingMs <= 0) {
    return { afterCutoff: false, remainingMs: 0, withinWindow };
  }

  const d = dayjs.duration(remainingMs);
  return {
    afterCutoff: false,
    hours: Math.floor(d.asHours()),
    minutes: d.minutes(),
    remainingMs,
    withinWindow,
  };
}
