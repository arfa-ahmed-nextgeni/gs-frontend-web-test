import { formatPrice } from "@/lib/utils/price";
import { parseProductTagAttributes } from "@/lib/utils/product-tags";

export type FlagValue = boolean | null | number | undefined;

export class Helper {
  static isFlagEnabled(value: FlagValue): boolean {
    return value === true || value === 1;
  }

  convertRating(rating: null | number | undefined): number {
    if (!rating) return 0;

    const converted = rating / 20;

    return converted % 1 === 0 ? converted : Math.round(converted * 10) / 10;
  }

  formatPhoneNumber(num: null | number | string | undefined): string {
    if (num == null) {
      return "";
    }

    const phoneNumber = `${num}`.trim();

    return phoneNumber && !phoneNumber.startsWith("+")
      ? `+${phoneNumber}`
      : phoneNumber;
  }

  formatPrice({
    amount,
    currencyCode,
    locale = "en-US",
  }: {
    amount: number;
    currencyCode: string;
    locale?: string;
  }): string {
    return formatPrice({
      amount,
      currencyCode,
      locale,
      options: { useGrouping: false },
    });
  }

  getAttribute<T>(
    attributes: any[],
    attributeName: string,
    defaultValue: T
  ): T {
    try {
      const attribute = attributes?.find(
        (attr) => attr?.name === attributeName
      );
      const label = attribute?.label;
      const value = attribute?.value;
      return label && label !== "null" && value && value !== "null"
        ? ({ label, value } as T)
        : defaultValue;
    } catch (error) {
      console.error(`Error getting attribute "${attributeName}":`, error);
      return defaultValue;
    }
  }
  getAttributeValue<T>(
    attributes: any[],
    attributeName: string,
    defaultValue: T
  ): T {
    try {
      const attribute = attributes?.find(
        (attr) => attr?.name === attributeName
      );
      return attribute?.value || defaultValue;
    } catch (error) {
      console.error(`Error getting attribute "${attributeName}":`, error);
      return defaultValue;
    }
  }

  getValidUrl(url?: string) {
    if (!url) return undefined;

    try {
      const trimmedUrl = url.trim();

      return new URL(trimmedUrl).toString();
    } catch {
      return undefined;
    }
  }

  normalizeUrl(url?: string) {
    if (!url) return "";

    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }

    if (url.startsWith("//")) {
      return `https:${url}`;
    }

    return `https://${url}`;
  }

  parseAttribute<T>(
    attributes: any[],
    attributeName: string,
    defaultValue: T
  ): T {
    try {
      const attribute = attributes?.find(
        (attr) => attr?.name === attributeName
      );
      const label = attribute?.label;
      const value = attribute?.value;
      return label && label !== "null" && value && value !== "null"
        ? ({
            label,
            value: JSON.parse(value),
          } as T)
        : defaultValue;
    } catch (error) {
      console.error(`Error getting attribute "${attributeName}":`, error);
      return defaultValue;
    }
  }

  parseAttributeValue<T>(
    attributes: any[],
    attributeName: string,
    defaultValue: T
  ): T {
    try {
      const attribute = attributes?.find(
        (attr) => attr?.name === attributeName
      );
      return attribute?.value ? JSON.parse(attribute.value) : defaultValue;
    } catch (error) {
      console.error(`Error parsing attribute "${attributeName}":`, error);
      return defaultValue;
    }
  }

  parseProductTagAttributes(tagAttributes: string) {
    return parseProductTagAttributes(tagAttributes);
  }

  removeDuplicateUrls<T extends { url: string }>(items: T[]) {
    const seenUrls = new Set<string>();

    return items.filter((item) => {
      if (seenUrls.has(item.url)) return false;

      seenUrls.add(item.url);
      return true;
    });
  }

  toInteger(input?: number | string, defaultValue?: number) {
    if (input == null) {
      return defaultValue;
    }

    const num = +input;

    if (isNaN(num)) {
      return defaultValue;
    }

    const output = Math.floor(num);

    return output;
  }
}
