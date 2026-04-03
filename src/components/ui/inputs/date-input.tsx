"use client";

import { ChangeEvent, ComponentProps, useEffect, useRef } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import dayjs from "dayjs";

import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { cn } from "@/lib/utils";

export const DateInput = (props: ComponentProps<typeof FloatingLabelInput>) => {
  const { control } = useFormContext();

  const inputRef = useRef<HTMLInputElement>(null);

  const dateValue = useWatch({
    control,
    name: props.inputProps?.name || "",
  });

  useEffect(() => {
    if (props.inputProps?.name) {
      inputRef.current = document.getElementById(
        props.inputProps.name
      ) as HTMLInputElement;
    }
  }, [props.inputProps?.name]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const minDate = props.inputProps?.min;
    const maxDate = props.inputProps?.max;

    const selectedDate = e.target.value;
    let finalSelectedDate = selectedDate;

    if (selectedDate) {
      const selectedDayjs = dayjs(selectedDate);
      const maxDayjs = dayjs(maxDate);
      const minDayjs = dayjs(minDate);

      // If the selected date is after max date
      if (maxDate && selectedDayjs.isAfter(maxDate)) {
        // Keep the same month and day, but set year to max year
        const adjustedDate = selectedDayjs.year(maxDayjs.year());

        // If the adjusted date is still after max date (e.g., Feb 29 in non-leap year)
        // then set it to the max date
        const finalDate = adjustedDate.isAfter(maxDayjs)
          ? maxDayjs
          : adjustedDate;

        finalSelectedDate = finalDate.format("YYYY-MM-DD");
      } else if (minDate && selectedDayjs.isBefore(minDayjs)) {
        let adjustedDate = selectedDayjs.year(minDayjs.year());

        // Handle edge cases like leap year (Feb 29)
        if (!adjustedDate.isValid()) {
          adjustedDate = dayjs()
            .year(minDayjs.year())
            .month(selectedDayjs.month())
            .endOf("month");
        }

        // If still before min date, use min date
        if (adjustedDate.isBefore(minDayjs)) {
          finalSelectedDate = `${minDate}`;
        } else {
          finalSelectedDate = adjustedDate.format("YYYY-MM-DD");
        }
      } else {
        finalSelectedDate = selectedDate;
      }
    } else {
      finalSelectedDate = selectedDate;
    }

    if (props.inputProps?.onChange) {
      props.inputProps.onChange({
        target: { value: finalSelectedDate },
      } as unknown as ChangeEvent<HTMLInputElement>);
    }
  };

  const handleFocus = () => {
    if (inputRef.current) {
      inputRef.current.focus();

      try {
        inputRef.current.showPicker();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className="relative flex flex-col">
      <FloatingLabelInput
        {...props}
        inputProps={{
          ...props.inputProps,
          onChange: handleChange,
        }}
      />
      <FloatingLabelInput
        containerProps={{
          className: cn("absolute w-full", {
            hidden: !!dateValue,
          }),
        }}
        dateInputPickerButtonProps={{
          inputName: props.inputProps?.name,
          showButton: true,
        }}
        inputProps={{
          name: `${props.inputProps?.name}-dummy`,
          onFocus: handleFocus,
          placeholder: props.inputProps?.placeholder,
          type: "text",
        }}
      />
    </div>
  );
};
