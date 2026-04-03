import { PAGINATION_ELLIPSIS } from "@/lib/constants/pagination";

/**
 * Returns an array of page numbers (and ellipses) to render in a pagination UI.
 *
 * @param currentPage   – the page the user is on (1-based)
 * @param totalPages    – total number of pages
 * @param maxItems      – **maximum** number of items to show (including ellipses)
 *                        Must be >= 5.  If omitted, defaults to 7 (original behaviour).
 */
export const getPaginationRange = (
  currentPage: number,
  totalPages: number,
  maxItems: number = 7
): (number | typeof PAGINATION_ELLIPSIS)[] => {
  // -----------------------------------------------------------------
  // 1. Input validation
  // -----------------------------------------------------------------
  if (!Number.isFinite(totalPages) || totalPages <= 0) return [1];
  if (!Number.isFinite(currentPage) || currentPage <= 0) return [1];

  const safeCurrent = Math.min(currentPage, totalPages);
  const max = Math.max(5, maxItems); // enforce minimum of 5

  // -----------------------------------------------------------------
  // 2. Small total – show everything
  // -----------------------------------------------------------------
  if (totalPages <= max) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // -----------------------------------------------------------------
  // 3. How many *real* page numbers do we want to display?
  // -----------------------------------------------------------------
  //   max = leftEdge + rightEdge + middleChunk + 2×ellipsis
  //   → middleChunk = max - 4   (1 for left, 1 for right, 2 ellipses)
  const middleChunkSize = max - 4; // e.g. 7 → 3, 9 → 5, …
  const halfChunk = Math.floor(middleChunkSize / 2);

  // -----------------------------------------------------------------
  // 4. Near the start
  // -----------------------------------------------------------------
  if (safeCurrent <= halfChunk + 1) {
    // Show first `max-2` pages + ellipsis + last page
    return [
      ...Array.from({ length: max - 2 }, (_, i) => i + 1),
      PAGINATION_ELLIPSIS,
      totalPages,
    ];
  }

  // -----------------------------------------------------------------
  // 5. Near the end
  // -----------------------------------------------------------------
  if (safeCurrent >= totalPages - halfChunk) {
    // Show first page + ellipsis + last `max-2` pages
    const start = totalPages - (max - 2) + 1;
    return [
      1,
      PAGINATION_ELLIPSIS,
      ...Array.from({ length: max - 2 }, (_, i) => start + i),
    ];
  }

  // -----------------------------------------------------------------
  // 6. In the middle
  // -----------------------------------------------------------------
  const leftEdge = safeCurrent - halfChunk;
  // const rightEdge = safeCurrent + halfChunk;

  return [
    1,
    PAGINATION_ELLIPSIS,
    ...Array.from({ length: middleChunkSize }, (_, i) => leftEdge + i),
    PAGINATION_ELLIPSIS,
    totalPages,
  ];
};
