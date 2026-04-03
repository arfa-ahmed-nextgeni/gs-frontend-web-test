import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";

import { APP_API_ENDPOINTS } from "@/lib/constants/api/endpoints";
import { Locale } from "@/lib/constants/i18n";
import { Order } from "@/lib/types/ui-types";
import { isError, isOk } from "@/lib/utils/service-result";

export const fetchOrder = async (number: string, locale: Locale) => {
  const response = await fetch(
    APP_API_ENDPOINTS.CUSTOMER.ORDER_BY_NUMBER(locale, number),
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch order");
  }

  const result = await response.json();

  if (isOk(result) && result.data) {
    return result.data as Order;
  }

  if (isError(result)) {
    throw new Error(result.error || "Failed to fetch order");
  }

  throw new Error("Failed to fetch order");
};

export const useOrderQuery = (id: string, options?: { enabled?: boolean }) => {
  const locale = useLocale() as Locale;

  return useQuery<Order, Error>({
    enabled: options?.enabled ?? Boolean(id),
    queryFn: () => fetchOrder(id, locale),
    queryKey: ["order", id, locale],
    refetchOnWindowFocus: false,
    retry: false,
  });
};
