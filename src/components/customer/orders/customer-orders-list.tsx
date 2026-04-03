"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import Image from "next/image";

import { useTranslations } from "next-intl";

import ArrowDownIcon from "@/assets/icons/arrow-down.svg";
import CheckIcon from "@/assets/icons/check-icon.svg";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useMobileModal } from "@/contexts/mobile-modal-context";
import { useOrdersContext } from "@/contexts/orders-context";
import { PAGINATION_ELLIPSIS } from "@/lib/constants/pagination";
import { getPaginationRange } from "@/lib/utils/pagination";

import { CustomerOrderCard } from "./customer-order-card";
import { CustomerOrdersSkeleton } from "./customer-orders-skeleton";

interface CustomerOrdersListProps {
  onCancel?: () => void;
  onEdit?: () => void;
  onInvoice?: () => void;
  onReorder?: () => void;
  onTrackOrder?: () => void;
}

export const CustomerOrdersList = ({
  onCancel,
  onEdit,
  onInvoice,
  onReorder,
  onTrackOrder,
}: CustomerOrdersListProps) => {
  const t = useTranslations("CustomerOrdersPage");
  const { isMobileModalOpen, setIsMobileModalOpen } = useMobileModal();
  const {
    currentPage,
    hasLoaded,
    isFiltered,
    isLoading,
    loadOrders,
    orders,
    pageInfo,
  } = useOrdersContext();
  const [sortBy, setSortBy] = useState("newest");
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  // Status filter removed - no API support available
  // const [status, setStatus] = useState("allOrders");
  // const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [mobileModalType, setMobileModalType] = useState<"sort">("sort");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sortOptions = ["newest", "oldest"];

  // Status filter options removed - no API support available
  // const statusOptions = [
  //   "allOrders",
  //   "delivered",
  //   "processed",
  //   "cancelled",
  //   "shipped",
  //   "returned",
  // ];

  const totalPages = pageInfo.total_pages;
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  const currentOrders = orders;

  const handlePageChange = async (page: number) => {
    await loadOrders(page, pageInfo.page_size, false, sortBy);
  };

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || currentPage >= totalPages) return;

    setIsLoadingMore(true);
    try {
      await loadOrders(currentPage + 1, pageInfo.page_size, true, sortBy);
    } catch (error) {
      console.error("Failed to load more orders:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    isLoadingMore,
    currentPage,
    totalPages,
    loadOrders,
    pageInfo.page_size,
    sortBy,
  ]);

  useEffect(() => {
    if (!isMobile) return;

    const handleScroll = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      if (scrollTop + windowHeight >= docHeight - 100) {
        handleLoadMore();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobile, handleLoadMore]);

  const handleSortChange = (option: string) => {
    setSortBy(option);
    setIsSortDropdownOpen(false);
    // Reload orders with new sort option
    loadOrders(1, pageInfo.page_size, false, option);
  };

  // const handleStatusChange = (option: string) => {
  //   setStatus(option);
  //   setIsStatusDropdownOpen(false);
  //   // Reload orders with new status filter
  //   loadOrders(1, pageInfo.page_size, false, sortBy, option);
  // };

  const handleMobileModalOpen = (type: "sort") => {
    setMobileModalType(type);
    setIsMobileModalOpen(true); // Update global context
  };

  const handleMobileModalClose = () => {
    setIsMobileModalOpen(false); // Update global context
  };

  const handleMobileOptionSelect = (option: string) => {
    if (mobileModalType === "sort") {
      setSortBy(option);
      // Reload orders with new sort option
      loadOrders(1, pageInfo.page_size, false, option);
    }
    // else {
    //   setStatus(option);
    //   // Reload orders with new status filter
    //   loadOrders(1, pageInfo.page_size, false, sortBy, option);
    // }
    // setIsMobileModalOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileModalOpen) return;

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsSortDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileModalOpen]);

  if (isLoading) {
    return <CustomerOrdersSkeleton />;
  }

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 lg:mt-0">
      <div className="text-text-secondary mb-4 text-center">
        <p className="text-lg font-medium lg:text-xl">
          {t("emptyState.title")}
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col px-1 lg:px-0">
      <div className="mb-5 flex flex-col gap-4 lg:mx-0 lg:flex-row lg:justify-end">
        <div className="mt-5 flex gap-2 lg:hidden">
          <button
            className="shadow-xm text-text-primary flex items-center gap-2 rounded-full border-gray-200 bg-white px-4 py-2 text-xs font-semibold"
            onClick={() => handleMobileModalOpen("sort")}
          >
            {t("sortBy")}
            <span className="transition-default font-gilroy inline-block transition-transform">
              <Image
                alt="arrow down"
                className="transition-default"
                height={4}
                src={ArrowDownIcon}
                width={8}
              />
            </span>
          </button>
        </div>

        <div className="lg:gap-15 hidden gap-5 lg:flex">
          <div className="relative flex items-center gap-2">
            <span className="text-sm text-[#5D5D5D]">{t("sortBy")}</span>
            <div className="relative" ref={dropdownRef}>
              <button
                className="flex items-center gap-2 border-none text-sm text-[#5D5D5D]"
                onClick={() => {
                  const newState = !isSortDropdownOpen;
                  setIsSortDropdownOpen(newState);
                }}
              >
                {t(`sortOptions.${sortBy}` as any)}
                <span
                  className={`transition-default font-gilroy inline-block transition-transform ${isSortDropdownOpen ? "rotate-180" : ""}`}
                >
                  ↓
                </span>
              </button>

              {isSortDropdownOpen && (
                <div className="absolute right-0 top-full z-10 mt-1 min-w-56 rounded-lg bg-white shadow-lg rtl:left-0 rtl:right-auto">
                  {sortOptions.map((option) => (
                    <button
                      className={`flex w-full items-center px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                        sortBy === option ? "bg-gray-100 font-medium" : ""
                      }`}
                      key={option}
                      onClick={() => handleSortChange(option)}
                    >
                      {sortBy === option && (
                        <Image
                          alt="check"
                          className="mr-2"
                          height={8}
                          src={CheckIcon}
                          width={12}
                        />
                      )}
                      {t(`sortOptions.${option}` as any)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* <div className="relative flex items-center gap-2">
            <span className="text-sm text-[#5D5D5D]">{t("status")}</span>
            <div className="relative" ref={statusDropdownRef}>
              <button
                className="flex items-center gap-2 border-none text-sm text-[#5D5D5D]"
                onClick={() => {
                  const newState = !isStatusDropdownOpen;
                  setIsStatusDropdownOpen(newState);
                }}
              >
                {t(`statusOptions.${status}` as any)}
                <span
                  className={`transition-default font-gilroy inline-block text-[#5D5D5D] transition-transform ${isStatusDropdownOpen ? "rotate-180" : ""}`}
                >
                  ↓
                </span>
              </button>

              {isStatusDropdownOpen && (
                <div className="absolute right-0 top-full z-10 mt-1 min-w-56 rounded-lg bg-white shadow-lg rtl:left-0 rtl:right-auto">
                  {statusOptions.map((option) => (
                    <button
                      className={`flex w-full items-center px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                        status === option ? "bg-gray-100 font-medium" : ""
                      }`}
                      key={option}
                      onClick={() => handleStatusChange(option)}
                    >
                      {status === option && (
                        <Image
                          alt="check"
                          className="mr-2"
                          height={8}
                          src={CheckIcon}
                          width={12}
                        />
                      )}
                      {t(`statusOptions.${option}` as any)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div> */}
        </div>
      </div>

      {orders.length === 0 && hasLoaded && !isLoading ? (
        renderEmptyState()
      ) : (
        <div
          className="grid grid-cols-1 gap-1 lg:grid-cols-2 lg:gap-2"
          key={`orders-grid-${isMobile ? "mobile" : "desktop"}`}
        >
          {currentOrders.map((order, index) => (
            <CustomerOrderCard
              key={`${isMobile ? "mobile" : "desktop"}-order-${order.id}-${index}`}
              onCancel={onCancel}
              onEdit={onEdit}
              onInvoice={onInvoice}
              onReorder={onReorder}
              onTrackOrder={onTrackOrder}
              order={order}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && !isMobile && hasLoaded && !isFiltered && (
        <div className="mx-5 mt-6 lg:mx-0 lg:mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationFirst
                  aria-disabled={currentPage === 1}
                  className={currentPage === 1 ? "pointer-events-none" : ""}
                  onClick={() => handlePageChange(1)}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationPrevious
                  aria-disabled={currentPage === 1}
                  className={currentPage === 1 ? "pointer-events-none" : ""}
                  onClick={() => handlePageChange(currentPage - 1)}
                />
              </PaginationItem>

              {getPaginationRange(currentPage, totalPages).map(
                (pageNumber, index) => (
                  <PaginationItem key={index}>
                    {pageNumber === PAGINATION_ELLIPSIS ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        aria-disabled={pageNumber === currentPage}
                        isActive={pageNumber === currentPage}
                        onClick={() => handlePageChange(pageNumber as number)}
                      >
                        {pageNumber}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                )
              )}

              <PaginationItem>
                <PaginationNext
                  aria-disabled={currentPage === totalPages}
                  className={
                    currentPage === totalPages ? "pointer-events-none" : ""
                  }
                  onClick={() => handlePageChange(currentPage + 1)}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationLast
                  aria-disabled={currentPage === totalPages}
                  className={
                    currentPage === totalPages ? "pointer-events-none" : ""
                  }
                  onClick={() => handlePageChange(totalPages)}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {isMobile && isLoadingMore && (
        <div
          className="mx-5 mt-6 flex justify-center"
          key="mobile-loading-indicator"
        >
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
            {t("loading")}
          </div>
        </div>
      )}

      {isMobileModalOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 backdrop-blur-[2.5px]"
            onClick={handleMobileModalClose}
            style={{ backgroundColor: "rgba(0, 0, 0, 0.30)" }}
          />

          <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-white shadow-2xl">
            <div className="border-border-base flex items-center justify-between border-b p-4">
              <h3 className="text-text-primary text-lg font-medium">
                {mobileModalType === "sort"
                  ? t("sortByMobile")
                  : t("statusMobile")}
              </h3>
              <div className="flex flex-row items-center gap-5">
                <button
                  className="text-[17px] font-medium text-[#FF5A00]"
                  onClick={handleMobileModalClose}
                >
                  {t("clear")}
                </button>
                <Image
                  alt="arrow down"
                  className="transition-default"
                  height={20}
                  onClick={handleMobileModalClose}
                  src={ArrowDownIcon}
                  width={20}
                />
              </div>
            </div>

            <div className="px-4">
              <div className="my-7 space-y-4">
                {sortOptions.map((option) => {
                  const isSelected = sortBy === option;
                  return (
                    <button
                      className="flex w-full items-center gap-5 text-left"
                      key={option}
                      onClick={() => handleMobileOptionSelect(option)}
                    >
                      {isSelected && (
                        <>
                          <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#374957] bg-white">
                            <div className="h-3 w-3 rounded-full bg-[#6543F5]" />
                          </div>
                          <span className="text-text-primary font-gilroy text-xl font-semibold">
                            {t(`sortOptions.${option}` as any)}
                          </span>
                        </>
                      )}
                      {!isSelected && (
                        <>
                          <div className="flex h-5 w-5 items-center justify-center rounded-full border border-[#374957]">
                            <div className="h-2 w-2 rounded-full bg-white" />
                          </div>
                          <span className="text-text-primary font-gilroy text-xl font-medium">
                            {t(`sortOptions.${option}` as any)}
                          </span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="my-4 mb-4">
                <button
                  className="p-3.75 mb-4 w-full rounded-[10px] bg-[#374957] text-xl text-white"
                  onClick={handleMobileModalClose}
                >
                  {t("apply")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
