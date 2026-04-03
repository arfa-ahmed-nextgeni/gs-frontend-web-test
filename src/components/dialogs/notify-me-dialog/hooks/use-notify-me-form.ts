import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { useSubscribeStockNotification } from "@/hooks/mutations/product/use-subscribe-stock-notification";
import { useCustomerQuery } from "@/hooks/queries/use-customer-query";
import { NotifyMeFormField, notifyMeFormSchema } from "@/lib/forms/notify-me";

export const useNotifyMeForm = ({
  onSuccess,
  productId,
}: {
  onSuccess: () => void;
  productId: string;
}) => {
  const { data: customer } = useCustomerQuery();
  const { mutateAsync } = useSubscribeStockNotification({
    onSuccess,
    productId,
  });

  const notifyMeForm = useForm({
    resolver: zodResolver(notifyMeFormSchema),
    values: {
      [NotifyMeFormField.Email]: customer?.email || "",
    },
  });

  const { handleSubmit } = notifyMeForm;

  const handleSubmitForm = handleSubmit(
    async (data) => {
      await mutateAsync({ email: data[NotifyMeFormField.Email], productId });
    },
    (error) => {
      console.error(error);
    }
  );

  return {
    handleSubmitForm,
    notifyMeForm,
  };
};
