import { useTransition } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { useLocaleInfo } from "@/hooks/i18n/use-locale-info";
import { useRouter } from "@/i18n/navigation";
import { trackLanguagePick } from "@/lib/analytics/events";
import { COUNTRY_CODE_TO_NAME } from "@/lib/constants/i18n";
import { ROUTES } from "@/lib/constants/routes";
import {
  LanguageSwitchFormField,
  languageSwitchFormSchema,
} from "@/lib/forms/language-switch";

export const useLanguageSwitchForm = () => {
  const router = useRouter();
  const { language, region } = useLocaleInfo();

  const [isNavigating, startNavigating] = useTransition();

  const languageSwitchForm = useForm({
    defaultValues: {
      [LanguageSwitchFormField.Language]: language,
    },
    resolver: zodResolver(languageSwitchFormSchema),
  });

  const { handleSubmit, reset } = languageSwitchForm;

  const handleSubmitForm = handleSubmit(
    async (data) => {
      const selectedLanguage = data[LanguageSwitchFormField.Language];

      // Track langauge_pick event
      trackLanguagePick({
        country: COUNTRY_CODE_TO_NAME[region],
        Language: selectedLanguage,
      });

      startNavigating(() => {
        router.replace(ROUTES.CUSTOMER.ACCOUNT, {
          locale: selectedLanguage,
        });

        reset({
          [LanguageSwitchFormField.Language]: selectedLanguage,
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
    languageSwitchForm,
  };
};
