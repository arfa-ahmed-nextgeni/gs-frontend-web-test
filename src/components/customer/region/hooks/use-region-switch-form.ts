import { useTransition } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale } from "next-intl";

import { useStoreConfig } from "@/contexts/store-config-context";
import { useLocaleInfo } from "@/hooks/i18n/use-locale-info";
import { useRouter } from "@/i18n/navigation";
import { invalidateSession } from "@/lib/actions/auth/invalidate-session";
import { trackChangeStore } from "@/lib/analytics/events";
import { PROTOCOL } from "@/lib/constants/environment";
import { LanguageCode, LOCALE_TO_DOMAIN } from "@/lib/constants/i18n";
import { ROUTES } from "@/lib/constants/routes";
import {
  RegionSwitchFormField,
  regionSwitchFormSchema,
} from "@/lib/forms/region-switch";
import { LocaleSwitchOption } from "@/lib/types/store-config";

export const useRegionSwitchForm = ({
  localeSwitchOptions,
}: {
  localeSwitchOptions: LocaleSwitchOption[];
}) => {
  const router = useRouter();
  const locale = useLocale();
  const { language, region } = useLocaleInfo();

  const { storeConfig } = useStoreConfig();

  const [isNavigating, startNavigating] = useTransition();

  const regionSwitchForm = useForm({
    defaultValues: {
      [RegionSwitchFormField.Country]: region,
    },
    resolver: zodResolver(regionSwitchFormSchema),
  });

  const { handleSubmit, reset } = regionSwitchForm;

  const handleSubmitForm = handleSubmit(
    async (data) => {
      const selectedLanguage = language;
      const selectedCountry = data[RegionSwitchFormField.Country];
      const selectedLocaleSwitchOption = localeSwitchOptions.find(
        (localeSwitchOption) => localeSwitchOption.code === selectedCountry
      );
      const currentLocaleDomain =
        LOCALE_TO_DOMAIN[locale as keyof typeof LOCALE_TO_DOMAIN];

      // Track change_store when user switches stores
      trackChangeStore(
        storeConfig?.code || locale,
        selectedLanguage === LanguageCode.AR
          ? (selectedLocaleSwitchOption?.arStoreCode ?? "")
          : (selectedLocaleSwitchOption?.enStoreCode ?? "")
      );

      startNavigating(async () => {
        const isSameDomain =
          currentLocaleDomain === selectedLocaleSwitchOption?.domain;

        if (isSameDomain) {
          router.replace(ROUTES.CUSTOMER.ACCOUNT, {
            locale: selectedLanguage,
          });
        } else {
          await invalidateSession();
          router.replace(
            `${PROTOCOL}://${selectedLocaleSwitchOption?.domain}/${selectedLanguage === LanguageCode.AR ? selectedLocaleSwitchOption?.arLocale : selectedLocaleSwitchOption?.enLocale}${ROUTES.CUSTOMER.ACCOUNT}`
          );
        }

        reset({
          [RegionSwitchFormField.Country]: selectedCountry,
        });
      });
    },
    (error) => {
      console.error(error);
    }
  );

  return {
    handleSubmitForm,
    isNavigating,
    regionSwitchForm,
  };
};
