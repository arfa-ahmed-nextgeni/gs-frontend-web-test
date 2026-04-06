"use client";

import ReactDOM from "react-dom";

const LOCALE_FONT_HREF = {
  ar: "/fonts/cairo-variable.woff2",
  en: "/fonts/gilroy-regular.woff2",
} as const;

export const LocaleFontPreload = ({
  language,
}: {
  language: keyof typeof LOCALE_FONT_HREF;
}) => {
  ReactDOM.preload(LOCALE_FONT_HREF[language], {
    as: "font",
    crossOrigin: "",
    type: "font/woff2",
  });

  return null;
};
