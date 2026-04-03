import * as z from "zod";

export const enum LanguageSwitchFormField {
  Language = "language",
}

export const languageSwitchFormSchema = z.object({
  [LanguageSwitchFormField.Language]: z
    .string()
    .trim()
    .min(1, "messages.requiredField"),
});
