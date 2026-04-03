"use client";

import { useLocale } from "next-intl";

interface ProductCountDisplayProps {
  currentCount: number;
  currentPage?: number;
  pageSize?: number;
  totalCount: number;
}

/**
 * Display product count information
 * Shows "Showing X-Y of Z products"
 */
export function ProductCountDisplay({
  currentPage = 1,
  pageSize = 20,
  totalCount,
}: ProductCountDisplayProps) {
  const locale = useLocale();
  const isArabic = locale.startsWith("ar");

  // Calculate range
  const startItem = currentPage > 1 ? (currentPage - 1) * pageSize + 1 : 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  const text = isArabic
    ? `عرض ${startItem}-${endItem} من ${totalCount} منتج`
    : `Showing ${startItem}-${endItem} of ${totalCount} products`;

  return <div className="text-text-secondary mb-4 text-sm">{text}</div>;
}
