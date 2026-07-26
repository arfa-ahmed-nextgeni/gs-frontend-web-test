export function cleanUrl(url: string): string {
  // Remove all leading /en, en/ patterns
  let cleanedUrl = url.replace(/^(\/en\/?|en\/)+/, "");

  // Ensure it starts with /
  if (!cleanedUrl.startsWith("/")) {
    cleanedUrl = `/${cleanedUrl}`;
  }

  return cleanedUrl;
}
