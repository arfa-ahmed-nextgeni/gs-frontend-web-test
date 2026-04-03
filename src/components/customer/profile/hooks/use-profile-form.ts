import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { parsePhoneNumberWithError } from "libphonenumber-js";
import { useLocale } from "next-intl";

import { useToastContext } from "@/components/providers/toast-provider";
import { useStoreCode } from "@/hooks/i18n/use-store-code";
import { getCustomerQueryConfig } from "@/hooks/queries/use-customer-query";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useRouter } from "@/i18n/navigation";
import { updateProfileAction } from "@/lib/actions/customer/update-profile";
import {
  setUserPropertiesFromCustomer,
  trackEditProfile,
  trackProfileUpdated,
} from "@/lib/analytics/events";
import { buildUserPropertiesFromCustomer } from "@/lib/analytics/utils/build-properties";
import { Locale } from "@/lib/constants/i18n";
import { ROUTES } from "@/lib/constants/routes";
import {
  UpdateProfileFormField,
  updateProfileFormSchema,
} from "@/lib/forms/update-profile";
import { getDefaultCountryCode } from "@/lib/utils/country";

export const useProfileForm = ({
  dateOfBirth,
  email,
  firstName,
  gender,
  lastName,
  phoneNumber,
}: {
  dateOfBirth?: null | string;
  email?: null | string;
  firstName?: null | string;
  gender?: null | number;
  lastName?: null | string;
  phoneNumber?: null | string;
}) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const locale = useLocale() as Locale;
  const { showError, showSuccess } = useToastContext();

  const { storeCode } = useStoreCode();

  const isMobile = useIsMobile();

  let parsedPhoneNumber = {
    countryCallingCode: getDefaultCountryCode(storeCode),
    nationalNumber: "",
  };

  if (phoneNumber) {
    try {
      parsedPhoneNumber = parsePhoneNumberWithError(phoneNumber);
    } catch (error) {
      console.warn("Failed to parse phone number:", error);
    }
  }

  const updateProfileForm = useForm({
    defaultValues: {
      [UpdateProfileFormField.DateOfBirth]: dateOfBirth || "",
      [UpdateProfileFormField.Email]: email || "",
      [UpdateProfileFormField.FirstName]: firstName || "",
      [UpdateProfileFormField.Gender]: gender ? `${gender}` : "",
      [UpdateProfileFormField.LastName]: lastName || "",
      [UpdateProfileFormField.PhoneNumber]: {
        countryCode: `+${parsedPhoneNumber.countryCallingCode}` || "",
        number: parsedPhoneNumber.nationalNumber || "",
      },
    },
    resolver: zodResolver(updateProfileFormSchema),
  });

  const { handleSubmit, reset } = updateProfileForm;

  const handleSubmitForm = handleSubmit(
    async (data) => {
      const formData = new FormData();
      formData.append(
        UpdateProfileFormField.FirstName,
        data[UpdateProfileFormField.FirstName]
      );
      formData.append(
        UpdateProfileFormField.LastName,
        data[UpdateProfileFormField.LastName]
      );
      formData.append(
        UpdateProfileFormField.Email,
        data[UpdateProfileFormField.Email]
      );
      formData.append(
        UpdateProfileFormField.DateOfBirth,
        data[UpdateProfileFormField.DateOfBirth]
      );
      formData.append(
        UpdateProfileFormField.Gender,
        data[UpdateProfileFormField.Gender]
      );

      const response = await updateProfileAction(formData);

      if (response.success) {
        const customer = await queryClient.fetchQuery(
          getCustomerQueryConfig(locale)
        );
        if (customer) {
          setUserPropertiesFromCustomer(customer);
        }

        if (!email) {
          trackEditProfile(buildUserPropertiesFromCustomer(customer));
        } else {
          trackProfileUpdated(buildUserPropertiesFromCustomer(customer));
        }
        showSuccess(response.message, " ");
        if (isMobile) {
          router.push(ROUTES.CUSTOMER.ACCOUNT);
        } else {
          reset(data);
          router.refresh();
        }
      } else {
        showError(response.error, " ");
      }
    },
    (error) => {
      console.error(error);
    }
  );

  return {
    handleSubmitForm,
    updateProfileForm,
  };
};
