import { PlaceholderValue } from "next/dist/shared/lib/get-img-props";

import { CONTENTFUL_IMAGE_HOST } from "@/lib/constants/contentful";

export function encodeToBase64(str: string) {
  if (typeof window === "undefined") {
    return Buffer.from(str).toString("base64");
  }
  return window.btoa(str);
}

export function generateShimmerSvg() {
  return `
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="blur">
          <feGaussianBlur stdDeviation="10"/>
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="#f3f3f3">
        <animate attributeName="fill" values="#f3f3f3;#d9d9d9;#f3f3f3" dur="2s" repeatCount="indefinite"/>
      </rect>
    </svg>
  `;
}

export function getShimmerPlaceholder() {
  const svg = generateShimmerSvg();
  const b64 = encodeToBase64(svg);
  return `data:image/svg+xml;base64,${b64}` as PlaceholderValue;
}

export function isContentfulSrc(src: string) {
  try {
    return new URL(src).host === CONTENTFUL_IMAGE_HOST;
  } catch {
    return false;
  }
}
