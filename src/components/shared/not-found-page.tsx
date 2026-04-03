import type { ReactNode } from "react";

import Image from "next/image";

import NotFound404Image from "@/assets/images/404.svg";
import { cn } from "@/lib/utils";

type NotFoundPageProps = {
  action: ReactNode;
  className?: string;
  description: string;
  title: string;
};

export function NotFoundPage({
  action,
  className,
  description,
  title,
}: NotFoundPageProps) {
  return (
    <section
      className={cn(
        "max-w-300 lg:pt-38.25 pt-12.5 mx-auto flex w-full flex-col items-center pb-20 text-center lg:justify-center lg:pb-0",
        className
      )}
    >
      <Image
        alt=""
        aria-hidden
        className="lg:h-30 lg:w-75 h-25 w-62.5 select-none"
        height={120}
        loading="eager"
        src={NotFound404Image}
        unoptimized
        width={300}
      />
      <div className="mt-7.5 flex flex-col items-center gap-5 px-5">
        <h1 className="text-text-primary text-[16px] font-semibold lg:text-xl">
          {title}
        </h1>
        <p className="text-text-primary text-xs">{description}</p>
      </div>
      <div className="mt-12.5">{action}</div>
    </section>
  );
}
