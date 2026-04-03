"use client";

import { createContext, useCallback, useContext, useState } from "react";

import { useRouter } from "@/i18n/navigation";
import { Order } from "@/lib/models/customer-orders";

import { useOrdersContext } from "./orders-context";

export type ViewOrderContextType = {
  closeDrawer: () => void;
  isLoading: boolean;
  loadOrderData: (orderId: string) => Promise<void>;
  orderData: null | Order;
};

const ViewOrderContext = createContext<undefined | ViewOrderContextType>(
  undefined
);

export const useViewOrderContext = () => {
  const context = useContext(ViewOrderContext);
  if (!context) {
    throw new Error(
      "useViewOrderContext must be used within ViewOrderContextProvider"
    );
  }
  return context;
};

export const ViewOrderContextProvider = ({
  children,
  initialOrderData,
}: {
  children: React.ReactNode;
  initialOrderData?: null | Order;
}) => {
  const router = useRouter();
  const { getOrderById, loadOrders } = useOrdersContext();

  const [isLoading, setIsLoading] = useState(false);
  const [orderData, setOrderData] = useState<null | Order>(
    initialOrderData || null
  );

  const closeDrawer = () => {
    router.back();
  };

  const loadOrderData = useCallback(
    async (orderId: string) => {
      setIsLoading(true);
      try {
        let order = getOrderById(orderId);

        if (!order) {
          await loadOrders();
          order = getOrderById(orderId);
        }

        if (!order) {
          await loadOrders();
          order = getOrderById(orderId);
        }

        if (order) {
          setOrderData(order);
        } else {
          setOrderData(null);
        }
      } catch {
        setOrderData(null);
      } finally {
        setIsLoading(false);
      }
    },
    [getOrderById, loadOrders]
  );

  const contextValue: ViewOrderContextType = {
    closeDrawer,
    isLoading,
    loadOrderData,
    orderData,
  };

  return (
    <ViewOrderContext.Provider value={contextValue}>
      {children}
    </ViewOrderContext.Provider>
  );
};
