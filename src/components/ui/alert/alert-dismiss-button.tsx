"use client";

import { PropsWithChildren } from "react";

import { useAlertContext } from "@/components/ui/alert/alert-container";
import { Button } from "@/components/ui/button";

export const AlertDismissButton = ({ children }: PropsWithChildren) => {
  const { dismissAlert } = useAlertContext();

  return (
    <Button className="shadow-none" onClick={dismissAlert}>
      {children}
    </Button>
  );
};
