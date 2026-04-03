import * as z from "zod";

import { madatoryEmailSchema } from "@/lib/utils/validation-schemas";

export const enum NotifyMeFormField {
  Email = "email",
}

export const notifyMeFormSchema = z.object({
  [NotifyMeFormField.Email]: madatoryEmailSchema,
});
