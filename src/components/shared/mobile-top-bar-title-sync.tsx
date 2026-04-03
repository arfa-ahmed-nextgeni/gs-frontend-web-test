"use client";

import { useEffect } from "react";

import { useMobileTopBarContext } from "@/contexts/mobile-top-bar-context";

export const MobileTopBarTitleSync = ({ title }: { title: string }) => {
  const { setMobileTopBarTitle } = useMobileTopBarContext();

  useEffect(() => {
    setMobileTopBarTitle(title || null);

    return () => {
      setMobileTopBarTitle(null);
    };
  }, [setMobileTopBarTitle, title]);

  return null;
};
