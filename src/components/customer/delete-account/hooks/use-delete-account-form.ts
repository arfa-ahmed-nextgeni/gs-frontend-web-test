import { useTransition } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";

import { useToastContext } from "@/components/providers/toast-provider";
import { useRouter } from "@/i18n/navigation";
import { invalidateSession } from "@/lib/actions/auth/invalidate-session";
import { deleteCustomerAccount } from "@/lib/actions/customer/delete-customer-account";
import { trackDeleteUser } from "@/lib/analytics/events";
import { ROUTES } from "@/lib/constants/routes";
import {
  DeleteAccountFormField,
  deleteAccountFormSchema,
} from "@/lib/forms/delete-account";

export const useDeleteAccountForm = () => {
  const router = useRouter();
  const t = useTranslations("CustomerProfilePage.messages");

  const { showError, showSuccess } = useToastContext();

  const [isNavigating, startNavigating] = useTransition();

  const deleteAccountForm = useForm({
    defaultValues: {
      [DeleteAccountFormField.DeleteReason]: "",
    },
    resolver: zodResolver(deleteAccountFormSchema),
  });

  const { handleSubmit } = deleteAccountForm;

  const handleSubmitForm = handleSubmit(
    async () => {
      const response = await deleteCustomerAccount();
      if (response.success) {
        // Track delete_user when user successfully deletes their account
        trackDeleteUser();
        showSuccess(response.message || t("accountDeleteSuccess"), " ");
        startNavigating(async () => {
          await invalidateSession();
          router.replace(ROUTES.ROOT);
        });
      } else {
        showError(response.error, " ");
      }
    },
    (error) => {
      console.error(error);
    }
  );

  return {
    deleteAccountForm,
    handleSubmitForm,
    isNavigating,
  };
};
