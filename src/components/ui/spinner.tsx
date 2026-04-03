import type { ComponentProps } from "react";

import Image from "next/image";

import SpinnerDarkIcon from "@/assets/icons/spinner-dark-icon.svg";
import SpinnerIcon from "@/assets/icons/spinner-icon.svg";
import { cn } from "@/lib/utils";

export const Spinner = ({
  className,
  label,
  size = 20,
  variant = "light",
  ...props
}: {
  label?: string;
  size?: number;
  variant?: "dark" | "light";
} & Omit<ComponentProps<typeof Image>, "alt" | "src" | "unoptimized">) => {
  return (
    <Image
      {...props}
      alt=""
      aria-hidden={label ? undefined : "true"}
      aria-label={label}
      className={cn("animate-spin", className)}
      height={size}
      src={variant === "dark" ? SpinnerDarkIcon : SpinnerIcon}
      unoptimized
      width={size}
    />
  );
};
