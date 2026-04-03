import * as z from "zod";

import { StoreCode } from "@/lib/constants/i18n";
import {
  mandatoryStringSchema,
  optionalEmailSchema,
  phoneNumberSchema,
} from "@/lib/utils/validation-schemas";

export const enum AddPickupPointAddressFormField {
  Email = "email",
  FirstName = "first-name",
  LastName = "last-name",
  PhoneNumber = "phone-number",
}

export const addPickupPointAddressFormSchema = (storeCode: StoreCode) =>
  z.object({
    [AddPickupPointAddressFormField.Email]: optionalEmailSchema,
    [AddPickupPointAddressFormField.FirstName]: mandatoryStringSchema,
    [AddPickupPointAddressFormField.LastName]: mandatoryStringSchema,
    [AddPickupPointAddressFormField.PhoneNumber]: phoneNumberSchema(storeCode),
  });

export type AddPickupPointAddressFormSchemaType = z.infer<
  ReturnType<typeof addPickupPointAddressFormSchema>
>;
