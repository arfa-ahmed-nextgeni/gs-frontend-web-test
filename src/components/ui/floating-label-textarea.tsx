import Image from "next/image";

import ErrorIcon from "@/assets/icons/error-icon.svg";
import SuccessIcon from "@/assets/icons/success-icon.svg";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const FloatingLabelTextArea = ({
  containerProps,
  error,
  helperText,
  label,
  labelProps,
  success,
  textareaProps,
}: {
  containerProps?: React.ComponentProps<"div">;
  error?: boolean;
  helperText?: string;
  label?: string;
  labelProps?: React.ComponentProps<typeof Label>;
  success?: boolean;
  textareaProps?: React.ComponentProps<"textarea">;
}) => {
  return (
    <div
      {...containerProps}
      className={cn("flex flex-col gap-2", containerProps?.className)}
    >
      <div className="relative">
        <textarea
          data-slot="textarea"
          placeholder=" "
          {...textareaProps}
          className={cn(
            "transition-default bg-bg-surface text-text-primary py-2.75 peer block w-full resize-none appearance-none rounded-xl border border-transparent px-5 text-lg font-normal outline-none",
            "hover:border-border-secondary",
            "focus:bg-bg-body focus:border-[#374957] focus:outline-none",
            "disabled:text-text-placeholder disabled:border-transparent",
            {
              "border-border-accent": success,
            },
            textareaProps?.className
          )}
          id={textareaProps?.name}
        />
        {label && (
          <Label
            {...labelProps}
            className={cn(
              "bg-bg-surface text-text-secondary transition-default pointer-events-none absolute start-3.5 top-2 z-10 origin-[0] -translate-y-4 transform px-1.5 text-xs font-normal opacity-0 hover:cursor-text",
              "peer-hover:text-text-secondary",
              "peer-focus:bg-bg-body peer-focus:top-1 peer-focus:-translate-y-4 peer-focus:text-xs peer-focus:opacity-100",
              "peer-placeholder-shown:text-text-placeholder peer-placeholder-shown:top-1 peer-placeholder-shown:-translate-y-4 peer-placeholder-shown:text-lg peer-placeholder-shown:opacity-100",
              "peer-disabled:opacity-0",
              {
                "text-text-accent opacity-100": success,
                "text-text-danger opacity-100": error,
              },
              labelProps?.className
            )}
            htmlFor={textareaProps?.name}
          >
            {label}
          </Label>
        )}
        {error && (
          <div className="pointer-events-none absolute end-5 top-2 -translate-y-1/2">
            <Image
              alt="error"
              height={12}
              src={ErrorIcon}
              unoptimized
              width={12}
            />
          </div>
        )}
        {success && (
          <div className="pointer-events-none absolute end-5 top-2 -translate-y-1/2">
            <Image
              alt="success"
              height={12}
              src={SuccessIcon}
              unoptimized
              width={12}
            />
          </div>
        )}
      </div>
      {helperText && (
        <p
          className={cn("text-end text-xs font-normal", {
            "text-text-danger": error,
          })}
        >
          {helperText}
        </p>
      )}
    </div>
  );
};
