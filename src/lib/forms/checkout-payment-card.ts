import cardValidator from "card-validator";
import * as z from "zod";

import { PaymentCardNetwork } from "@/lib/constants/payment-card";
import { detectPaymentCardNetwork } from "@/lib/utils/payment-card";

export const enum CheckoutPaymentCardFormField {
  CardExpiry = "card-expiry",
  CardNumber = "card-number",
  Cvv = "cvv",
  SaveAsDefault = "save-as-default-card",
}

export const checkoutPaymentCardFormSchema = z.object({
  [CheckoutPaymentCardFormField.CardExpiry]: z
    .string()
    .min(1, "messages.requiredField")
    .refine(
      (expiryDate) => cardValidator.expirationDate(expiryDate).isValid,
      "messages.invalidDate"
    ),
  [CheckoutPaymentCardFormField.CardNumber]: z
    .string()
    .min(1, "messages.requiredField")
    .transform((val) => val.replace(/\s/g, ""))
    .refine((cardNumber) => {
      // Check if it's a valid card using cardValidator (for Visa/Mastercard)
      const validation = cardValidator.number(cardNumber);
      if (validation.isValid) {
        return true;
      }
      // Check if it's a Mada card using custom detection
      const detectedNetwork = detectPaymentCardNetwork(cardNumber);
      if (detectedNetwork === PaymentCardNetwork.Mada) {
        // Mada cards are typically 16 digits (standard credit/debit card length)
        return (
          cardNumber.length >= 16 &&
          cardNumber.length <= 19 &&
          /^\d+$/.test(cardNumber)
        );
      }
      return false;
    }, "messages.invalidCardNumber")
    .refine((cardNumber) => {
      const validation = cardValidator.number(cardNumber);
      const detectedNetwork = detectPaymentCardNetwork(cardNumber);
      const allowedTypes = [
        PaymentCardNetwork.Visa,
        PaymentCardNetwork.Mastercard,
        PaymentCardNetwork.Mada,
      ];

      // Check if cardValidator recognizes it as an allowed type
      if (
        validation.card?.type &&
        allowedTypes.includes(validation.card?.type as PaymentCardNetwork)
      ) {
        return true;
      }

      // Check if our custom detection found it as Mada
      if (detectedNetwork === PaymentCardNetwork.Mada) {
        return true;
      }

      return false;
    }, "messages.unsupportedCardType"),
  [CheckoutPaymentCardFormField.Cvv]: z
    .string()
    .min(1, "messages.requiredField")
    .refine((cvv) => /^\d{3}$/.test(cvv), "messages.invalidCvv"),
  [CheckoutPaymentCardFormField.SaveAsDefault]: z.coerce.boolean().optional(),
});

export type CheckoutPaymentCardFormSchemaType = z.infer<
  typeof checkoutPaymentCardFormSchema
>;
