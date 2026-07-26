import { parsePhoneNumberWithError } from "libphonenumber-js";

export const getPhoneDetails = (phoneNumber: string) => {
  let cleanedPhoneNumber = phoneNumber.trim().replace(/\s+/g, "");

  try {
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

    const fallbackMatch = cleanedPhoneNumber.match(/^(\+\d{1,3})(\d+)$/);
    if (fallbackMatch) {
      return {
        countryCode: fallbackMatch[1],
        number: fallbackMatch[2],
      };
    }

    return {
      countryCode: "",
      number: "",
    };
  }
};
