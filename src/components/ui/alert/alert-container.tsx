"use client";

import { createContext, useContext, useState } from "react";

type AlertContextType = {
  dismissAlert: () => void;
};

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertContainer = ({ children }: React.PropsWithChildren) => {
  const [showAlert, setShowAlert] = useState(true);

  const dismissAlert = () => {
    setShowAlert(false);
  };

  return (
    <AlertContext.Provider value={{ dismissAlert }}>
      {showAlert ? children : null}
    </AlertContext.Provider>
  );
};

export const useAlertContext = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlertContext must be used within a AlertContainer");
  }
  return context;
};
