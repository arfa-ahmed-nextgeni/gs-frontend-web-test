"use client";

import React, { use, useEffect } from "react";

import { OrderTracker } from "@/components/analytics/order-tracker";
import { ViewOrderDetails } from "@/components/customer/orders/view-order/view-order-details";
import { ViewOrderDrawerLayout } from "@/components/customer/orders/view-order/view-order-drawer-layout";
import { useViewOrderContext } from "@/contexts/view-order-context";
import { useIsMobile } from "@/hooks/use-is-mobile";

export const ViewOrderResponsiveView = ({
  orderId,
}: {
  orderId: Promise<{ id: string }>;
}) => {
  const resolvedParams = use(orderId);
  const resolvedOrderId = decodeURIComponent(resolvedParams.id);
  const isMobile = useIsMobile();
  const { isLoading, loadOrderData, orderData } = useViewOrderContext();

  useEffect(() => {
    if (resolvedOrderId) {
      loadOrderData(resolvedOrderId);
    }
  }, [resolvedOrderId, loadOrderData]);

  if (isMobile) {
    if (isLoading) {
      return (
        <div className="min-h-screen bg-gray-50">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
              <p className="text-gray-600">Loading order details...</p>
            </div>
          </div>
        </div>
      );
    }

    if (!orderData) {
      return (
        <div className="min-h-screen bg-gray-50">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <h2 className="mb-2 text-xl font-semibold text-gray-900">
                Order not found
              </h2>
              <p className="text-gray-600">
                The order you&apos;re looking for doesn&apos;t exist.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <OrderTracker order={orderData} />
        <ViewOrderDetails />
      </div>
    );
  }

  return (
    <>
      <OrderTracker order={orderData} />
      <ViewOrderDrawerLayout orderId={resolvedOrderId} />
    </>
  );
};
