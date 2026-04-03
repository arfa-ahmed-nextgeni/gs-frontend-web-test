import * as z from "zod";

export const enum DeleteAccountFormField {
  DeleteReason = "delete-reason",
}

export const deleteAccountFormSchema = z.object({
  [DeleteAccountFormField.DeleteReason]: z
    .string()
    .trim()
    .min(1, "messages.requiredField"),
});
