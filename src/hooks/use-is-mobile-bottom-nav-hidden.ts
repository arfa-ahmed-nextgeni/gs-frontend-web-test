import { useRouteMatch } from "@/hooks/use-route-match";

type MobileBottomNavHiddenInput = Pick<
  ReturnType<typeof useRouteMatch>,
  | "isDeleteAccount"
  | "isLanguage"
  | "isLogin"
  | "isProduct"
  | "isProfile"
  | "isRegion"
  | "isWallet"
>;

export function getIsMobileBottomNavHidden({
  isDeleteAccount,
  isLanguage,
  isLogin,
  isProduct,
  isProfile,
  isRegion,
  isWallet,
}: MobileBottomNavHiddenInput) {
  return (
    isLogin ||
    isDeleteAccount ||
    isLanguage ||
    isRegion ||
    isProfile ||
    isProduct ||
    isWallet
  );
}

export const useIsMobileBottomNavHidden = () => {
  return getIsMobileBottomNavHidden(useRouteMatch());
};
