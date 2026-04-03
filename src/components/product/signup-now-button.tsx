"use client";

import { useAuthUI } from "@/contexts/auth-ui-context";
import { useUI } from "@/contexts/use-ui";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants/routes";

export const SignupNowButton = ({
  className,
  title,
}: {
  className?: string;
  title: string;
}) => {
  const { isAuthorized } = useUI();
  const { showOtpLoginPopup } = useAuthUI();
  const isMobile = useIsMobile();

  if (isAuthorized) {
    return null;
  }

  return (
    <Link
      className={className}
      href={ROUTES.CUSTOMER.LOGIN}
      onNavigate={(e) => {
        if (!isMobile) {
          e.preventDefault();
          showOtpLoginPopup();
        }
      }}
    >
      {title}
    </Link>
  );
};
