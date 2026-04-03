"use client";

import Image from "next/image";

import DiscountIcon from "@/assets/icons/discount-icon.svg";
import { cn } from "@/lib/utils";

export function ActionItem({ label, leftIconSrc, onClick, right }: any) {
  return (
    <li
      className="border-(--color-border-base) flex cursor-pointer items-center justify-between border-t px-4 py-3 first:border-t-0"
      onClick={onClick}
    >
      <span className="flex items-center gap-3">
        {leftIconSrc ? <Icon src={leftIconSrc} /> : null}
        <span className="text-(--color-text-primary)">{label}</span>
      </span>
      {right ? (
        <span className="flex h-5 w-5 shrink-0 items-center justify-center">
          {right}
        </span>
      ) : null}
    </li>
  );
}

export function ActionList({ children }: { children: React.ReactNode }) {
  return <ul className="text-sm">{children}</ul>;
}

export function Icon({
  className,
  onClickAction,
  size = 20,
  src,
}: {
  className?: string;
  onClickAction?: () => void;
  size?: number;
  src?: string;
}) {
  if (!src) return null;
  return (
    <Image
      alt=""
      className={cn("shrink-0 opacity-80", className)}
      height={size}
      onClick={onClickAction}
      src={src}
      width={size}
    />
  );
}

export function PerkItem({
  label,
  right,
}: {
  label: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <li className="border-(--color-border-base) flex items-center justify-between border-t px-4 py-2.5 first:border-t-0">
      <span className="text-(--color-text-primary)">{label}</span>
      {right ? <span className="shrink-0">{right}</span> : null}
    </li>
  );
}

export function PerkList({ children }: { children: React.ReactNode }) {
  return <ul className="text-sm">{children}</ul>;
}

export function RotatingIcon({
  active,
  activeSrc,
  inactiveSrc,
  onClickAction,
  size = 18,
}: {
  active: boolean;
  activeSrc: string;
  inactiveSrc: string;
  onClickAction?: (
    e?: React.MouseEvent<HTMLImageElement | HTMLSpanElement>
  ) => void;
  size?: number;
}) {
  return (
    <span
      className={cn(
        "duration-450 inline-block transition-transform ease-in-out",
        active ? "scale-x-[-1]" : "scale-x-[1]",
        onClickAction && "cursor-pointer"
      )}
    >
      <Icon
        onClickAction={onClickAction}
        size={size}
        src={active ? activeSrc : inactiveSrc}
      />
    </span>
  );
}

export function Row({
  bold,
  label,
  labelClass,
  value,
  valueClass,
}: {
  bold?: boolean;
  label: React.ReactNode;
  labelClass?: string;
  value: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between text-sm",
        bold && "font-semibold"
      )}
    >
      <span
        className={cn(
          bold && "text-text-primary font-gilroy font-semibold",
          labelClass
        )}
      >
        {label}
      </span>
      <span className={cn(valueClass)}>{value}</span>
    </div>
  );
}

// --- Shared item UI ---
export const CouponRow = ({
  disabled = false,
  label,
  labelClasses,
  leftIcon = DiscountIcon,
  onClick,
  right,
}: {
  disabled?: boolean;
  label: React.ReactNode;
  labelClasses?: string;
  leftIcon?: string;
  onClick?: () => void;
  right?: React.ReactNode;
}) => (
  <li
    className={cn(
      "border-border-base flex items-center justify-between rounded-t-lg bg-white px-4 py-2.5",
      !disabled && "cursor-pointer"
    )}
    onClick={disabled ? undefined : onClick}
  >
    <span className="flex items-center gap-3">
      <Image
        alt="discount icon"
        className="size-5 opacity-80"
        height={20}
        src={leftIcon}
        width={20}
      />
      <span className={cn("text-text-primary", labelClasses)}>{label}</span>
    </span>
    <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center")}>
      {right}
    </span>
  </li>
);
