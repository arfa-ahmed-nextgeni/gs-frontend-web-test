import { type ProductCardModel } from "@/lib/models/product-card-model";
import {
  type Aggregation,
  type DynamicCategoryFilter,
  type ProductSearchResponse,
} from "@/lib/types/catalog-service";
import { transformProductViewToCardModel } from "@/lib/utils/catalog-service-product-transformer";
import {
  convertFacetsToDynamicFilters,
  extractPriceBoundsFromFacets,
} from "@/lib/utils/catalog-service-transformers";

interface CategoryListingModelArgs {
  filtersResponse?: ProductSearchResponse;
  page?: number;
  pageSize?: number;
  productsResponse?: ProductSearchResponse;
}

export class CategoryListingModel {
  dynamicFilters: DynamicCategoryFilter[];
  priceBounds?: { max: number; min: number };
  productResponse: ProductSearchResponse;
  products: ProductCardModel[];
  totalCount: number;
  totalPages: number;

  constructor({
    filtersResponse,
    page = 1,
    pageSize = 20,
    productsResponse,
  }: CategoryListingModelArgs) {
    const productResponse =
      productsResponse || createEmptyProductSearchResponse(page, pageSize);
    const facets = (filtersResponse?.facets ||
      productResponse.facets ||
      []) as Aggregation[];

    this.dynamicFilters = convertFacetsToDynamicFilters(facets);
    this.productResponse = productResponse;
    this.products =
      productResponse.items
        ?.map((item) =>
          item.productView
            ? transformProductViewToCardModel(item.productView)
            : null
        )
        .filter((product): product is ProductCardModel => product !== null) ||
      [];
    this.priceBounds =
      extractPriceBoundsFromFacets(
        (productResponse.facets || []) as Aggregation[]
      ) || extractPriceBoundsFromProducts(this.products);
    this.totalCount = productResponse.total_count || 0;
    this.totalPages = productResponse.page_info?.total_pages || 1;
  }
}

function createEmptyProductSearchResponse(
  currentPage = 1,
  pageSize = 20
): ProductSearchResponse {
  return {
    facets: [],
    items: [],
    page_info: {
      current_page: currentPage,
      page_size: pageSize,
      total_pages: 0,
    },
    total_count: 0,
  };
}

function extractPriceBoundsFromProducts(
  products: ProductCardModel[]
): { max: number; min: number } | undefined {
  const prices = products
    .map((product) => product.priceValue)
    .filter(
      (price): price is number =>
        typeof price === "number" && Number.isFinite(price)
    );

  if (!prices.length) {
    return undefined;
  }

  return {
    max: Math.max(...prices),
    min: Math.min(...prices),
  };
}
