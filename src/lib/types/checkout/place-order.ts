import type { CheckoutErrorType } from "@/lib/constants/checkout-error";
import type { ServiceResultError } from "@/lib/types/service-result";

export type PlaceOrderFailureResult = {
  errorCode?: CheckoutErrorType;
  redirectTo?: string;
} & ServiceResultError;
