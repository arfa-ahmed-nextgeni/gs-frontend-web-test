import { ROUTES } from "@/lib/constants/routes";

export const getCurrentDesktopNavigationLpId = (
  pathname: string
): string | undefined => {
  const lpMatch = pathname.match(/\/lp\/([^/]+)/);

  if (lpMatch?.[1]) {
    return lpMatch[1];
  }

  if (pathname === ROUTES.HOME) {
    return "landing page";
  }

  return undefined;
};
