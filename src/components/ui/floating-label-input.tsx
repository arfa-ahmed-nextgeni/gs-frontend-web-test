import Image from "next/image";

import ErrorIcon from "@/assets/icons/error-icon.svg";
import SuccessIcon from "@/assets/icons/success-icon.svg";
import { DateInputPickerButton } from "@/components/ui/date-input-picker-button.tsx";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const FloatingLabelInput = ({
  alwaysShowLabel,
  containerProps,
  dateInputPickerButtonProps,
  error,
  helperText,
  iconContainerProps,
  inputProps,
  label,
  labelProps,
  success,
}: {
  alwaysShowLabel?: boolean;
  containerProps?: React.ComponentProps<"div">;
  dateInputPickerButtonProps?: React.ComponentProps<
    typeof DateInputPickerButton
  >;
  error?: boolean;
  helperText?: string;
  iconContainerProps?: React.ComponentProps<"div">;
  inputProps?: React.ComponentProps<"input">;
  label?: string;
  labelProps?: React.ComponentProps<typeof Label>;
  success?: boolean;
}) => {
  const hasCustomPlaceholder =
    inputProps?.placeholder && inputProps.placeholder !== " ";

  return (
    <div
      {...containerProps}
      className={cn("flex flex-col gap-2", containerProps?.className)}
    >
      <div className="relative" data-input-container="true">
        <input
          data-slot="input"
          placeholder={hasCustomPlaceholder ? inputProps.placeholder : " "}
          {...inputProps}
          className={cn(
            "transition-default bg-bg-surface text-text-primary py-2.75 peer block w-full appearance-none rounded-xl border border-transparent px-5 text-lg font-normal outline-none",
            "hover:border-border-secondary",
            "focus:bg-bg-body focus:border-[#374957] focus:outline-none",
            "[&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:opacity-0",
            "disabled:text-text-placeholder disabled:border-transparent",
            {
              "border-border-accent": success,
              "border-border-danger": error,
            },
            inputProps?.className
          )}
          id={inputProps?.name}
        />

        {label && (
          <Label
            {...labelProps}
            className={cn(
              "bg-bg-surface text-text-secondary transition-default pointer-events-none absolute start-3.5 top-2 z-10 origin-[0] -translate-y-4 transform px-1.5 text-xs font-normal",
              alwaysShowLabel ? "opacity-100" : "opacity-0",
              hasCustomPlaceholder
                ? "peer-focus:[&>span]:bg-bg-body peer-focus:bg-transparent peer-focus:opacity-100 peer-focus:[&>span]:opacity-100"
                : [
                    "peer-hover:text-text-secondary",
                    "peer-focus:bg-bg-body peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:text-xs peer-focus:opacity-100",
                    "peer-placeholder-shown:text-text-placeholder peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-lg peer-placeholder-shown:opacity-100",
                  ],
              !alwaysShowLabel && "peer-disabled:opacity-0",
              {
                "text-text-accent peer-focus:[&>span]:bg-bg-body [&>span]:bg-bg-surface bg-transparent opacity-100 peer-focus:opacity-100 [&>span]:opacity-100 peer-focus:[&>span]:opacity-100":
                  success,
                "text-text-danger peer-focus:[&>span]:bg-bg-body [&>span]:bg-bg-surface bg-transparent opacity-100 peer-focus:opacity-100 [&>span]:opacity-100 peer-focus:[&>span]:opacity-100":
                  error,
              },
              labelProps?.className
            )}
            htmlFor={inputProps?.name}
          >
            <span
              className={cn(
                "-z-1 pointer-events-none absolute bottom-0 start-0 h-[60%] w-full opacity-0"
              )}
            />
            {label}
          </Label>
        )}

        {/* --- Custom Icons (e.g., card network logos) - Show even when error/success --- */}
        {iconContainerProps?.children && (
          <div
            {...iconContainerProps}
            className={cn(
              "absolute top-1/2 -translate-y-1/2",
              // Adjust position when error/success icons are present
              (error || success) && "end-14",
              iconContainerProps?.className
            )}
          >
            {iconContainerProps.children}
          </div>
        )}
        {/* --- Status Icons --- */}
        {error && (
          <div className="pointer-events-none absolute end-5 top-1/2 z-10 -translate-y-1/2">
            <Image
              alt="error"
              height={12}
              src={ErrorIcon}
              unoptimized
              width={12}
            />
          </div>
        )}
        {!error && success && (
          <div className="pointer-events-none absolute end-5 top-1/2 z-10 -translate-y-1/2">
            <Image
              alt="success"
              height={12}
              src={SuccessIcon}
              unoptimized
              width={12}
            />
          </div>
        )}

        <DateInputPickerButton
          hasStatus={!!error || !!success}
          inputName={inputProps?.name}
          {...dateInputPickerButtonProps}
        />
      </div>

      {/* --- Helper/Error Text (Fixed Height) --- */}
      {helperText && (
        <p
          className={cn("text-end text-xs font-normal transition-all", {
            "text-text-danger": error,
            "text-text-tertiary": !error,
          })}
        >
          {helperText}
        </p>
      )}
    </div>
  );
};
