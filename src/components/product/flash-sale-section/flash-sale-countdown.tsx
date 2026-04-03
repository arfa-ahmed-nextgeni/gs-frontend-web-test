"use client";

import React, { useEffect, useState } from "react";

import dayjs from "dayjs";
import { useTranslations } from "next-intl";

import { useThrottledNow } from "@/hooks/use-throttled-now";

const FlashSaleCountdown = ({ endTime }: { endTime: string }) => {
  const now = useThrottledNow(1000);

  const t = useTranslations("HomePage.categoryProducts");

  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    setEndDate(endTime);
  }, [endTime]);

  if (!now || !endDate || !dayjs(endDate).isValid()) return null;

  const diff = dayjs(endTime).diff(now);
  const dur = dayjs.duration(Math.max(diff, 0));

  const fields = [
    { label: t("days"), value: dur.days() },
    { label: t("hours"), value: dur.hours() },
    { label: t("minutes"), value: dur.minutes() },
    { label: t("seconds"), value: dur.seconds() },
  ];

  if (fields.every((field) => field.value === 0)) return null;

  return (
    <div className="mt-12 flex flex-col gap-2.5 lg:mb-10 lg:flex-row">
      {fields.map((item, idx) => (
        <div
          className="bg-bg-brand flex h-[50px] w-[60px] flex-col items-center justify-center rounded-xl py-5"
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

export default FlashSaleCountdown;
