/**
 * Normalises a raw path coming from Contentful into the frontend category URL
 * format (`/c/<slug>`). Both desktop and mobile navigation use this so that
 * Contentful paths like `/category/fragrances` or bare slugs like `fragrances`
 * are always resolved correctly.
 */
export function getCategoryUrl(path: string): string {
  if (!path || typeof path !== "string") {
    return "/";
  }

  if (path.includes("/category/") || path.includes("/categories/")) {
    const parts = path.split("/");
    const categorySlug = parts[parts.length - 1];
    return `/c/${categorySlug}`;
  }

  if (path.startsWith("/c/")) {
    return path;
  }

  if (!path.startsWith("/") && !path.includes("http")) {
    return `/c/${path}`;
  }

  return path;
}
