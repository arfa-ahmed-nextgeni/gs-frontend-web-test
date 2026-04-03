"use client";

import React from "react";

import { useTranslations } from "next-intl";

import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useRouteMatch } from "@/hooks/use-route-match";
import { Link } from "@/i18n/navigation";
import { getPathSegments } from "@/lib/utils/routes";

export const DynamicBreadcrumbItems = () => {
  const t = useTranslations("breadcrumbTitles");
  const { effectivePathname, isProfile } = useRouteMatch();

  if (!isProfile) return null;

  const pathSegments = getPathSegments(effectivePathname);

  const intermediatePaths = pathSegments.slice(1, -1);

  const breadcrumbItems: { href: string }[] = [];
  let currentPath = "";

  intermediatePaths.forEach((path, index) => {
    if (path !== "edit") {
      currentPath = `/${pathSegments.slice(0, index + 2).join("/")}`;

      breadcrumbItems.push({
        href: currentPath,
      });
    }
  });

  return breadcrumbItems.map(({ href }) => (
    <React.Fragment key={`breadcrumb-${href}`}>
      <BreadcrumbItem>
        <BreadcrumbLink asChild>
          <Link href={href}>{t.has(href as any) ? t(href as any) : href}</Link>
        </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator className="font-gilroy rtl:rotate-180">
        →
      </BreadcrumbSeparator>
    </React.Fragment>
  ));
};
