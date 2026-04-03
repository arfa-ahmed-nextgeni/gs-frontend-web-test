"use client";

import React, { createContext, useContext, useState } from "react";

interface MobileModalContextType {
  isMobileModalOpen: boolean;
  setIsMobileModalOpen: (isOpen: boolean) => void;
}

const MobileModalContext = createContext<MobileModalContextType | undefined>(
  undefined
);

export function MobileModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);

  return (
    <MobileModalContext.Provider
      value={{
        isMobileModalOpen,
        setIsMobileModalOpen,
      }}
    >
      {children}
    </MobileModalContext.Provider>
  );
}

export function useMobileModal() {
  const context = useContext(MobileModalContext);
  if (context === undefined) {
    throw new Error("useMobileModal must be used within a MobileModalProvider");
  }
  return context;
}
