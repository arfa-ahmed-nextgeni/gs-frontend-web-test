import React from "react";

import Container from "@/components/shared/container";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";

export const DesktopBreadcrumbSkeleton = () => {
  return (
    <Container className="mt-5 hidden w-full lg:flex">
      <Breadcrumb>
        <BreadcrumbList className="text-text-primary !gap-1 text-sm font-medium">
          {[...Array(3)].map((_, index) => (
            <React.Fragment key={`breadcrumb-${index}`}>
              <Skeleton className="w-12.5 h-5" />
              <BreadcrumbSeparator className="font-gilroy rtl:rotate-180">
                →
              </BreadcrumbSeparator>
            </React.Fragment>
          ))}
          <Skeleton className="w-12.5 h-5" />
        </BreadcrumbList>
      </Breadcrumb>
    </Container>
  );
};
