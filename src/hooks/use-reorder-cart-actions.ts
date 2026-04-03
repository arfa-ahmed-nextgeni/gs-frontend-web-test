import { useQueryClient } from "@tanstack/react-query";
import { useLocale } from "next-intl";

import { useUI } from "@/contexts/use-ui";
import { APP_API_ENDPOINTS } from "@/lib/constants/api/endpoints";
import { Locale } from "@/lib/constants/i18n";
import { MAX_PAGE_SIZE } from "@/lib/constants/pagination";

export const useReorderCartActions = () => {
  const queryClient = useQueryClient();
  const locale = useLocale() as Locale;
  const { openDrawer, setDrawerView } = useUI();

  const refreshCart = async () => {
    // Invalidate and refetch cart data
    const cartQueryKey = [
      APP_API_ENDPOINTS.CART.DETAILS(locale, 1, MAX_PAGE_SIZE),
    ];
    await queryClient.invalidateQueries({ queryKey: cartQueryKey });
    await queryClient.refetchQueries({ queryKey: cartQueryKey });
  };

  const openCartDrawer = () => {
    setDrawerView("CART_SIDEBAR");
    openDrawer();
  };

  const handleSuccessfulReorder = async () => {
    await refreshCart();
    openCartDrawer();
  };

  return {
    handleSuccessfulReorder,
    openCartDrawer,
    refreshCart,
  };
};
