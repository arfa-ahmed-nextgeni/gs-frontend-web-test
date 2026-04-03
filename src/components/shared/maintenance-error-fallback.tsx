"use client";

import Image from "next/image";

import MaintenanceIcon from "@/assets/icons/maintenance-icon.svg";

type MaintenanceErrorFallbackProps = {
  description: string;
  homeHref?: string;
  homeLabel?: string;
  onRetry: () => void;
  reloadLabel?: string;
  retryLabel: string;
  title: string;
};

export function MaintenanceErrorFallback({
  description,
  homeHref = "/",
  homeLabel = "Go to homepage",
  onRetry,
  reloadLabel = "Reload page",
  retryLabel,
  title,
}: MaintenanceErrorFallbackProps) {
  return (
    <main className="text-text-primary mx-auto flex min-h-dvh w-full max-w-[430px] flex-col items-center justify-between px-5 pb-[120px] pt-5">
      <div />
      <section
        aria-label="Maintenance message"
        className="flex flex-col items-center gap-[30px] text-center"
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
        <div className="flex flex-col gap-[10px]">
          <h1 className="text-text-primary m-0 text-base font-semibold leading-normal tracking-[0.32px]">
            {title}
          </h1>
          <p className="text-text-placeholder m-0 max-w-[325px] text-sm font-medium leading-normal tracking-[0.28px]">
            {description}
          </p>
        </div>
      </section>
      <div className="flex w-full max-w-[390px] flex-col gap-3">
        <button
          className="bg-bg-primary text-text-ghost h-[50px] w-full cursor-pointer rounded-[10px] border-0 text-[20px] font-medium leading-normal tracking-[0.4px]"
          onClick={onRetry}
          type="button"
        >
          {retryLabel}
        </button>
        <button
          className="border-border-base text-text-primary bg-bg-default h-[50px] w-full cursor-pointer rounded-[10px] border text-[20px] font-medium leading-normal tracking-[0.4px]"
          onClick={() => window.location.reload()}
          type="button"
        >
          {reloadLabel}
        </button>
        <a
          className="border-border-base text-text-primary bg-bg-default flex h-[50px] w-full items-center justify-center rounded-[10px] border text-[20px] font-medium leading-normal tracking-[0.4px]"
          href={homeHref}
        >
          {homeLabel}
        </a>
      </div>
    </main>
  );
}
