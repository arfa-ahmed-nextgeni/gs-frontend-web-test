"use server";

import { revalidatePath } from "next/cache";
import { unauthorized } from "next/navigation";

import { getLocale, getTranslations } from "next-intl/server";

import { CustomerInput } from "@/graphql/graphql";
import { getAuthToken } from "@/lib/actions/auth/get-auth-token";
import { graphqlRequest } from "@/lib/clients/graphql";
import { CUSTOMER_GRAPHQL_MUTATIONS } from "@/lib/constants/api/graphql/customer";
import { Locale, LOCALE_TO_STORE } from "@/lib/constants/i18n";
import { ROUTES } from "@/lib/constants/routes";
import {
  UpdateProfileFormField,
  updateProfileFormSchema,
} from "@/lib/forms/update-profile";
import { getCommonErrorMessage } from "@/lib/utils/common-error-message";
import { failure, ok } from "@/lib/utils/service-result";

export async function updateProfileAction(formData: FormData) {
  const t = await getTranslations("CustomerProfilePage.messages");
  const tCommonErrors = await getTranslations("CommonErrors");
  try {
    const authToken = await getAuthToken();

    if (!authToken) {
      unauthorized();
    }

    const locale = (await getLocale()) as Locale;

    const payload = updateProfileFormSchema.parse(Object.fromEntries(formData));

    const response = await graphqlRequest({
      authToken,
      query: CUSTOMER_GRAPHQL_MUTATIONS.UPDATE_CUSTOMER,
      storeCode: LOCALE_TO_STORE[locale],
      variables: {
        input: {
          date_of_birth: payload[UpdateProfileFormField.DateOfBirth],
          email: payload[UpdateProfileFormField.Email],
          firstname: payload[UpdateProfileFormField.FirstName],
          gender: +payload[UpdateProfileFormField.Gender],
          lastname: payload[UpdateProfileFormField.LastName],
          // @ts-expect-error send password true to update email
          password: true,
        },
      },
    });

    if (
      (response.errors && response.errors.length > 0) ||
      !response.data?.updateCustomer
    ) {
      let errorMessage =
        response?.errors?.[0]?.message || "profileUpdateFailed";

      if (errorMessage?.endsWith("is not a valid email address.")) {
        errorMessage = "invalidEmail";
      }

      return {
        data: null,
        error: t.has(errorMessage as any)
          ? t(errorMessage as any)
          : errorMessage,
        success: false,
      };
    }

    revalidatePath(ROUTES.CUSTOMER.ROOT, "layout");

    return {
      data: response.data.updateCustomer?.customer || null,
      message: t("profileUpdated"),
      success: true,
    };
  } catch (error) {
    console.error("Error updating customer:", error);

    const errorMessage = getCommonErrorMessage({
      error,
      fallbackMessage: t("profileUpdateFailed"),
      tCommonErrors,
    });

    return {
      data: null,
      error: errorMessage,
      success: false,
    };
  }
}

export async function updateProfileFromAddress({
  email,
  firstName,
  lastName,
}: {
  email?: string;
  firstName?: string;
  lastName?: string;
}) {
  const t = await getTranslations("CustomerProfilePage.messages");
  const tCommonErrors = await getTranslations("CommonErrors");
  try {
    const authToken = await getAuthToken();

    if (!authToken) {
      unauthorized();
    }

    const locale = (await getLocale()) as Locale;

    const payload: CustomerInput = {};

    if (firstName) {
      payload.firstname = firstName;
    }

    if (lastName) {
      payload.lastname = lastName;
    }

    if (email) {
      payload.email = email;
      // @ts-expect-error send password true to update email
      payload.password = true;
    }

    const response = await graphqlRequest({
      authToken,
      query: CUSTOMER_GRAPHQL_MUTATIONS.UPDATE_CUSTOMER,
      storeCode: LOCALE_TO_STORE[locale],
      variables: {
        input: payload,
      },
    });

    if (
      (response.errors && response.errors.length > 0) ||
      !response.data?.updateCustomer
    ) {
      const errorMessage =
        response?.errors?.[0]?.message || "profileUpdateFailed";

      return failure(
        t.has(errorMessage as any) ? t(errorMessage as any) : errorMessage
      );
    }

    revalidatePath(ROUTES.CUSTOMER.ROOT, "layout");

    return ok(t("profileUpdated"));
  } catch (error) {
    console.error("Error updating customer:", error);

    const errorMessage = getCommonErrorMessage({
      error,
      fallbackMessage: t("profileUpdateFailed"),
      tCommonErrors,
    });

    return failure(errorMessage);
  }
}
