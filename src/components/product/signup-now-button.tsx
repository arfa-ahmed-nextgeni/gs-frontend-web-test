"use client";

import { useAuthUI } from "@/contexts/auth-ui-context";
import { useUI } from "@/contexts/use-ui";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants/routes";
import { isDesktopViewport } from "@/lib/utils/responsive";

export const SignupNowButton = ({
  className,
  title,
}: {
  className?: string;
  title: string;
}) => {
  const { isAuthorized } = useUI();
  const { showOtpLoginPopup } = useAuthUI();

  if (isAuthorized) {
    return null;
  }

  return (
    <Link
      className={className}
      href={ROUTES.CUSTOMER.LOGIN}
      onNavigate={(e) => {
        if (isDesktopViewport()) {
          e.preventDefault();
          showOtpLoginPopup();
        }
      }}
    >
      {title}
    </Link>
  );
};
