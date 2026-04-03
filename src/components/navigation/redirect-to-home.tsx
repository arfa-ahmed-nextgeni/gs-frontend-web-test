import { RedirectTo } from "@/components/navigation/redirect-to";
import { ROUTES } from "@/lib/constants/routes";

export function RedirectToHome() {
  return <RedirectTo href={ROUTES.ROOT} replace />;
}
