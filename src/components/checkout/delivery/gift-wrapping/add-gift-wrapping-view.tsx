import { getTranslations } from "next-intl/server";

import { AddGiftWrappingDrawerLayout } from "@/components/checkout/delivery/gift-wrapping/add-gift-wrapping-drawer-layout";
import { searchGiftWrapItems } from "@/lib/actions/catalog-service/search-gift-wrap-items";
import { extractProductPrice } from "@/lib/utils/catalog-service-transformers";
import { formatPrice } from "@/lib/utils/price";

import type { ProductSearchItem } from "@/catalog-service-graphql/graphql";
import type {
  GiftWrappingProduct,
  GiftWrappingResolvedData,
  GiftWrappingSection,
} from "@/components/checkout/delivery/gift-wrapping/types";
import type { ProductView as CatalogServiceProductView } from "@/lib/types/catalog-service";

interface GiftWrappingSectionConfig {
  filterType: "wrapping-only" | "wrapping-with-gift";
  id: string;
  title: string;
}

const WRAP_META_TYPE = "wrap";

const GIFT_WRAPPING_SECTION_CONFIG: GiftWrappingSectionConfig[] = [
  {
    filterType: "wrapping-with-gift",
    id: "wrapping-with-gift",
    title: "wrapping-with-gift",
  },
  {
    filterType: "wrapping-only",
    id: "wrapping-only",
    title: "wrapping-only",
  },
];

interface AddGiftWrappingViewProps {
  giftMessage?: string;
  selectedSku?: string;
}

type ParsedMetaType =
  | {
      type: "array";
      values: string[];
    }
  | {
      type: "string";
      value: string;
    };

async function buildGiftWrappingSection(
  config: GiftWrappingSectionConfig,
  getSectionTitle: (sectionId: string) => string
): Promise<GiftWrappingSection | null> {
  try {
    const response = await searchGiftWrapItems();

    const items =
      response.items
        ?.map((item) =>
          mapProductSearchItemToGiftProduct(item, config.filterType)
        )
        .filter((gift): gift is GiftWrappingProduct => Boolean(gift)) ?? [];

    // Return null if no items found - section will be filtered out
    if (items.length === 0) {
      return null;
    }

    // Get translated title from translation key
    const translatedTitle = getSectionTitle(config.title);

    return {
      id: config.id,
      items,
      title: translatedTitle,
    };
  } catch (error) {
    console.error(
      `Failed to load gift wrapping section "${config.id}":`,
      error
    );
    // Return null on error - section will be filtered out
    return null;
  }
}

function hasWrapMetaType(metaType: ParsedMetaType): boolean {
  if (metaType.type === "string") {
    return metaType.value === WRAP_META_TYPE;
  }

  return metaType.values.includes(WRAP_META_TYPE);
}

function isWrappingOnly(metaType: ParsedMetaType): boolean {
  if (metaType.type === "string") {
    return metaType.value === WRAP_META_TYPE;
  }

  if (metaType.values.length !== 1) {
    return false;
  }

  return metaType.values[0] === WRAP_META_TYPE;
}

function isWrappingWithGift(metaType: ParsedMetaType): boolean {
  if (metaType.type === "string") {
    return false;
  }

  if (metaType.values.length <= 1) {
    return false;
  }

  if (!metaType.values.includes(WRAP_META_TYPE)) {
    return false;
  }

  return true;
}

function mapProductSearchItemToGiftProduct(
  item: null | ProductSearchItem | undefined,
  filterType: "wrapping-only" | "wrapping-with-gift"
): GiftWrappingProduct | null {
  if (!item?.productView) {
    return null;
  }

  const productView = item.productView as CatalogServiceProductView;
  const productMetaTypeAttribute = productView.attributes?.find(
    (attr) => attr.name === "product_meta_type"
  );
  const parsedMetaType = parseProductMetaTypeValue(
    productMetaTypeAttribute?.value
  );

  if (!parsedMetaType || !hasWrapMetaType(parsedMetaType)) {
    return null;
  }

  if (filterType === "wrapping-only") {
    if (!isWrappingOnly(parsedMetaType)) {
      return null;
    }
  } else if (!isWrappingWithGift(parsedMetaType)) {
    return null;
  }

  const imageUrl = productView?.images?.[0]?.url;
  const { currency, finalPrice } = extractProductPrice(productView);

  const priceLabel =
    finalPrice > 0
      ? formatPrice({
          amount: finalPrice,
          currencyCode: currency,
        })
      : "";

  return {
    externalId: productView.externalId,
    id: productView.id,
    imageUrl,
    inStock: productView.inStock ?? true,
    name: productView.name,
    priceLabel,
    sku: productView.sku,
  };
}

function parseProductMetaTypeValue(value: unknown): null | ParsedMetaType {
  if (Array.isArray(value)) {
    const normalizedValues = value
      .map((item) => String(item).trim().toLowerCase())
      .filter(Boolean);

    if (normalizedValues.length === 0) {
      return null;
    }

    return {
      type: "array",
      values: normalizedValues,
    };
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim().toLowerCase();
  if (!normalizedValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(normalizedValue) as unknown;
    if (Array.isArray(parsedValue)) {
      const normalizedValues = parsedValue
        .map((item) => String(item).trim().toLowerCase())
        .filter(Boolean);

      if (normalizedValues.length === 0) {
        return null;
      }

      return {
        type: "array",
        values: normalizedValues,
      };
    }
  } catch {
    return {
      type: "string",
      value: normalizedValue,
    };
  }

  return {
    type: "string",
    value: normalizedValue,
  };
}

export const AddGiftWrappingView = async ({
  giftMessage,
  selectedSku,
}: AddGiftWrappingViewProps) => {
  const t = await getTranslations("CheckoutPage.AddGiftWrappingDrawer");

  const getSectionTitle = (sectionId: string) => {
    return t(`sections.${sectionId}` as any);
  };

  const giftDataPromise: Promise<GiftWrappingResolvedData> = (async () => {
    const giftSections = await Promise.all(
      GIFT_WRAPPING_SECTION_CONFIG.map((section) =>
        buildGiftWrappingSection(section, getSectionTitle)
      )
    );

    // Filter out null sections (sections with no data from API)
    const sectionsWithItems = giftSections.filter(
      (section): section is GiftWrappingSection => section !== null
    );

    // Find the gift ID by SKU if provided, otherwise use first item
    let defaultSelectedGiftId: null | string = null;
    if (selectedSku) {
      for (const section of sectionsWithItems) {
        const gift = section.items.find((item) => item.sku === selectedSku);
        if (gift) {
          defaultSelectedGiftId = gift.id;
          break;
        }
      }
    }

    if (!defaultSelectedGiftId) {
      defaultSelectedGiftId = sectionsWithItems[0]?.items?.[0]?.id ?? null;
    }

    return {
      defaultSelectedGiftId,
      giftSections: sectionsWithItems,
    };
  })();

  return (
    <AddGiftWrappingDrawerLayout
      defaultGiftMessage={giftMessage}
      giftDataPromise={giftDataPromise}
      selectedSku={selectedSku}
    />
  );
};
