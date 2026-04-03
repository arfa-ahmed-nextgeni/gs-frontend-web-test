"use client";

import { useEffect, useState } from "react";

import Image from "next/image";

import { useTranslations } from "next-intl";

import CheckIcon from "@/assets/gifs/Login.gif";
import InfoIcon from "@/assets/gifs/New-Account.gif";
import WarningIcon from "@/assets/gifs/Notified.gif";
import ResendIcon from "@/assets/gifs/Resent.gif";
import ErrorIcon from "@/assets/gifs/Wrong.gif";
import { DEFAULT_TOAST_DURATION, ZIndexLevel } from "@/lib/constants/ui";

export type ToastPosition = "bottom" | "top";
export interface ToastProps {
  description?: string;
  duration?: number;
  isVisible: boolean;
  message?: string;
  onClose: () => void;
  position?: ToastPosition;
  type: ToastType;
}

export type ToastType = "error" | "info" | "resend" | "success" | "warning";

const toastConfig = {
  error: {
    bgGradient: "bg-gradient-to-r from-red-200 via-red-100 to-pink-100",
    borderColor: "border-red-200",
    icon: ErrorIcon,
    iconBg: "bg-red-500",
    progressColor: "bg-gradient-to-r from-red-400",
    translationKey: "error",
  },
  info: {
    bgGradient: "bg-gradient-to-r from-blue-200 via-blue-100 to-indigo-100",
    borderColor: "border-blue-200",
    icon: InfoIcon,
    iconBg: "bg-blue-500",
    progressColor: "bg-gradient-to-r from-blue-400",
    translationKey: "info",
  },
  resend: {
    bgGradient: "bg-gradient-to-r from-cyan-200 via-cyan-100 to-blue-100",
    borderColor: "border-cyan-200",
    icon: ResendIcon,
    iconBg: "bg-green-500",
    progressColor: "bg-gradient-to-r from-cyan-400",
    translationKey: "resend",
  },
  success: {
    bgGradient: "bg-gradient-to-r from-green-200 via-green-100 to-blue-100",
    borderColor: "border-green-200",
    icon: CheckIcon,
    iconBg: "bg-green-500",
    progressColor: "bg-gradient-to-r from-green-400",
    translationKey: "success",
  },
  warning: {
    bgGradient: "bg-gradient-to-r from-yellow-200 via-yellow-100 to-orange-100",
    borderColor: "border-yellow-200",
    icon: WarningIcon,
    iconBg: "bg-yellow-500",
    progressColor: "bg-gradient-to-r from-yellow-400",
    translationKey: "warning",
  },
};

export default function Toast({
  description,
  duration = DEFAULT_TOAST_DURATION,
  isVisible,
  message,
  onClose,
  position = "top",
  type,
}: ToastProps) {
  const [toastAnimation, setToastAnimation] = useState<
    "exiting" | "falling" | "visible"
  >("falling");
  const [toastProgress, setToastProgress] = useState(100);

  const config = toastConfig[type];
  const t = useTranslations("Toast");

  // Get translated messages if not provided
  const getTranslatedMessage = () => {
    if (message) return message;
    return t(`${config.translationKey}.message` as any);
  };

  const getTranslatedDescription = () => {
    if (description) return description;
    return t(`${config.translationKey}.description` as any);
  };

  useEffect(() => {
    if (isVisible) {
      setToastAnimation("falling");
      setToastProgress(100);

      const startTime = Date.now();
      let animationFrameId: number;

      const updateProgress = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.max(100 - (elapsed / duration) * 100, 0);

        const validProgress = Math.max(0, Math.min(100, progress));
        setToastProgress(validProgress);

        if (validProgress > 0) {
          animationFrameId = requestAnimationFrame(updateProgress);
        } else {
          setToastAnimation("exiting");
          setTimeout(() => {
            onClose();
            setToastAnimation("falling");
          }, 300);
        }
      };

      animationFrameId = requestAnimationFrame(updateProgress);

      const fallingTimer = setTimeout(() => {
        setToastAnimation("visible");
      }, 300);

      return () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
        clearTimeout(fallingTimer);
      };
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const positionClasses = {
    bottom: {
      exiting: "-bottom-32 scale-95 opacity-0",
      falling: "-bottom-32 scale-95 opacity-0",
      visible: "bottom-10 scale-100 opacity-100",
    },
    top: {
      exiting: "-top-32 scale-95 opacity-0",
      falling: "-top-32 scale-95 opacity-0",
      visible: "top-10 scale-100 opacity-100",
    },
  };

  return (
    <div
      className={`fixed left-1/2 -translate-x-1/2 transform transition-all duration-300 ease-out ${
        positionClasses[position][toastAnimation]
      } ${ZIndexLevel.z9999}`}
    >
      <div
        className={`relative min-h-[82px] w-[390px] rounded-xl border px-6 py-2 shadow-2xl backdrop-blur-md ${config.bgGradient} ${config.borderColor}`}
      >
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg">
              <Image
                alt={type}
                className="h-8 w-8 rounded-lg object-cover"
                height={32}
                src={config.icon}
                width={32}
              />
            </div>
          </div>

          {/* Text content */}
          <div className="flex flex-col">
            <span className="text-base font-bold text-gray-900 drop-shadow-sm">
              {getTranslatedMessage()}
            </span>
            {getTranslatedDescription() && (
              <span className="text-sm text-gray-700">
                {getTranslatedDescription()}
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 px-0">
          <div className="relative h-1 w-[385px] overflow-hidden rounded-full bg-gray-200">
            <div
              className={`absolute left-0 top-0 h-full rounded-full ${config.progressColor}`}
              style={{
                width: `${toastProgress}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
