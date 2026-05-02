import { parsePhoneNumberWithError } from "libphonenumber-js";

export const getPhoneDetails = (phoneNumber: string) => {
  try {
    let cleanedPhoneNumber = phoneNumber.trim().replace(/\s+/g, "");

    if (!cleanedPhoneNumber.startsWith("+")) {
      cleanedPhoneNumber = `+${cleanedPhoneNumber}`;
    }

    const parsedPhoneNumber = parsePhoneNumberWithError(cleanedPhoneNumber);

    return {
      countryCode: `+${parsedPhoneNumber.countryCallingCode}`,
      number: parsedPhoneNumber.nationalNumber,
    };
  } catch (error) {
    console.error("Error parsing phone number:", error);
    return {
      countryCode: "",
      number: "",
    };
  }
};
