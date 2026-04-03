"use client";

import { useEffect, useRef } from "react";

import { useOrdersContext } from "@/contexts/orders-context";

import { CustomerOrdersList } from "./customer-orders-list";

export const CustomerOrdersPage = () => {
  const { error, hasLoaded, isLoading, loadOrders } = useOrdersContext();
  const hasInitialized = useRef(false);

  // Load orders on mount only once.
  useEffect(() => {
    if (!hasInitialized.current && !hasLoaded && !isLoading) {
      hasInitialized.current = true;
      loadOrders();
    }
  }, [hasLoaded, isLoading, loadOrders]);

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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-text-danger mb-4 text-center">
          <p className="text-lg font-medium lg:text-xl">Error loading orders</p>
          <p className="text-sm lg:text-base">{error}</p>
        </div>
        <button
          className="bg-bg-brand text-text-inverse rounded-lg px-4 py-2 lg:px-6 lg:py-3"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
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
