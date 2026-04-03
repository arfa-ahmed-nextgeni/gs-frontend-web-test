"use client";

import React, { CSSProperties, useEffect, useRef, useState } from "react";

import cn from "classnames";
import { useLocale } from "next-intl";

interface TooltipProps {
  children: React.ReactNode;
  className?: string;
  content: React.ReactNode;
  delay?: number;
  position?: "bottom" | "left" | "right" | "top";
  rootclassName?: string;
  style?: CSSProperties;
}

export function Tooltip({
  children,
  className,
  content,
  delay = 300,
  position = "top",
  rootclassName,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const locale = useLocale();
  const isRTL = locale?.toLowerCase().startsWith("ar") ?? false;

  useEffect(() => {
    setIsMounted(true);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const showTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  // Get effective position (flip left/right in RTL)
  const effectivePosition =
    isRTL && position === "left"
      ? "right"
      : isRTL && position === "right"
        ? "left"
        : position;

  // Position classes based on the position prop
  const positionClasses = {
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  };

  // Arrow classes based on the position prop
  const arrowClasses = {
    bottom:
      "top-[-10px] left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent",
    left: "right-[-10px] top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent",
    right:
      "left-[-10px] top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent",
    top: "bottom-[-10px] left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent",
  };

  if (!isMounted) return <>{children}</>;

  return (
    <div
      className={cn("relative inline-block", rootclassName)}
      onBlur={hideTooltip}
      onFocus={showTooltip}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {React.cloneElement(
        children as React.ReactElement,
        {
          "aria-describedby": isVisible ? "tooltip" : undefined,
        } as { "aria-describedby"?: string | undefined }
      )}

      {isVisible && (
        <div
          className={cn(
            "absolute z-50 w-[180px] rounded-lg bg-[#FCE7F3] px-3 py-3 text-sm text-[#5D5D5D] shadow-lg sm:w-[250px]",
            isRTL ? "text-right" : "text-left",
            positionClasses[effectivePosition],
            className
          )}
          id="tooltip"
          ref={tooltipRef}
          role="tooltip"
          style={{
            overflowWrap: "break-word",
            wordWrap: "break-word",
          }}
        >
          <div className="break-words">{content}</div>
          <div
            className={cn(
              "border-5 absolute border-gray-800",
              arrowClasses[effectivePosition]
            )}
          />
        </div>
      )}
    </div>
  );
}
