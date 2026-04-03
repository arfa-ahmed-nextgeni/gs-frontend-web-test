"use client";

import { useTranslations } from "next-intl";

import { NoInternetIcon } from "@/components/icons/no-internet-icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NoInternetFallbackProps = {
  className?: string;
  isRetrying?: boolean;
  onRetryAction: () => void;
};

export function NoInternetFallback({
  className,
  isRetrying = false,
  onRetryAction,
}: NoInternetFallbackProps) {
  const t = useTranslations("errors.noInternetFallback");

  return (
    <div
      className={cn(
        "flex min-h-full flex-col justify-between gap-8 py-5",
        className
      )}
    >
      <div className="flex flex-1 items-center justify-center">
        <section
          aria-label="No internet message"
          className="max-w-81.25 gap-7.5 flex flex-col items-center text-center"
        >
          <NoInternetIcon
            aria-hidden="true"
            className="h-17.5 w-21.25"
            focusable="false"
          />
          <div className="flex flex-col gap-2.5">
            <h2 className="text-text-primary text-base font-semibold leading-normal tracking-[0.32px]">
              {t("title")}
            </h2>
            <p className="text-text-placeholder text-sm font-medium leading-normal tracking-[0.28px]">
              {t("description")}
            </p>
          </div>
        </section>
      </div>
      <Button
        className="bg-bg-primary text-text-ghost hover:bg-bg-primary/90 h-12.5 w-full rounded-xl text-[20px] font-medium leading-normal tracking-[0.4px]"
        disabled={isRetrying}
        onClick={onRetryAction}
        type="button"
      >
        {t("retry")}
      </Button>
    </div>
  );
}
