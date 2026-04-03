import isEmpty from "lodash/isEmpty";

import { VariationOption } from "@/lib/types/ui-types";

interface Item {
  [key: string]: unknown;
  id: number | string;
  image: {
    [key: string]: unknown;
    thumbnail: string;
  };
  name: string;
  price: number;
  quantity?: number;
  sale_price?: number;
  slug: string;
}

export function constructCartItem(item: Item, variation: VariationOption) {
  const { id, image, name, price, quantity, sale_price, slug, unit } =
    item ?? {};
  if (!isEmpty(variation)) {
    return {
      id: `${id}.${variation.id}`,
      image: image?.thumbnail,
      name: `${name} - ${variation.title}`,
      price: variation.sale_price ? variation.sale_price : variation.price,
      productId: id,
      slug,
      stock: variation.quantity,
      unit,
      variationId: variation.id,
    };
  }
  return {
    id,
    image: image?.thumbnail,
    name,
    price: sale_price ? sale_price : price,
    slug,
    stock: quantity,
    unit,
  };
}
