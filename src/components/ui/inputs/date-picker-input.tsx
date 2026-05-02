"use client";

import { useState } from "react";
import { DayPicker } from "react-day-picker";
import type { ClassNames } from "react-day-picker";
import { ar, enUS } from "react-day-picker/locale";

import Image from "next/image";

import dayjs from "dayjs";
import { useLocale } from "next-intl";

import CalendarIcon from "@/assets/icons/calendar-icon.svg";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type DatePickerInputProps = {
  containerProps?: React.ComponentProps<"div">;
  error?: boolean;
  helperText?: string;
  label?: string;
  /** Upper bound date in YYYY-MM-DD format */
  max?: string;
  /** Lower bound date in YYYY-MM-DD format */
  min?: string;
  name?: string;
  onBlur?: () => void;
  onChange?: (value: string) => void;
  /** Selected date in YYYY-MM-DD format */
  value?: string;
};

function formatDisplayDate(dateStr: string, locale: string): string {
  const date = dayjs(dateStr).toDate();

  return new Intl.DateTimeFormat(locale.startsWith("ar") ? "ar-SA" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

const calendarClassNames: Partial<ClassNames> = {
  button_next:
    "size-7 flex items-center justify-center rounded-lg text-text-secondary hover:bg-bg-surface transition-default disabled:opacity-30 disabled:pointer-events-none rtl:rotate-180",
  button_previous:
    "size-7 flex items-center justify-center rounded-lg text-text-secondary hover:bg-bg-surface transition-default disabled:opacity-30 disabled:pointer-events-none rtl:rotate-180",
  caption_label: "hidden",
  day: "relative p-0 text-center",
  day_button:
    "size-9 flex items-center justify-center rounded-lg text-sm font-normal text-text-primary hover:bg-bg-surface transition-default focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-bg-brand",
  disabled: "opacity-30 pointer-events-none",
  dropdown:
    "appearance-none min-w-[4.5rem] rounded-lg bg-bg-surface px-2 py-1 text-xs font-medium text-text-primary border border-transparent hover:border-border-base focus:outline-none focus:ring-1 focus:ring-bg-brand cursor-pointer",
  dropdown_root: "relative",
  dropdowns: "flex items-center gap-2",
  hidden: "invisible",
  month: "flex flex-col gap-4",
  month_caption: "flex items-center justify-between px-1",
  month_grid: "w-full border-collapse",
  months: "flex flex-col",
  nav: "flex items-center gap-1",
  outside: "opacity-40",
  root: "p-3",
  selected: "!bg-bg-muted-light !text-text-primary hover:!bg-bg-muted-light",
  today: "font-semibold text-text-brand",
  week: "flex mt-1",
  weekday: "text-text-secondary w-9 text-center text-xs font-normal py-1",
  weekdays: "flex",
};

export const DatePickerInput = ({
  containerProps,
  error,
  helperText,
  label,
  max,
  min,
  name,
  onBlur,
  onChange,
  value,
}: DatePickerInputProps) => {
  const locale = useLocale();
  const [open, setOpen] = useState(false);

  const isRtl = locale.startsWith("ar");
  const dateFnsLocale = locale.startsWith("ar") ? ar : enUS;

  const selected =
    value && dayjs(value).isValid() ? dayjs(value).toDate() : undefined;
  const maxDate = max ? dayjs(max).toDate() : undefined;
  const minDate = min ? dayjs(min).toDate() : undefined;

  const displayValue =
    value && dayjs(value).isValid() ? formatDisplayDate(value, locale) : "";

  const startMonth = minDate ?? dayjs().subtract(100, "years").toDate();
  const endMonth = maxDate ?? new Date();

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      onBlur?.();
    }
  };

  return (
    <div
      {...containerProps}
      className={cn("flex flex-col gap-2", containerProps?.className)}
    >
      <Popover onOpenChange={handleOpenChange} open={open}>
        <PopoverTrigger asChild>
          <div
            className="relative cursor-pointer"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setOpen(true);
            }}
            role="button"
            tabIndex={0}
          >
            <FloatingLabelInput
              error={error}
              helperText={helperText}
              inputProps={{
                className: "cursor-pointer",
                name,
                onChange: () => {},
                readOnly: true,
                tabIndex: -1,
                value: displayValue,
              }}
              label={label}
            />
            <div className="inset-e-5 pointer-events-none absolute top-1/2 -translate-y-1/2">
              <Image
                alt=""
                aria-hidden
                height={20}
                src={CalendarIcon}
                unoptimized
                width={20}
              />
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent align={isRtl ? "end" : "start"} className="w-auto p-0">
          <DayPicker
            captionLayout="dropdown"
            classNames={calendarClassNames}
            defaultMonth={selected ?? endMonth}
            dir={isRtl ? "rtl" : "ltr"}
            disabled={[
              ...(maxDate ? [{ after: maxDate }] : []),
              ...(minDate ? [{ before: minDate }] : []),
            ]}
            endMonth={endMonth}
            locale={dateFnsLocale}
            mode="single"
            onSelect={(date: Date | undefined) => {
              if (date) {
                onChange?.(dayjs(date).format("YYYY-MM-DD"));
              }
              setOpen(false);
            }}
            selected={selected}
            startMonth={startMonth}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
