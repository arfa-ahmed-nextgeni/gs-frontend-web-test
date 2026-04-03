import { PropsWithChildren } from "react";

import { AsyncBoundary } from "@/components/common/async-boundary";
import { AccountPanel } from "@/components/customer/account-panel";
import { AccountPanelSkeleton } from "@/components/customer/account-panel/account-panel-skeleton";
import { CustomerBreadcrumb } from "@/components/customer/customer-breadcrumb";
import Container from "@/components/shared/container";
import { RetryableMaintenanceErrorFallback } from "@/components/shared/retryable-maintenance-error-fallback";

export default function CustomerLayout({ children }: PropsWithChildren) {
  return (
    <>
      <CustomerBreadcrumb />
      <Container className="flex w-full flex-1 flex-col gap-2.5 !px-0 pb-5 lg:flex-row">
        <AsyncBoundary
          errorFallback={<RetryableMaintenanceErrorFallback />}
          fallback={
            <AccountPanelSkeleton
              containerProps={{
                className: "hidden lg:flex",
              }}
            />
          }
        >
          <AccountPanel
            containerProps={{
              className: "hidden lg:flex",
            }}
          />
        </AsyncBoundary>
        <section className="flex flex-1 flex-col">{children}</section>
      </Container>
    </>
  );
}
