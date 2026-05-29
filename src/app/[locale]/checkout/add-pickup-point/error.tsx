"use client";

import { ErrorBoundary } from "@/components/shared/error-boundary";

type ErrorProps = {
  error: { digest?: string } & Error;
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  return <ErrorBoundary error={error} reset={reset} />;
}
