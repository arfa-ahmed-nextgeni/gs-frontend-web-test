import { useTransition } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { useToastContext } from "@/components/providers/toast-provider";
import { usePaymentCardsContext } from "@/contexts/payment-cards-context";
import { useRouter } from "@/i18n/navigation";
import { addCustomerPaymentCard } from "@/lib/actions/customer/add-customer-payment-card";
import { trackAddCard } from "@/lib/analytics/events";
import {
  AddPaymentCardFormField,
  addPaymentCardFormSchema,
} from "@/lib/forms/add-payment-card";

export const useAddPaymentCardForm = ({
  closeDialog,
}: {
  closeDialog: () => void;
}) => {
  const router = useRouter();

  const { paymentCardsLength } = usePaymentCardsContext();

  const { showError, showSuccess } = useToastContext();

  const [isRefreshing, startRefresh] = useTransition();

  const addPaymentCardForm = useForm({
    defaultValues: {
      [AddPaymentCardFormField.CardExpiry]: "",
      [AddPaymentCardFormField.CardNumber]: "",
      [AddPaymentCardFormField.SaveAsDefault]: !paymentCardsLength,
    },
    mode: "onChange",
    resolver: zodResolver(addPaymentCardFormSchema),
  });

  const { handleSubmit } = addPaymentCardForm;

  const handleSubmitForm = handleSubmit(
    async (data) => {
      const formData = new FormData();
      formData.append(
        AddPaymentCardFormField.CardNumber,
        data[AddPaymentCardFormField.CardNumber]
      );
      formData.append(
        AddPaymentCardFormField.CardExpiry,
        data[AddPaymentCardFormField.CardExpiry]
      );
      formData.append(
        AddPaymentCardFormField.SaveAsDefault,
        data[AddPaymentCardFormField.SaveAsDefault]
          ? `${data[AddPaymentCardFormField.SaveAsDefault]}`
          : ""
      );

      const response = await addCustomerPaymentCard(formData);

      if (response.success) {
        // Track add_card when user adds a new credit card
        // card_list_size is the number of cards after adding this one
        const cardListSize = paymentCardsLength + 1;
        trackAddCard("account", cardListSize);
        startRefresh(() => {
          router.refresh();
          showSuccess(response.message, " ");
          closeDialog();
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
    addPaymentCardForm,
    handleSubmitForm,
    isRefreshing,
  };
};
