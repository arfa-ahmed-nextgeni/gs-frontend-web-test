"use client";

import { useEffect, useState } from "react";

import dayjs from "dayjs";

export const ProductReviewDate = ({ date }: { date: string }) => {
  const [formattedDate, setFormattedDate] = useState<string>("");

  useEffect(() => {
    setFormattedDate(dayjs.utc(date).local().format("DD/MM/YYYY"));
  }, [date]);

  return (
    <p className="text-text-placeholder text-xs font-normal">{formattedDate}</p>
  );
};
