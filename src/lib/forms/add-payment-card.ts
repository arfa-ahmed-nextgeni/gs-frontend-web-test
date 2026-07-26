import * as z from "zod";

export const enum AddPaymentCardFormField {
  CheckoutComToken = "checkout-com-token",
  SaveAsDefault = "save-as-default-card",
}

export const addPaymentCardFormSchema = z.object({
  [AddPaymentCardFormField.CheckoutComToken]: z
    .string()
    .min(1, "messages.requiredField"),
  [AddPaymentCardFormField.SaveAsDefault]: z.coerce.boolean(),
});
