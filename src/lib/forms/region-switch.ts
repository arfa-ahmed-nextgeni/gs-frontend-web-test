import * as z from "zod";

export const enum RegionSwitchFormField {
  Country = "country",
}

export const regionSwitchFormSchema = z.object({
  [RegionSwitchFormField.Country]: z
    .string()
    .trim()
    .min(1, "messages.requiredField"),
});
