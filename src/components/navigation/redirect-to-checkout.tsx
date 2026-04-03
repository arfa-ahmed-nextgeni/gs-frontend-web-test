import { RedirectTo } from "@/components/navigation/redirect-to";
import { ROUTES } from "@/lib/constants/routes";

export function RedirectToCheckout() {
  return <RedirectTo href={ROUTES.CHECKOUT.ROOT} replace />;
}
