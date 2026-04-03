"use client";

import { createContext, useCallback, useContext, useState } from "react";

import dynamic from "next/dynamic";

import {
  OtpLoginPopupSkeleton,
  RegistrationFormSkeleton,
} from "@/components/auth/auth-overlay-skeleton";
import { useStoreCode } from "@/hooks/i18n/use-store-code";
import { useSetUserProperties } from "@/hooks/use-set-user-properties";
import { shouldSuppressRegistration } from "@/lib/utils/auth-redirect";

const OtpLoginPopup = dynamic(
  () =>
    import("@/components/auth/otp-login-popup").then(
      (mod) => mod.OtpLoginPopup
    ),
  {
    loading: () => <OtpLoginPopupSkeleton />,
  }
);

const RegistrationForm = dynamic(
  () =>
    import("@/components/auth/registration-form").then(
      (mod) => mod.RegistrationForm
    ),
  {
    loading: () => <RegistrationFormSkeleton />,
  }
);

export type AuthUIContextType = {
  showOtpLoginPopup: () => void;
};

const AuthUIContext = createContext<AuthUIContextType | undefined>(undefined);

export const AuthUIProvider = ({ children }: React.PropsWithChildren) => {
  const { storeCode } = useStoreCode();

  // Set Amplitude user properties when customer data is available after login
  useSetUserProperties();

  const [isOtpPopupOpen, setIsOtpPopupOpen] = useState(false);
  const [isRegistrationFormOpen, setIsRegistrationFormOpen] = useState(false);

  const showOtpLoginPopup = () => {
    setIsOtpPopupOpen(true);
  };

  const closeOtpLoginPopup = useCallback(() => {
    setIsOtpPopupOpen(false);
  }, []);

  const handleShowRegistration = () => {
    if (shouldSuppressRegistration()) {
      return;
    }
    setIsRegistrationFormOpen(true);
  };

  const handleRegistrationSubmit = () => {
    setIsRegistrationFormOpen(false);
  };

  return (
    <AuthUIContext.Provider value={{ showOtpLoginPopup }}>
      {children}
      {isOtpPopupOpen ? (
        <OtpLoginPopup
          isOpen={isOtpPopupOpen}
          onCloseAction={closeOtpLoginPopup}
          onShowRegistration={handleShowRegistration}
          storeCode={storeCode}
        />
      ) : null}

      {isRegistrationFormOpen ? (
        <RegistrationForm
          isOpen={isRegistrationFormOpen}
          onClose={() => setIsRegistrationFormOpen(false)}
          onSubmit={handleRegistrationSubmit}
          storeCode={storeCode}
        />
      ) : null}
    </AuthUIContext.Provider>
  );
};

export const useAuthUI = () => {
  const context = useContext(AuthUIContext);
  if (!context) {
    throw new Error("useAuthUI must be used within a AuthUIProvider");
  }
  return context;
};
