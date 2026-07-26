import { RedirectTo } from "@/components/navigation/redirect-to";
import { ROUTES } from "@/lib/constants/routes";

export function RedirectToCustomerOrders() {
  return <RedirectTo href={ROUTES.CUSTOMER.ORDERS} replace />;
}
