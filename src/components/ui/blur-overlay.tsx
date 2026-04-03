"use client";

import { useBlurContext } from "@/contexts/blur-context";
import { cn } from "@/lib/utils";

export const BlurOverlay = ({
  onClick,
  visible,
  zIndexClass,
}: {
  onClick?: () => void;
  visible?: boolean;
  zIndexClass?: string;
}) => {
  const { blurZIndexLevel, clearHoverStack } = useBlurContext();

  const manualMode = visible !== undefined;

  const isShowing = manualMode ? !!visible : !!blurZIndexLevel;

  const finalZ = manualMode
    ? zIndexClass
    : blurZIndexLevel
      ? blurZIndexLevel
      : "";

  const handler = manualMode ? onClick : clearHoverStack;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "blur-overlay transition-default invisible fixed top-0 h-dvh w-full cursor-pointer bg-black/30 opacity-0 backdrop-blur-[2.50px] ltr:left-0 rtl:right-0",
        finalZ,
        {
          "invisible opacity-0": !isShowing,
          "visible opacity-100": isShowing,
        }
      )}
      onClick={handler}
    />
  );
};
