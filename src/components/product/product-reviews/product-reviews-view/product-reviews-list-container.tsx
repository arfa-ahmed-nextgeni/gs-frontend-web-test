"use client";

import { PropsWithChildren, useEffect, useRef } from "react";

import { useSearchParams } from "next/navigation";

export const ProductReviewsListContainer = ({
  children,
}: PropsWithChildren) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0 });
  }, [searchParams]);

  return (
    <div
      className="gap-3.75 flex flex-1 flex-col overflow-y-auto py-5 pb-20 lg:pb-5"
      ref={containerRef}
    >
      {children}
    </div>
  );
};
