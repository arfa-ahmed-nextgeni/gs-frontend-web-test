"use client";

export interface GoogleAddressData {
  city: string;
  district: string;
  formattedAddress: string;
  postalCode: string;
  shortCode: string;
  street: string;
}

const getFormattedAddressParts = (formattedAddress?: null | string) =>
  (formattedAddress || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

const getComponentValue = (
  components: google.maps.GeocoderAddressComponent[],
  types: string[],
  nameType: "long_name" | "short_name" = "long_name"
) =>
  components.find((component) =>
    types.some((type) => component.types.includes(type))
  )?.[nameType] || "";

export const emptyGoogleAddressData = (): GoogleAddressData => ({
  city: "",
  district: "",
  formattedAddress: "",
  postalCode: "",
  shortCode: "",
  street: "",
});

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const sanitizeStreetValue = ({
  district,
  shortCode,
  street,
}: {
  district?: null | string;
  shortCode?: null | string;
  street?: null | string;
}) => {
  let normalizedStreet = (street || "").trim();
  const normalizedShortCode = (shortCode || "").trim();
  const normalizedDistrict = (district || "").trim();

  if (normalizedStreet && normalizedShortCode) {
    const shortCodePattern = new RegExp(
      `(?:^|[\\s,\\-:/#])${escapeRegExp(normalizedShortCode)}(?=$|[\\s,\\-:/#])`,
      "i"
    );
    normalizedStreet = normalizedStreet.replace(shortCodePattern, " ").trim();
    normalizedStreet = normalizedStreet.replace(/\s{2,}/g, " ");
    normalizedStreet = normalizedStreet.replace(/\s+,/g, ",").trim();
    normalizedStreet = normalizedStreet.replace(/,\s*,/g, ",").trim();
    normalizedStreet = normalizedStreet.replace(/^,\s*|\s*,$/g, "").trim();
  }

  if (normalizedStreet && normalizedDistrict) {
    const districtPattern = new RegExp(
      `(?:^|,\\s*)${escapeRegExp(normalizedDistrict)}(?:\\s*,\\s*|$)`,
      "i"
    );
    normalizedStreet = normalizedStreet.replace(districtPattern, " ").trim();
    normalizedStreet = normalizedStreet.replace(/\s{2,}/g, " ");
    normalizedStreet = normalizedStreet.replace(/\s+,/g, ",").trim();
    normalizedStreet = normalizedStreet.replace(/,\s*,/g, ",").trim();
    normalizedStreet = normalizedStreet.replace(/^,\s*|\s*,$/g, "").trim();
  }

  return normalizedStreet;
};

export const extractGoogleAddressData = ({
  addressComponents,
  formattedAddress,
}: {
  addressComponents?: google.maps.GeocoderAddressComponent[];
  formattedAddress?: null | string;
}): GoogleAddressData => {
  const formattedAddressParts = getFormattedAddressParts(formattedAddress);
  const formattedStreet = formattedAddressParts[1] || "";

  if (!addressComponents?.length) {
    return {
      ...emptyGoogleAddressData(),
      formattedAddress: formattedAddress || "",
      shortCode: "",
      street: sanitizeStreetValue({
        street: formattedStreet || formattedAddress || "",
      }),
    };
  }

  const streetNumber = getComponentValue(addressComponents, ["street_number"]);
  const route = getComponentValue(addressComponents, ["route"]);
  const premise = getComponentValue(addressComponents, ["premise"]);
  const district =
    getComponentValue(addressComponents, ["sublocality"]) ||
    getComponentValue(addressComponents, ["sublocality_level_1"]) ||
    getComponentValue(addressComponents, ["neighborhood"]) ||
    getComponentValue(addressComponents, ["administrative_area_level_2"]);
  const city =
    getComponentValue(addressComponents, ["locality"]) ||
    getComponentValue(addressComponents, ["administrative_area_level_1"]);
  const postalCode = getComponentValue(addressComponents, ["postal_code"]);

  const streetParts = [streetNumber, route].filter(Boolean);

  return {
    city,
    district,
    formattedAddress: formattedAddress || "",
    postalCode,
    shortCode: premise,
    street: sanitizeStreetValue({
      district,
      shortCode: premise,
      street:
        streetParts.join(" ") || formattedStreet || formattedAddress || "",
    }),
  };
};
