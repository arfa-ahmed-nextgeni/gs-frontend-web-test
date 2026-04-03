import { Locale } from "@/lib/constants/i18n";

export type PendingOrderInfo = {
  baseUrl: string;
  locale: Locale;
  orderId: string;
};
