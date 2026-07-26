import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";

import { PaymentStatus } from "@/lib/constants/payment-status";
import { QueryParamsKey } from "@/lib/constants/query-params";

export const usePaymentStatusParam = () => {
  const [paymentStatus, setPaymentStatus] = useQueryState(
    QueryParamsKey.PaymentStatus,
    parseAsStringLiteral([PaymentStatus.Cancelled, PaymentStatus.Failed])
  );
  const [paymentReasonCode, setPaymentReasonCode] = useQueryState(
    QueryParamsKey.PaymentReasonCode,
    parseAsString
  );

  return {
    paymentReasonCode,
    paymentStatus,
    setPaymentReasonCode,
    setPaymentStatus,
  };
};
