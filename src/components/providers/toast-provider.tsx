"use client";

import { createContext, ReactNode, useContext } from "react";

import Toast from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";

interface ToastContextType {
  hideToast: () => void;
  showError: (
    message?: string,
    description?: string,
    position?: "bottom" | "top",
    duration?: number
  ) => void;
  showInfo: (
    message?: string,
    description?: string,
    position?: "bottom" | "top",
    duration?: number
  ) => void;
  showResend: (
    message?: string,
    description?: string,
    position?: "bottom" | "top",
    duration?: number
  ) => void;
  showSuccess: (
    message?: string,
    description?: string,
    position?: "bottom" | "top",
    duration?: number
  ) => void;
  showToast: (
    type: "error" | "info" | "resend" | "success" | "warning",
    message?: string,
    description?: string,
    position?: "bottom" | "top",
    duration?: number
  ) => void;
  showWarning: (
    message?: string,
    description?: string,
    position?: "bottom" | "top",
    duration?: number
  ) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToastContext must be used within a ToastProvider");
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const {
    hideToast,
    showError,
    showInfo,
    showResend,
    showSuccess,
    showToast,
    showWarning,
    toastState,
  } = useToast();

  return (
    <ToastContext.Provider
      value={{
        hideToast,
        showError,
        showInfo,
        showResend,
        showSuccess,
        showToast,
        showWarning,
      }}
    >
      {children}
      <Toast
        description={toastState.description}
        duration={toastState.duration}
        isVisible={toastState.isVisible}
        message={toastState.message}
        onClose={hideToast}
        position={toastState.position}
        type={toastState.type}
      />
    </ToastContext.Provider>
  );
};
