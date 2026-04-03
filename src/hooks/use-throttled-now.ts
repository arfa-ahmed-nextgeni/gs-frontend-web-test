import { useMemo } from "react";

import dayjs, { Dayjs } from "dayjs";

import { useNow } from "@/hooks/use-now";

export function useThrottledNow(intervalMs: number): Dayjs | null {
  const now = useNow();
  const bucket = useMemo(() => {
    if (!now) return null;
    return Math.floor(now.valueOf() / intervalMs);
  }, [now, intervalMs]);

  return useMemo(() => {
    if (bucket === null) return null;
    return dayjs(bucket * intervalMs);
  }, [bucket, intervalMs]);
}
