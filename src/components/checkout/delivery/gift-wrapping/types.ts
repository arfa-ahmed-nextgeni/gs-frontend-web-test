export interface GiftWrappingProduct {
  id: string;
  imageUrl?: string;
  name: string;
  priceLabel: string;
  sku: string;
}

export interface GiftWrappingResolvedData {
  defaultSelectedGiftId: null | string;
  giftSections: GiftWrappingSection[];
}

export interface GiftWrappingSection {
  id: string;
  items: GiftWrappingProduct[];
  title: string;
}
