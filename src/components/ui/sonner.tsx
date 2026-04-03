"use client";

import React, { useEffect, useRef, useState } from "react";

import Image from "next/image";

import { toast as sonnerToast } from "sonner";

import CheckIcon from "@/assets/gifs/Login.gif";
import InfoIcon from "@/assets/gifs/New-Account.gif";
import WarningIcon from "@/assets/gifs/Notified.gif";
import ResendIcon from "@/assets/gifs/Resent.gif";
import ErrorIcon from "@/assets/gifs/Wrong.gif";
import RocketIcon from "@/assets/icons/rocket-icon.svg";
import { DEFAULT_TOAST_DURATION, ZIndexLevel } from "@/lib/constants/ui";

export interface ToastProps extends BaseToast {
  type: ToastType;
}

export type ToastType =
  | "bullet"
  | "error"
  | "info"
  | "resend"
  | "success"
  | "warning";

interface BaseToast {
  actionButton?: {
    onClick: () => void;
    title: string;
  };
  description?: string;
  duration?: number;
  position?: "bottom" | "top";
  title: string;
}

const toastConfig = {
  bullet: {
    bg: "bg-gradient-to-r from-green-200 via-green-100 to-blue-100",
    border: "border-green-200",
    icon: RocketIcon,
    iconBg: "bg-green-500",
    key: "bullet",
    progress: "bg-gradient-to-r from-green-400",
  },
  error: {
    bg: "bg-gradient-to-r from-red-200 via-red-100 to-pink-100",
    border: "border-red-200",
    icon: ErrorIcon,
    iconBg: "bg-red-500",
    key: "error",
    progress: "bg-gradient-to-r from-red-400",
  },
  info: {
    bg: "bg-gradient-to-r from-blue-200 via-blue-100 to-indigo-100",
    border: "border-blue-200",
    icon: InfoIcon,
    iconBg: "bg-blue-500",
    key: "info",
    progress: "bg-gradient-to-r from-blue-400",
  },
  resend: {
    bg: "bg-gradient-to-r from-cyan-200 via-cyan-100 to-blue-100",
    border: "border-cyan-200",
    icon: ResendIcon,
    iconBg: "bg-green-500",
    key: "resend",
    progress: "bg-gradient-to-r from-cyan-400",
  },
  success: {
    bg: "bg-gradient-to-r from-green-200 via-green-100 to-blue-100",
    border: "border-green-200",
    icon: CheckIcon,
    iconBg: "bg-green-500",
    key: "success",
    progress: "bg-gradient-to-r from-green-400",
  },
  warning: {
    bg: "bg-gradient-to-r from-yellow-200 via-yellow-100 to-orange-100",
    border: "border-yellow-200",
    icon: WarningIcon,
    iconBg: "bg-yellow-500",
    key: "warning",
    progress: "bg-gradient-to-r from-yellow-400",
  },
} as const;

const ProgressBar = ({
  color,
  duration,
}: {
  color: string;
  duration: number;
}) => {
  const [width, setWidth] = useState(100);
  const start = useRef<number>(Date.now());

  useEffect(() => {
    const dur = duration ?? DEFAULT_TOAST_DURATION;
    let raf: number;

    const step = () => {
      const elapsed = Date.now() - start.current;
      const pct = Math.max(100 - (elapsed / dur) * 100, 0);
      setWidth(pct);
      if (pct > 0) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [duration]);

  return (
    <div className="absolute bottom-0 left-1/2 h-1 w-full -translate-x-1/2 overflow-hidden rounded-full bg-gray-200">
      <div
        className={`absolute left-0 top-0 h-full rounded-full ${color}`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
};

const CustomToast = ({
  actionButton,
  description,
  duration,
  onDismiss,
  title,
  type,
}: {
  actionButton?: {
    onClick: () => void;
    title: string;
  };
  description?: string;
  duration: number;
  onDismiss?: () => void;
  title: string;
  type: ToastType;
}) => {
  const cfg = toastConfig[type];
  const customStyle = "style" in cfg && cfg.style ? cfg.style : undefined;

  return (
    <div
      className={`relative min-h-[82px] w-full rounded-xl border px-6 py-2 shadow-2xl backdrop-blur-md ${cfg.bg} ${cfg.border}`}
      style={{
        ...(customStyle || {}),
        zIndex: ZIndexLevel.z9999,
      }}
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg">
            <Image
              alt={type}
              className="h-8 w-8 rounded-lg object-cover"
              height={32}
              src={cfg.icon}
              width={32}
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-1">
          <span
            className="font-gilroy rtl:font-cairo text-base font-bold text-gray-900 drop-shadow-sm"
            dangerouslySetInnerHTML={{ __html: title }}
          />
          {description && (
            <span className="font-gilroy rtl:font-cairo text-sm text-gray-700">
              {description}
            </span>
          )}
          {actionButton && (
            <button
              className="block text-start text-sm font-medium text-[#6543F5] underline transition-colors hover:text-[#5a3ae0] active:text-[#4f32cc]"
              onClick={() => {
                actionButton.onClick();
                onDismiss?.();
              }}
              type="button"
            >
              {actionButton.title}
            </button>
          )}
        </div>
      </div>

      <ProgressBar color={cfg.progress} duration={duration} />
    </div>
  );
};

export function toast({
  actionButton,
  description,
  duration,
  position = "top",
  title,
  type,
}: ToastProps) {
  const sonnerPos = position === "bottom" ? "bottom-center" : "top-center";

  return sonnerToast.custom(
    (id) => {
      return (
        <CustomToast
          actionButton={actionButton}
          description={description}
          duration={duration ?? DEFAULT_TOAST_DURATION}
          key={id}
          onDismiss={() => sonnerToast.dismiss(id)}
          title={title}
          type={type}
        />
      );
    },
    {
      className: "w-full",
      duration: duration ?? DEFAULT_TOAST_DURATION,
      id: `custom-${Date.now()}`,
      position: sonnerPos as any,
    }
  );
}
