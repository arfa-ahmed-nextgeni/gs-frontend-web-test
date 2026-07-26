import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";

import { appApiRequest } from "@/lib/clients/app-client";
import { APP_API_ENDPOINTS } from "@/lib/constants/api/endpoints";
import { Locale } from "@/lib/constants/i18n";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import { isError } from "@/lib/utils/service-result";

export interface ProductReviewsQueryData {
  reviews: {
    author: string;
    date: string;
    id: number;
    message: string;
    rating: number;
  }[];
  totalPages: number;
}

export const useProductReviewsQuery = ({
  initialData,
  page,
  pageSize,
  productId,
  sortBy,
  useInitialData,
}: {
  initialData?: ProductReviewsQueryData;
  page: number;
  pageSize: number;
  productId: number;
  sortBy?: string;
  useInitialData: boolean;
}) => {
  const locale = useLocale() as Locale;

  return useQuery({
    initialData: useInitialData ? initialData : undefined,
    placeholderData: keepPreviousData,
    queryFn: async ({ signal }) => {
      const response = await appApiRequest<ProductReviewsQueryData>({
        endpoint: APP_API_ENDPOINTS.PRODUCTS.REVIEWS({
          locale,
          page,
          pageSize,
          productId,
          sortBy,
        }),
        options: {
          signal,
        },
      });

      if (isError(response)) {
        throw new Error(response.error);
      }

      return response.data;
    },
    queryKey: QUERY_KEYS.PRODUCTS.REVIEWS({
      locale,
      page,
      pageSize,
      productId,
      sortBy,
    }),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};
