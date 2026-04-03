import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useLocale } from "next-intl";

import { useToastContext } from "@/components/providers/toast-provider";
import { useCustomerQuery } from "@/hooks/queries/use-customer-query";
import { useRouter } from "@/i18n/navigation";
import { updateProfileFromAddress } from "@/lib/actions/customer/update-profile";
import { addProductReview } from "@/lib/actions/products/add-product-review";
import { trackProductRate } from "@/lib/analytics/events";
import { Locale } from "@/lib/constants/i18n";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import {
  AddProductReviewFormField,
  addProductReviewFormSchema,
} from "@/lib/forms/add-product-review";
import { isError } from "@/lib/utils/service-result";

import type { ProductProperties } from "@/lib/analytics/models/event-models";

export const useProductReviewForm = ({
  product,
  sku,
}: {
  product?: Partial<ProductProperties>;
  sku: string;
}) => {
  const router = useRouter();
  const locale = useLocale() as Locale;
  const queryClient = useQueryClient();
  const { showError, showSuccess } = useToastContext();

  const customer = useCustomerQuery();

  const customerData = customer.data;

  const getDefaultFormValues = () => ({
    [AddProductReviewFormField.Comment]: "",
    [AddProductReviewFormField.FirstName]: customerData?.firstName || "",
    [AddProductReviewFormField.LastName]: customerData?.lastName || "",
    [AddProductReviewFormField.NameAllowed]: false,
    [AddProductReviewFormField.Rating]: 5,
    [AddProductReviewFormField.Title]: "",
  });

  const productReviewForm = useForm({
    mode: "onChange",
    resolver: zodResolver(addProductReviewFormSchema),
    values: getDefaultFormValues(),
  });

  const { handleSubmit, reset } = productReviewForm;

  const handleSubmitForm = handleSubmit(
    async (data) => {
      const firstName = data[AddProductReviewFormField.FirstName];
      const lastName = data[AddProductReviewFormField.LastName];

      const profilePayload = {
        ...(!customerData?.firstName && { firstName }),
        ...(!customerData?.lastName && { lastName }),
      };

      if (Object.keys(profilePayload).length > 0) {
        const updateProfileResponse =
          await updateProfileFromAddress(profilePayload);

        if (isError(updateProfileResponse)) {
          showError(updateProfileResponse.error, " ");
          return;
        }

        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.CUSTOMER(locale),
        });
      }

      const response = await addProductReview({
        nickname: `${firstName} ${lastName}`,
        rating: data[AddProductReviewFormField.Rating],
        sku: sku as string,
        text: data[AddProductReviewFormField.Comment],
        title: data[AddProductReviewFormField.Title],
      });

      if (isError(response)) {
        showError(response.error, " ");
      } else {
        // Track product_rate event on successful review submission
        if (product) {
          trackProductRate(product, {
            "rate.value": data[AddProductReviewFormField.Rating],
          });
        }
        showSuccess(response.data, " ");
        reset(getDefaultFormValues());
        router.back();
      }
    },
    (error) => {
      console.error(error);
    }
  );

  return {
    handleSubmitForm,
    productReviewForm,
  };
};
