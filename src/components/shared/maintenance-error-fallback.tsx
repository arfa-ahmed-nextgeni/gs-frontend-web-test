"use client";

import Image from "next/image";

import MaintenanceIcon from "@/assets/icons/maintenance-icon.svg";

type MaintenanceErrorFallbackProps = {
  description: string;
  homeHref?: string;
  homeLabel?: string;
  isRetrying?: boolean;
  onRetry: () => void;
  reloadLabel?: string;
  retryingLabel?: string;
  retryLabel: string;
  title: string;
};

export function MaintenanceErrorFallback({
  description,
  homeHref = "/",
  homeLabel = "Go to homepage",
  isRetrying = false,
  onRetry,
  reloadLabel = "Reload page",
  retryingLabel,
  retryLabel,
  title,
}: MaintenanceErrorFallbackProps) {
  return (
    <main className="text-text-primary max-w-107.5 mx-auto flex h-[calc(100dvh-123px)] w-full flex-col items-center justify-center px-5">
      <div />
      <section
        aria-label="Maintenance message"
        className="gap-7.5 flex flex-col items-center text-center"
      >
        <Image
          alt=""
          aria-hidden="true"
          className="size-21.25"
          height={85}
          priority
          src={MaintenanceIcon}
          width={85}
        />
        <div className="flex flex-col gap-2.5">
          <h1 className="text-text-primary m-0 text-base font-semibold leading-normal tracking-[0.32px]">
            {title}
          </h1>
          <p className="text-text-placeholder max-w-81.25 m-0 text-sm font-medium leading-normal tracking-[0.28px]">
            {description}
          </p>
        </div>
      </section>
      <div className="max-w-97.5 mt-8 flex w-full flex-col gap-3">
        <button
          className="bg-bg-primary text-text-ghost h-12.5 w-full cursor-pointer rounded-xl border-0 text-[20px] font-medium leading-normal tracking-[0.4px] disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isRetrying}
          onClick={onRetry}
          type="button"
        >
          {isRetrying && retryingLabel ? retryingLabel : retryLabel}
        </button>
        <button
          className="border-border-base text-text-primary bg-bg-default h-12.5 w-full cursor-pointer rounded-xl border text-[20px] font-medium leading-normal tracking-[0.4px]"
          onClick={() => window.location.reload()}
          type="button"
        >
          {reloadLabel}
        </button>
        <a
          className="border-border-base text-text-primary bg-bg-default h-12.5 flex w-full items-center justify-center rounded-xl border text-[20px] font-medium leading-normal tracking-[0.4px]"
          href={homeHref}
        >
          {homeLabel}
        </a>
      </div>
    </main>
  );
}
