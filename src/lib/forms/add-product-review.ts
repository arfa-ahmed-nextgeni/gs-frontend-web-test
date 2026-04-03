import * as z from "zod";

import {
  mandatoryStringSchema,
  mustBeTrueSchema,
  numberSchema,
  personNameSchema,
} from "@/lib/utils/validation-schemas";

export const enum AddProductReviewFormField {
  Comment = "comment",
  FirstName = "first-name",
  LastName = "last-name",
  NameAllowed = "name-allowed",
  Rating = "rating",
  Title = "title",
}

export const addProductReviewFormSchema = z.object({
  [AddProductReviewFormField.Comment]: mandatoryStringSchema,
  [AddProductReviewFormField.FirstName]: personNameSchema,
  [AddProductReviewFormField.LastName]: personNameSchema,
  [AddProductReviewFormField.NameAllowed]: mustBeTrueSchema,
  [AddProductReviewFormField.Rating]: numberSchema,
  [AddProductReviewFormField.Title]: mandatoryStringSchema,
});

export type AddProductReviewFormSchemaType = z.infer<
  typeof addProductReviewFormSchema
>;
