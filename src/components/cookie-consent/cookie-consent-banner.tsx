"use client";

import type { ReactNode } from "react";

import Image from "next/image";

import CookieIcon from "@/assets/icons/cookie-icon.svg";
import { cn } from "@/lib/utils";

type CookieConsentBannerProps = {
  allowButtonLabel: string;
  className?: string;
  declineButtonLabel: string;
  description: ReactNode;
  onAllowAction?: () => void;
  onDeclineAction?: () => void;
};

export function CookieConsentBanner({
  allowButtonLabel,
  className,
  declineButtonLabel,
  description,
  onAllowAction,
  onDeclineAction,
}: CookieConsentBannerProps) {
  return (
    <section
      className={cn(
        "bg-bg-primary gap-4.25 px-7.5 pb-7.5 pt-7.25 lg:px-7.5 flex flex-col overflow-hidden rounded-2xl shadow-[0px_12px_24px_-6px_rgba(96,96,96,0.15),0px_0px_1px_0px_rgba(96,96,96,0.1)] lg:flex-row lg:items-center lg:gap-2.5 lg:py-4",
        className
      )}
      data-slot="cookie-consent-banner"
    >
      <div className="flex min-w-0 items-start gap-2.5 lg:flex-1 lg:items-center">
        <div className="bg-bg-success flex size-9 shrink-0 items-center justify-center rounded-xl">
          <Image
            alt=""
            aria-hidden
            className="rtl:rotate-270 size-5"
            height={20}
            src={CookieIcon}
            width={20}
          />
        </div>

        <div className="text-text-inverse min-w-0 flex-1 text-start text-sm font-medium leading-5 tracking-[0.02em] rtl:text-xs rtl:leading-4 lg:rtl:text-sm lg:rtl:leading-5 [&_p]:m-0">
          {description}
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <button
          className="transition-default bg-bg-default text-text-primary min-w-25 lg:min-w-auto h-7 rounded-lg px-2.5 text-xs font-semibold tracking-[0.02em] transition-colors hover:bg-[#ececec] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c5e86c] rtl:font-bold"
          onClick={onDeclineAction}
          type="button"
        >
          {declineButtonLabel}
        </button>
        <button
          className="transition-default bg-bg-success text-text-primary min-w-25 lg:min-w-auto h-7 rounded-lg px-2.5 text-xs font-semibold tracking-[0.02em] transition-colors hover:bg-[#b8db60] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f9f9f9] rtl:font-bold"
          onClick={onAllowAction}
          type="button"
        >
          {allowButtonLabel}
        </button>
      </div>
    </section>
  );
}
