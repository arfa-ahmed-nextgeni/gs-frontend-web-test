"use client";

import { useEffect } from "react";

import { ErrorBoundary } from "@/components/shared/error-boundary";
import { useOrdersContext } from "@/contexts/orders-context";
import { useUI } from "@/contexts/use-ui";

import { CustomerOrdersList } from "./customer-orders-list";
import { CustomerOrdersSkeleton } from "./customer-orders-skeleton";

export const CustomerOrdersPage = () => {
  const { error, hasLoaded, isLoading, loadOrders } = useOrdersContext();
  const { isAuthorized } = useUI();

  useEffect(() => {
    if (isAuthorized && !hasLoaded && !isLoading) {
      void loadOrders();
    }
  }, [isAuthorized, hasLoaded, isLoading, loadOrders]);

  const handleTrackOrder = () => {
    // Navigate to track order page or open tracking modal
    // You can implement navigation here
  };

  const handleReorder = () => {
    // Add items to cart for reorder
    // You can implement reorder logic here
  };

  const handleCancel = () => {
    // Cancel the order
    // You can implement cancel logic here
  };

  const handleEdit = () => {
    // Edit order details
    // You can implement edit logic here
  };

  const handleInvoice = () => {
    // Download or view invoice
    // You can implement invoice logic here
  };

  // During logout `isAuthorized` flips to false and the orders provider
  // remounts (it is keyed on auth state in the layout), resetting state and
  // re-triggering a fetch that now fails because the auth cookie is gone.
  // Skip data/error rendering during this transition — the user is being
  // redirected to home.
  if (!isAuthorized) {
    return (
      <div className="px-2.5 lg:mt-2 lg:px-0">
        <CustomerOrdersSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorBoundary
        error={new Error(error)}
        loadingFallback={
          <div className="px-2.5 lg:mt-2 lg:px-0">
            <CustomerOrdersSkeleton />
          </div>
        }
        reset={() => {
          void loadOrders();
        }}
      />
    );
  }

  return (
    <div className="px-2.5 lg:mt-2 lg:px-0">
      <CustomerOrdersList
        onCancel={handleCancel}
        onEdit={handleEdit}
        onInvoice={handleInvoice}
        onReorder={handleReorder}
        onTrackOrder={handleTrackOrder}
      />
    </div>
  );
};
