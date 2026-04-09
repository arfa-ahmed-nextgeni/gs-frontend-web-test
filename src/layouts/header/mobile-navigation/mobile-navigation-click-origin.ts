import { ROUTES } from "@/lib/constants/routes";

export const getCurrentLpId = (pathname: string): string | undefined => {
  const lpMatch = pathname.match(/\/lp\/([^/]+)/);

  if (lpMatch && lpMatch[1]) {
    return lpMatch[1];
  }

  if (pathname === ROUTES.HOME) {
    return "landing page";
  }

  return undefined;
};
