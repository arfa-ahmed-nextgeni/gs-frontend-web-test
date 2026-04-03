export function resolveInvoiceUrl(url?: string): null | string {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  const base = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "";
  if (!base) return null;
  const cleanBase = base.replace(/\/$/, "");
  const cleanPath = url.replace(/^\//, "");
  return `${cleanBase}/${cleanPath}`;
}
