import { useVisibilityLoad } from "@/hooks/use-visibility-load";

export const useProductCardVisibilityLoad = <T extends HTMLElement>({
  disabled = false,
  rootMargin = "0px",
  threshold = 0.1,
}: {
  disabled?: boolean;
  rootMargin?: string;
  threshold?: number;
} = {}) => {
  return useVisibilityLoad<T>({
    disabled,
    resolveTarget: (element) =>
      element.closest<HTMLElement>("[data-product-card-root]") ?? element,
    rootMargin,
    threshold,
  });
};
