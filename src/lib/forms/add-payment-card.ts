import cardValidator from "card-validator";
import * as z from "zod";

import { PaymentCardNetwork } from "@/lib/constants/payment-card";

export const enum AddPaymentCardFormField {
  CardExpiry = "card-expiry",
  CardNumber = "card-number",
  SaveAsDefault = "save-as-default-card",
}

export const addPaymentCardFormSchema = z.object({
  [AddPaymentCardFormField.CardExpiry]: z
    .string()
    .min(1, "messages.requiredField")
    .refine(
      (expiryDate) => cardValidator.expirationDate(expiryDate).isValid,
      "messages.invalidDate"
    ),
  [AddPaymentCardFormField.CardNumber]: z
    .string()
    .min(1, "messages.requiredField")
    .transform((val) => val.replace(/\s/g, ""))
    .refine(
      (cardNumber) => cardValidator.number(cardNumber).isValid,
      "messages.invalidCardNumber"
    )
    .refine((cardNumber) => {
      const validation = cardValidator.number(cardNumber);
      const allowedTypes = [
        PaymentCardNetwork.Visa,
        PaymentCardNetwork.Mastercard,
      ];
      return (
        validation.card?.type &&
        allowedTypes.includes(validation.card?.type as PaymentCardNetwork)
      );
    }, "messages.unsupportedCardType"),
  [AddPaymentCardFormField.SaveAsDefault]: z.coerce.boolean(),
});
