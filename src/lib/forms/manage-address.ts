import * as z from "zod";

import { StoreCode } from "@/lib/constants/i18n";
import { isGlobalStore } from "@/lib/utils/country";
import {
  booleanSchema,
  mandatoryCitySchema,
  mandatoryNameSchema,
  mandatoryStringSchema,
  optionalEmailSchema,
  optionalStringSchema,
  phoneNumberOptionalSchema,
  phoneNumberSchema,
  postalCodeSchema,
  selectOptionSchema,
} from "@/lib/utils/validation-schemas";

export const enum AddressFormField {
  AddressLabel = "address-label",
  Area = "area",
  BuildingName = "building-name",
  City = "city",
  Country = "country",
  Email = "email",
  FirstName = "first-name",
  KsaAdditionalNumber = "ksa-additional-number",
  KsaBuildingNumber = "ksa-building-number",
  KsaShortAddress = "ksa-short-address",
  LastName = "last-name",
  Latitude = "latitude",
  Longitude = "longitude",
  MiddleName = "middle-name",
  PhoneNumber = "phone-number",
  PostalCode = "postal-code",
  SaveAsDefault = "save-as-default",
  SenderFirstName = "sender-first-name",
  SenderLastName = "sender-last-name",
  State = "state",
  Street = "street",
}

export const addressFormSchema = (storeCode: StoreCode) => {
  const globalStore = isGlobalStore(storeCode);

  return z
    .object({
      [AddressFormField.AddressLabel]: optionalStringSchema,
      [AddressFormField.Area]: globalStore
        ? mandatoryNameSchema
        : selectOptionSchema,
      [AddressFormField.BuildingName]: mandatoryStringSchema,
      [AddressFormField.City]: globalStore
        ? mandatoryCitySchema
        : selectOptionSchema,
      [AddressFormField.Country]: selectOptionSchema,
      [AddressFormField.Email]: optionalEmailSchema,
      [AddressFormField.FirstName]: mandatoryNameSchema,
      [AddressFormField.KsaAdditionalNumber]: optionalStringSchema,
      [AddressFormField.KsaBuildingNumber]: optionalStringSchema,
      [AddressFormField.KsaShortAddress]: optionalStringSchema,
      [AddressFormField.LastName]: mandatoryNameSchema,
      [AddressFormField.Latitude]: optionalStringSchema,
      [AddressFormField.Longitude]: optionalStringSchema,
      [AddressFormField.MiddleName]: globalStore
        ? mandatoryNameSchema
        : optionalStringSchema,
      [AddressFormField.PhoneNumber]: phoneNumberOptionalSchema,
      [AddressFormField.PostalCode]: globalStore
        ? postalCodeSchema
        : optionalStringSchema,
      [AddressFormField.SaveAsDefault]: booleanSchema,
      [AddressFormField.SenderFirstName]: optionalStringSchema,
      [AddressFormField.SenderLastName]: optionalStringSchema,
      [AddressFormField.State]: selectOptionSchema,
      [AddressFormField.Street]: globalStore
        ? mandatoryStringSchema
        : optionalStringSchema,
    })
    .superRefine((data, ctx) => {
      // Make phone number, sender first name, and sender last name mandatory when address label is "gift"
      const isGiftAddress =
        data[AddressFormField.AddressLabel]?.toLowerCase() === "gift";
      const phoneNumber = data[AddressFormField.PhoneNumber];
      const senderFirstName = data[AddressFormField.SenderFirstName];
      const senderLastName = data[AddressFormField.SenderLastName];

      if (isGiftAddress) {
        // Validate phone number
        if (
          !phoneNumber ||
          !phoneNumber.number ||
          phoneNumber.number.trim() === ""
        ) {
          ctx.addIssue({
            code: "custom",
            message: "requiredField",
            path: [AddressFormField.PhoneNumber, "number"],
          });
        }
        if (
          !phoneNumber ||
          !phoneNumber.countryCode ||
          phoneNumber.countryCode.trim() === ""
        ) {
          ctx.addIssue({
            code: "custom",
            message: "requiredField",
            path: [AddressFormField.PhoneNumber, "countryCode"],
          });
        } else if (
          phoneNumber &&
          phoneNumber.countryCode &&
          phoneNumber.number
        ) {
          // Validate phone number format using phoneNumberSchema
          const phoneSchema = phoneNumberSchema(storeCode);
          const phoneResult = phoneSchema.safeParse(phoneNumber);
          if (!phoneResult.success) {
            phoneResult.error.issues.forEach((issue) => {
              ctx.addIssue({
                code: "custom",
                message: issue.message,
                path: [AddressFormField.PhoneNumber, ...(issue.path || [])],
              });
            });
          }
        }

        // Validate sender first name
        if (!senderFirstName || senderFirstName.trim() === "") {
          ctx.addIssue({
            code: "custom",
            message: "requiredField",
            path: [AddressFormField.SenderFirstName],
          });
        }

        // Validate sender last name
        if (!senderLastName || senderLastName.trim() === "") {
          ctx.addIssue({
            code: "custom",
            message: "requiredField",
            path: [AddressFormField.SenderLastName],
          });
        }
      }
    });
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const schema = addressFormSchema(StoreCode.en_sa);

export type AddressFormSchemaType = z.infer<typeof schema>;
