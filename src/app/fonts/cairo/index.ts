import localFont from "next/font/local";

export const cairo = localFont({
  display: "swap",
  preload: false,
  src: "./cairo-variable-font.woff2",
  variable: "--font-cairo",
});
