import type { ReactNode } from "react";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface AsyncBoundaryProps {
  children: ReactNode;
  /**
   * Fallback UI to show when an error occurs.
   * Takes precedence over the `fallback` prop.
   */
  errorFallback?: ReactNode;
  /**
   * Fallback UI to show when an error occurs or while loading.
   * If both errorFallback and loadingFallback are provided, this is ignored.
   */
  fallback?: ReactNode;
  /**
   * Fallback UI to show while loading (Suspense).
   * Takes precedence over the `fallback` prop.
   */
  loadingFallback?: ReactNode;
  /**
   * Optional error handler callback
   */
  onError?: (error: unknown, errorInfo: React.ErrorInfo) => void;
}

/**
 * A reusable wrapper component that combines ErrorBoundary and Suspense
 * to handle both errors and loading states in a single component.
 *
 * @example
 * ```tsx
 * // Using the same fallback for both error and loading states
 * <AsyncBoundary fallback={<Skeleton />}>
 *   <AsyncComponent />
 * </AsyncBoundary>
 * ```
 *
 * @example
 * ```tsx
 * // Using different fallbacks for error and loading states
 * <AsyncBoundary
 *   errorFallback={<ErrorComponent />}
 *   loadingFallback={<Skeleton />}
 * >
 *   <AsyncComponent />
 * </AsyncBoundary>
 * ```
 */
export function AsyncBoundary({
  children,
  errorFallback,
  fallback,
  loadingFallback,
  onError,
}: AsyncBoundaryProps) {
  // Determine fallbacks: specific ones take precedence, then use shared fallback
  // If no error fallback is provided, use default (ErrorBoundary requires a fallback)
  const errorFallbackComponent = errorFallback ?? fallback ?? (
    <DefaultErrorFallback />
  );
  const loadingFallbackComponent = loadingFallback ?? fallback;

  return (
    <ErrorBoundary fallback={errorFallbackComponent} onError={onError}>
      <Suspense fallback={loadingFallbackComponent}>{children}</Suspense>
    </ErrorBoundary>
  );
}

/**
 * Default error fallback component
 */
function DefaultErrorFallback() {
  return null;
}
