/**
 * Analytics tracking utility for ecommerce events
 * Supports Google Analytics 4 (GA4) and Plausible Analytics
 */

// Type definitions for GA4 ecommerce events
interface ProductItem {
  currency: string;
  discount?: number;
  id: string;
  item_brand?: string;
  item_category?: string;
  item_id: string;
  item_name: string;
  price: number;
  quantity?: number;
}

interface ViewItemListEvent {
  currency: string;
  item_list_id?: string;
  item_list_name?: string;
  items: ProductItem[];
  value: number;
}

// Check if GA4 is available
const isGA4Available = () => {
  return typeof window !== "undefined" && window.gtag;
};

// Check if Plausible is available
const isPlausibleAvailable = () => {
  return typeof window !== "undefined" && window.plausible;
};

/**
 * Track category page view
 */
export function trackCategoryView({
  categoryId,
  categoryName,
  productCount,
}: {
  categoryId: string;
  categoryName: string;
  productCount: number;
}) {
  // Track with Plausible
  if (isPlausibleAvailable() && window.plausible) {
    window.plausible("Category Viewed", {
      props: {
        category_id: categoryId,
        category_name: categoryName,
        product_count: productCount,
      },
    });
  }
}

/**
 * Track infinite scroll load more
 */
export function trackInfiniteScrollLoad({
  categoryName,
  page,
  productsLoaded,
}: {
  categoryName: string;
  page: number;
  productsLoaded: number;
}) {
  if (isPlausibleAvailable() && window.plausible) {
    window.plausible("Infinite Scroll Loaded", {
      props: {
        category: categoryName,
        page,
        products_loaded: productsLoaded,
      },
    });
  }
}

/**
 * Track pagination event
 */
export function trackPagination({
  categoryName,
  page,
}: {
  categoryName: string;
  page: number;
}) {
  if (isPlausibleAvailable() && window.plausible) {
    window.plausible("Pagination Clicked", {
      props: {
        category: categoryName,
        page,
      },
    });
  }
}

/**
 * Track product impressions (when products are viewed in a list)
 * This is critical for ecommerce analytics
 */
export function trackProductImpressions({
  categoryId,
  categoryName,
  products,
}: {
  categoryId?: string;
  categoryName?: string;
  products: Array<{
    currency: string;
    discountPercent?: number;
    id: string;
    name: string;
    price: number;
  }>;
}) {
  if (products.length === 0) return;

  // Track with GA4
  if (isGA4Available() && window.gtag) {
    const items: ProductItem[] = products.map((product, index) => ({
      currency: product.currency,
      discount: product.discountPercent,
      id: product.id,
      index,
      item_id: product.id,
      item_name: product.name,
      price: product.price,
    }));

    const totalValue = products.reduce((sum, p) => sum + p.price, 0);

    const event: ViewItemListEvent = {
      currency: products[0]?.currency || "SAR",
      item_list_id: categoryId,
      item_list_name: categoryName || "Category Page",
      items,
      value: totalValue,
    };

    window.gtag("event", "view_item_list", event);
  }

  // Track with Plausible
  if (isPlausibleAvailable() && window.plausible) {
    window.plausible("Product List Viewed", {
      props: {
        category: categoryName || "Unknown",
        item_count: products.length,
        list_type: categoryId ? "category" : "search",
      },
    });
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    plausible?: (
      eventName: string,
      options?: { props?: Record<string, any> }
    ) => void;
  }
}
