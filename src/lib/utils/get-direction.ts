export function getDirection(locale: string | undefined) {
  if (!locale) return "ltr";
  const rtlLanguages = ["ar"];
  return rtlLanguages.some((lang) => locale.startsWith(lang)) ? "rtl" : "ltr";
}
