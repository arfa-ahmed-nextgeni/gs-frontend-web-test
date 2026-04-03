import { useRouteMatch } from "@/hooks/use-route-match";

export const useIsMobileBottomNavHidden = () => {
  const {
    isDeleteAccount,
    isLanguage,
    isLogin,
    isProduct,
    isProfile,
    isRegion,
    isWallet,
  } = useRouteMatch();

  return (
    isLogin ||
    isDeleteAccount ||
    isLanguage ||
    isRegion ||
    isProfile ||
    isProduct ||
    isWallet
  );
};
