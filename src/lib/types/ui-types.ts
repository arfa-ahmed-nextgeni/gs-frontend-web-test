export type AccordionGroupProps = {
  items: AccordionItem[];
  variant?: "transparent" | "underline";
};

export type AccordionItem = {
  content: AccordionItem[] | string;
  id: number;
  title: string;
};

export type Attachment = {
  id: number | string;
  original: string;
  original2: string;
  thumbnail: string;
};

export type Blog = {
  [key: string]: unknown;
  authorName: string;
  category: string;
  comments?: object;
  content?: string;
  contentThree?: string;
  contentTwo?: string;
  date: string;
  discount?: object;
  id: number;
  image: string;
  postList?: object;
  quote: {
    content: string;
  };
  shortDescription: string;
  sku?: string;
  slug: string;
  subTitle: string;
  tags?: Tag;
  title: string;
  titleTwo: string;
  totalCommentCount?: number;
  totalWatchCount?: number;
};

export type BreakpointKey = "2xl" | "lg" | "md" | "sm" | "xl";

export type BreakpointMap = Record<BreakpointKey, number>;

export type CarouselHandle = {
  scrollNext: () => void;
  scrollPrev: () => void;
  scrollTo: (index: number) => void;
  selectedIndex: number;
};

export type CategoriesQueryOptionsType = {
  category?: string;
  limit?: number;
  status?: string;
  text?: string;
};

export type Category = {
  [key: string]: unknown;
  children?: [Category];
  id: number;
  image?: Attachment;
  name: string;
  productCount?: number;
  products?: Product[];
  slug: string;
};

export type CollapseProps = {
  isOpen: boolean;
  item: AccordionItem;
  onToggle: () => void;
  variant?: "transparent" | "underline";
};
export type MainMenuType = {
  id: number | string;
  label: string;
  mega_bannerImg?: string;
  mega_bannerMode?: string;
  mega_bannerUrl?: string;
  mega_categoryCol?: number;
  mega_contentBottom?: string;
  path: string;
  style?: React.CSSProperties;
  subMenu?: SubMenuType[];
  type?: string;
};

export type MenutopType = {
  id: number;
  label: string;
  path: string;
};
// Define types based on the new data structure
export interface Option {
  name: string;
  value: string;
}

export type Order = {
  cod_fee?: number;
  contactPhone?: string;
  customer: {
    email: string;
    id: number;
  };
  deliveryAddressText?: string;
  deliveryLabel?: string;
  discount?: number;
  id: number | string;
  mokafaaDiscount: number;
  // Optional order details used on the confirmation page
  paymentMethod?: string;
  paymentMethodType?: string;
  products: OrderItem[];
  shipping_fee: number;
  tax?: number;
  total: number;
  tracking_number: string;
};

export type OrderItem = {
  id: number | string;
  image: Attachment;
  name: string;
  price: number;
  productId?: number | string;
  quantity: number;
  sku?: string;
};

export interface PaginatedProduct {
  data: Product[];
  paginatorInfo: {
    nextPage: null | number;
    total: number;
  };
}

export type Product = {
  [key: string]: unknown;
  brand: string;
  category: Category[];
  description?: string;
  discountPercentage: number;
  gallery?: Attachment[];
  id: number | string;
  image: Attachment;
  max_price?: number;
  meta?: never[];
  min_price?: number;
  model?: string;
  name: string;
  operating?: string;
  price: number;
  quantity: number;
  rating: number;
  sale_price?: number;
  screen?: string;
  sku?: string;
  slug: string;
  sold: number;
  tag?: Tag[];
  unit?: string;
  variation_options: VariationOption[];
  variations?: Variation[];
  videoUrl: string;
  weight: number;
};

export type QueryOptionsType = {
  category?: string;
  limit?: number;
  sort_by?: string; // Added for newQuery
  status?: string;
  text?: string;
};

export type SelectOption = {
  label: string;
  value: string;
};

export type StoreType = {
  address?: string;
  email?: string;
  id: number;
  image?: string;
  location?: string;
  name: string;
  openTime?: string;
  phoneNumber?: number;
};

export type SubMenuType = {
  id: number | string;
  image?: Attachment;
  label: string;
  path: string;
  style?: React.CSSProperties;
  subMenu?: SubMenuType[];
};

export type TabType = "COLOR" | "LAYOUT" | "THEME";

export type Tag = {
  id: number | string;
  name: string;
  slug: string;
};

export type ThemeDirection = "ltr" | "rtl";

export type ThemeMode = "dark" | "light";

export interface Variation {
  attribute: Attribute;
  attribute_id: number;
  id: number;
  value: string;
}
export interface VariationItem {
  attribute_id: number;
  id: number;
  image: string;
  value: string;
}

export interface VariationOption {
  id: number;
  image: Attachment;
  is_disable: number;
  options: Option[];
  price: number;
  quantity: number;
  sale_price: number;
  sku: string;
  title: string;
}

export interface VariationsType {
  [key: string]: {
    options: VariationItem[];
    type:
      | "dropdown"
      | "radio"
      | "rectangle"
      | "rectangleColor"
      | "swatch"
      | "swatchImage";
  };
}
interface Attribute {
  id: number;
  name: string;
  slug: string;
  type:
    | "dropdown"
    | "radio"
    | "rectangle"
    | "rectangleColor"
    | "swatch"
    | "swatchImage";
  values: VariationValue[];
}

interface VariationValue {
  attribute_id: number;
  id: number;
  image?: string;
  value: string;
}
