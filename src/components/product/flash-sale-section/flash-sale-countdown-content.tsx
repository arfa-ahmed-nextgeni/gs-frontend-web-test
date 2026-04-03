"use client";

import { useMemo } from "react";

import dayjs from "dayjs";
import { useTranslations } from "next-intl";

import { useThrottledNow } from "@/hooks/use-throttled-now";

export const FlashSaleCountdownContent = ({
  endTime,
}: {
  endTime: string;
  layout?: "desktop" | "mobile";
}) => {
  const now = useThrottledNow(1000);

  const t = useTranslations("HomePage.categoryProducts");

  const endTimeMs = useMemo(() => {
    const parsedEndTime = dayjs(endTime);

    return parsedEndTime.isValid() ? parsedEndTime.valueOf() : null;
  }, [endTime]);

  if (!now || endTimeMs === null) return null;

  const totalSeconds = Math.max(
    Math.floor((endTimeMs - now.valueOf()) / 1000),
    0
  );
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  const fields = [
    { label: t("days"), value: days },
    { label: t("hours"), value: hours },
    { label: t("minutes"), value: minutes },
    { label: t("seconds"), value: seconds },
  ];

  if (fields.every((field) => field.value === 0)) return null;

  return (
    <div className="mt-12 flex flex-col gap-2.5 lg:mb-10 lg:flex-row">
      {fields.map((item, idx) => (
        <div
          className="bg-bg-brand h-12.5 w-15 flex flex-col items-center justify-center rounded-xl py-5"
          key={idx}
        >
          <span className="text-text-inverse text-xl font-bold">
            {item.value}
          </span>
          <span className="text-text-success text-xs">{item.label}</span>
        </div>
      ))}
    </div>
  );
};
