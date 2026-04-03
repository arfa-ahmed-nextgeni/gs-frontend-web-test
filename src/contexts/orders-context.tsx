"use client";

import { createContext, useCallback, useContext, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { useLocale } from "next-intl";

import { useRouter } from "@/i18n/navigation";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import { QueryParamsKey } from "@/lib/constants/query-params";
import { ROUTES } from "@/lib/constants/routes";
import { Order } from "@/lib/models/customer-orders";
import { isError, isOk } from "@/lib/utils/service-result";

import type { Locale } from "@/lib/constants/i18n";

export type OrdersContextType = {
  cancelOrder: (
    orderId: string
  ) => Promise<{ message?: string; success: boolean }>;
  currentPage: number;
  error: null | string;
  getOrderById: (id: string) => Order | undefined;
  hasLoaded: boolean;
  isFiltered: boolean;
  isLoading: boolean;
  loadOrders: (
    page?: number,
    pageSize?: number,
    append?: boolean,
    sortBy?: string
  ) => Promise<void>;
  orders: Order[];
  pageInfo: { current_page: number; page_size: number; total_pages: number };
  reorderOrder: (
    increment_id: string,
    reorder: boolean
  ) => Promise<{ cart_id?: string; message?: string; success: boolean }>;
  setCurrentPage: (page: number) => void;
  totalCount: number;
};

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export const useOrdersContext = () => {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error(
      "useOrdersContext must be used within OrdersContextProvider"
    );
  }
  return context;
};

export const OrdersContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const queryClient = useQueryClient();
  const locale = useLocale() as Locale;
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInfo, setPageInfo] = useState({
    current_page: 1,
    page_size: 6,
    total_pages: 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);

  const loadOrders = useCallback(
    async (
      page: number = 1,
      pageSize: number = 6,
      append: boolean = false,
      sortBy?: string
    ) => {
      if (isLoading) return;

      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          currentPage: page.toString(),
          pageSize: pageSize.toString(),
          [QueryParamsKey.Locale]: locale,
        });

        if (sortBy) params.append("sortBy", sortBy);

        const response = await fetch(
          `/api/customer/orders?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }

        const result = await response.json();

        if (isOk(result) && result.data) {
          const data = result.data as {
            isFiltered?: boolean;
            orders: Order[];
            pageInfo?: {
              current_page: number;
              page_size: number;
              total_pages: number;
            };
            totalCount: number;
          };

          if (append) {
            setOrders((prevOrders) => {
              const existingIds = new Set(prevOrders.map((order) => order.id));
              const newOrders = data.orders.filter(
                (order) => !existingIds.has(order.id)
              );
              return [...prevOrders, ...newOrders];
            });
          } else {
            const uniqueOrders = data.orders.filter(
              (order, index, self) =>
                index === self.findIndex((o) => o.id === order.id)
            );
            setOrders(uniqueOrders);
          }

          setTotalCount(data.totalCount);
          setCurrentPage(page);
          setIsFiltered(data.isFiltered || false);
          if (data.pageInfo) {
            setPageInfo(data.pageInfo);
          } else {
            setPageInfo({
              current_page: page,
              page_size: pageSize,
              total_pages: Math.ceil(data.totalCount / pageSize),
            });
          }
        } else if (isError(result)) {
          setError(result.error || "Failed to load orders");
        } else {
          setError("Authentication required");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
        setHasLoaded(true);
      }
    },
    [isLoading, locale]
  );

  const cancelOrder = useCallback(
    async (orderId: string) => {
      try {
        const response = await fetch(
          `/api/customer/orders/cancel?${QueryParamsKey.Locale}=${locale}`,
          {
            body: JSON.stringify({ orderId }),
            headers: {
              "Content-Type": "application/json",
            },
            method: "POST",
          }
        );

        const result = await response.json();

        if (result.success) {
          await loadOrders(currentPage, pageInfo.page_size);
          return { message: result.message, success: true };
        } else {
          return {
            message: result.error || "Failed to cancel order",
            success: false,
          };
        }
      } catch (error) {
        return {
          message:
            error instanceof Error ? error.message : "Failed to cancel order",
          success: false,
        };
      }
    },
    [currentPage, locale, pageInfo.page_size, loadOrders]
  );

  const reorderOrder = useCallback(
    async (increment_id: string, reorder: boolean = false) => {
      try {
        const response = await fetch(
          `/api/customer/orders/reorder?${QueryParamsKey.Locale}=${locale}`,
          {
            body: JSON.stringify({ increment_id, reorder }),
            headers: {
              "Content-Type": "application/json",
            },
            method: "POST",
          }
        );

        const result = await response?.json();

        if (result.success) {
          await queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.CART.ROOT(locale),
          });
          router.push(ROUTES.CART.ROOT);

          return {
            cart_id: result.cart_id,
            message: result.message,
            success: true,
          };
        } else {
          return {
            message: result.error || "Failed to reorder",
            success: false,
          };
        }
      } catch (error) {
        return {
          message: error instanceof Error ? error.message : "Failed to reorder",
          success: false,
        };
      }
    },
    [locale, queryClient, router]
  );

  const getOrderById = useCallback(
    (id: string) => {
      return orders.find((order) => order.id === id);
    },
    [orders]
  );

  const contextValue: OrdersContextType = {
    cancelOrder,
    currentPage,
    error,
    getOrderById,
    hasLoaded,
    isFiltered,
    isLoading,
    loadOrders,
    orders,
    pageInfo,
    reorderOrder,
    setCurrentPage,
    totalCount,
  };

  return (
    <OrdersContext.Provider value={contextValue}>
      {children}
    </OrdersContext.Provider>
  );
};
