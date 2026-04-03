"use server";

import { getLocale } from "next-intl/server";

import { graphqlRequest } from "@/lib/clients/graphql";
import { Locale, LOCALE_TO_STORE } from "@/lib/constants/i18n";
import { ok } from "@/lib/utils/service-result";

interface KsaAddressResponse {
  Message?: {
    MessageCode?: string;
    MessageDescriptionAr?: string;
    MessageDescriptionEn?: string;
  };
  NationalAddress?: KsaNationalAddress;
  success: boolean;
}

interface KsaNationalAddress {
  additionalNumber?: string;
  address1?: string;
  address2?: string;
  buildingNumber?: string;
  city?: string;
  cityId?: string;
  district?: string;
  language?: string;
  latitude?: string;
  longitude?: string;
  postCode?: string;
  region?: string;
  short_address?: string;
  street?: string;
}

export const getKsaAddress = async ({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) => {
  try {
    const locale = (await getLocale()) as Locale;

    // console.warn("[getKsaAddress] DEBUG locale detection:", {
    //   detectedLocale: locale,
    //   type: typeof locale,
    // });

    // Extract language code from locale (e.g., 'ar-SA' -> 'ar', 'en-US' -> 'en')
    const languageCode = locale.split("-")[0];

    // Map locale to language code: ar -> A, en -> E
    const languageMap: Record<string, "A" | "E"> = {
      ar: "A",
      en: "E",
    };
    const language = languageMap[languageCode] || "E";

    // console.warn("[getKsaAddress] DEBUG language mapping:", {
    //   language,
    //   languageCode,
    //   locale,
    //   mappingResult: languageMap[languageCode],
    // });

    // Construct query without variables (hardcoded in query string)
    // This matches the working Postman query format
    const queryString = `
      query GetKsaAddress {
        getKsaAddress(
          language: "${language}"
          longitude: "${longitude.toString()}"
          latitude: "${latitude.toString()}"
        ) {
          success
          NationalAddress {
            additionalNumber
            address1
            address2
            buildingNumber
            city
            cityId
            district
            language
            latitude
            longitude
            postCode
            region
            short_address
            street
          }
          Message {
            MessageCode
            MessageDescriptionAr
            MessageDescriptionEn
          }
        }
      }
    `;

    console.info("[getKsaAddress] Request Details:", {
      language,
      latitude,
      locale,
      longitude,
      query: queryString.substring(0, 200),
      storeCode: LOCALE_TO_STORE[locale],
    });

    const response = await graphqlRequest<{
      getKsaAddress: KsaAddressResponse;
    }>({
      query: queryString as any,
      storeCode: LOCALE_TO_STORE[locale],
    });

    console.info("[getKsaAddress] Full GraphQL Response:", {
      errors: response.errors,
      hasData: !!response.data,
      hasErrors: !!(response.errors && response.errors.length > 0),
      response,
    });

    if (response.errors && response.errors.length > 0) {
      // Silent fallback - don't show error, just return null
      console.warn(
        "[getKsaAddress] GraphQL error:",
        response.errors[0]?.message
      );
      return ok<KsaNationalAddress | null>(null);
    }

    const ksaResponse = response.data?.getKsaAddress;
    console.info("[getKsaAddress] KSA Response object:", {
      ksaResponse,
      message: ksaResponse?.Message,
      nationalAddress: ksaResponse?.NationalAddress,
      success: ksaResponse?.success,
    });

    const ksaAddress = ksaResponse?.NationalAddress;

    if (!ksaAddress || !ksaResponse?.success) {
      // Silent fallback - address validation failed
      console.warn("[getKsaAddress] Address validation failed or no data");
      return ok<KsaNationalAddress | null>(null);
    }

    console.info("[getKsaAddress] Successfully parsed KSA address:", {
      address1: ksaAddress.address1,
      buildingNumber: ksaAddress.buildingNumber,
      city: ksaAddress.city,
      district: ksaAddress.district,
      postCode: ksaAddress.postCode,
      shortAddress: ksaAddress.short_address,
      street: ksaAddress.street,
    });

    return ok(ksaAddress);
  } catch (error) {
    // Silent fallback on any error
    console.warn("[getKsaAddress] Error fetching KSA address:", {
      error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return ok<KsaNationalAddress | null>(null);
  }
};
