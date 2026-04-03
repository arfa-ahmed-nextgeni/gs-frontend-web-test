"use client";

import { useEffect, useRef } from "react";

import Image from "next/image";

import CalendarIcon from "@/assets/icons/calendar-icon.svg";
import { cn } from "@/lib/utils";

export const DateInputPickerButton = ({
  hasStatus,
  inputName,
  showButton,
}: {
  hasStatus?: boolean;
  inputName?: string;
  showButton?: boolean;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputName) {
      inputRef.current = document.getElementById(inputName) as HTMLInputElement;
    }
  }, [inputName]);

  const handleClick = () => {
    inputRef.current?.focus();
    try {
      inputRef.current?.showPicker();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <button
      className={cn(
        "absolute end-5 top-1/2 hidden -translate-y-1/2 peer-[input[type='date']]:block",
        { "end-10": hasStatus },
        { block: showButton }
      )}
      onClick={handleClick}
      type="button"
    >
      <Image
        alt="calendar"
        height={20}
        src={CalendarIcon}
        unoptimized
        width={20}
      />
    </button>
  );
};
