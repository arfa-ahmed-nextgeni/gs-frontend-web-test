import dayjs from "dayjs";
import * as z from "zod";

import { REGEX } from "@/lib/constants/regex";

export const enum UpdateProfileFormField {
  DateOfBirth = "date-of-birth",
  Email = "email",
  FirstName = "first-name",
  Gender = "gender",
  LastName = "last-name",
  PhoneNumber = "phone-number",
}

export const updateProfileFormSchema = z.object({
  [UpdateProfileFormField.DateOfBirth]: z
    .string()
    .min(1, "messages.requiredField")
    .refine((date) => dayjs(date).isValid(), "messages.invalidDate")
    .refine(
      (date) =>
        dayjs(date).isBefore(dayjs()) || dayjs(date).isSame(dayjs(), "day"),
      "messages.notFutureDate"
    ),
  [UpdateProfileFormField.Email]: z
    .string()
    .trim()
    .min(1, "messages.requiredField")
    .email("messages.invalidEmail"),
  [UpdateProfileFormField.FirstName]: z
    .string()
    .trim()
    .min(1, "messages.requiredField")
    .regex(REGEX.NO_SPECIAL_CHARS, {
      message: "messages.specialCharsNotAllowed",
    })
    .max(50, "messages.maxFiftyCharsAllowed"),
  [UpdateProfileFormField.Gender]: z
    .string()
    .trim()
    .min(1, "messages.requiredField"),
  [UpdateProfileFormField.LastName]: z
    .string()
    .trim()
    .min(1, "messages.requiredField")
    .regex(REGEX.NO_SPECIAL_CHARS, {
      message: "messages.specialCharsNotAllowed",
    })
    .max(50, "messages.maxFiftyCharsAllowed"),
  [UpdateProfileFormField.PhoneNumber]: z
    .object({
      countryCode: z.string(),
      number: z.string(),
    })
    .optional(),
});

export type UpdateProfileFormSchemaType = z.infer<
  typeof updateProfileFormSchema
>;
