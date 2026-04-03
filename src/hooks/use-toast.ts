"use client";

import { useCallback, useState } from "react";

import { ToastPosition, ToastType } from "@/components/ui/toast";

export interface ToastState {
  description?: string;
  duration?: number;
  isVisible: boolean;
  message?: string;
  position?: ToastPosition;
  type: ToastType;
}

export const useToast = () => {
  const [toastState, setToastState] = useState<ToastState>({
    description: "",
    duration: 3300,
    isVisible: false,
    message: "",
    position: "top",
    type: "success",
  });

  const showToast = useCallback(
    (
      type: ToastType,
      message?: string,
      description?: string,
      position: ToastPosition = "top",
      duration: number = 3300
    ) => {
      setToastState({
        description,
        duration,
        isVisible: true,
        message,
        position,
        type,
      });
    },
    []
  );

  const hideToast = useCallback(() => {
    setToastState((prev) => ({
      ...prev,
      isVisible: false,
    }));
  }, []);

  const showSuccess = useCallback(
    (
      message?: string,
      description?: string,
      position?: ToastPosition,
      duration?: number
    ) => {
      showToast("success", message, description, position, duration);
    },
    [showToast]
  );

  const showInfo = useCallback(
    (
      message?: string,
      description?: string,
      position?: ToastPosition,
      duration?: number
    ) => {
      showToast("info", message, description, position, duration);
    },
    [showToast]
  );

  const showWarning = useCallback(
    (
      message?: string,
      description?: string,
      position?: ToastPosition,
      duration?: number
    ) => {
      showToast("warning", message, description, position, duration);
    },
    [showToast]
  );

  const showError = useCallback(
    (
      message?: string,
      description?: string,
      position?: ToastPosition,
      duration?: number
    ) => {
      showToast("error", message, description, position, duration);
    },
    [showToast]
  );

  const showResend = useCallback(
    (
      message?: string,
      description?: string,
      position?: ToastPosition,
      duration?: number
    ) => {
      showToast("resend", message, description, position, duration);
    },
    [showToast]
  );

  return {
    hideToast,
    showError,
    showInfo,
    showResend,
    showSuccess,
    showToast,
    showWarning,
    toastState,
  };
};
