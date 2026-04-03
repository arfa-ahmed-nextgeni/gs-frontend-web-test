import { useMemo } from "react";

import dayjs from "dayjs";

import { useThrottledNow } from "@/hooks/use-throttled-now";
import { CountdownTimer } from "@/lib/types/product/countdown-timer";

export const useProductCountdownTimer = ({
  countdownTimer,
}: {
  countdownTimer?: CountdownTimer | null;
}) => {
  const storeTimezone = "Asia/Riyadh";
  const now = useThrottledNow(1000);

  const countdownData = useMemo(() => {
    // Return null during SSR when time is not available
    if (!now) return null;
    if (!countdownTimer || !countdownTimer.enabled) return null;

    const nowDate = dayjs(now).tz(storeTimezone);
    const startDate = dayjs.tz(countdownTimer.startDate, storeTimezone);
    const endDate = dayjs.tz(countdownTimer.endDate, storeTimezone);

    if (nowDate.isBefore(startDate) || nowDate.isAfter(endDate)) {
      return null;
    }

    const diffMs = endDate.diff(nowDate);
    const durationObj = dayjs.duration(diffMs);

    const days = Math.floor(durationObj.asDays());
    const hours = Math.floor(durationObj.asHours()) % 24;
    const minutes = durationObj.minutes();
    const seconds = durationObj.seconds();

    return { days, hours, minutes, seconds };
  }, [countdownTimer, now, storeTimezone]);

  return { countdownData };
};
