import React from "react";

import { useTranslations } from "next-intl";

import { DynamicBreadcrumbItems } from "@/components/shared/breadcrumb/dynamic-breadcrumb-items";
import Container from "@/components/shared/container";
import { RouteTitle } from "@/components/shared/route-title";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "@/i18n/navigation";

export const DesktopBreadcrumb = ({
  items,
  routeTitle,
}: {
  items: { href: string; title?: string }[];
  routeTitle?: string;
}) => {
  const t = useTranslations("breadcrumbTitles");

  return (
    <Container className="mt-5 hidden w-full lg:flex">
      <Breadcrumb>
        <BreadcrumbList className="text-text-primary !gap-1 text-sm font-medium">
          {items.map(({ href, title }, index) => (
            <React.Fragment key={`breadcrumb-${href}-${index}`}>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={href}>
                    {title || (t.has(href as any) ? t(href as any) : href)}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="font-gilroy rtl:rotate-180">
                →
              </BreadcrumbSeparator>
            </React.Fragment>
          ))}
          <DynamicBreadcrumbItems />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-text-tertiary font-medium underline">
              {routeTitle || <RouteTitle />}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </Container>
  );
};
