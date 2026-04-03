"use client";

import { useSelectedLayoutSegment } from "next/navigation";

// import { useTranslations } from "next-intl";
import { DesktopBreadcrumb } from "@/components/shared/breadcrumb/desktop-breadcrumb";
import { ROUTES } from "@/lib/constants/routes";

export const CustomerBreadcrumb = () => {
  const segment = useSelectedLayoutSegment();
  // const t = useTranslations("breadcrumbTitles");

  const isOrdersPage = segment === "orders";
  const shouldShowOrdersBreadcrumb = isOrdersPage;

  if (shouldShowOrdersBreadcrumb) {
    return (
      <DesktopBreadcrumb
        items={[{ href: ROUTES.ROOT }]}
        // routeTitle={t("/customer/orders")}
      />
    );
  }

  return <DesktopBreadcrumb items={[{ href: ROUTES.ROOT }]} />;
};
