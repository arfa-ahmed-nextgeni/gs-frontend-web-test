"use client";

export interface GoogleAddressData {
  city: string;
  district: string;
  formattedAddress: string;
  postalCode: string;
  shortCode: string;
  street: string;
}

const ARABIC_TEXT_PATTERN = /[\u0600-\u06FF]/;

export const containsArabicText = (value?: null | string) =>
  ARABIC_TEXT_PATTERN.test(value || "");

type GoogleAddressSource = {
  addressComponents?: google.maps.GeocoderAddressComponent[];
  formattedAddress?: null | string;
};

const componentMatchesTypeGroup = (
  component: google.maps.GeocoderAddressComponent,
  typeGroup: string[]
) => typeGroup.every((type) => component.types.includes(type));

const getComponentCandidates = (
  sources: GoogleAddressSource[],
  typeGroups: string[][]
) =>
  // Reverse geocoding can return the English value in a later result, so scan
  // every result instead of trusting only results[0].
  sources
    .flatMap((source) => source.addressComponents || [])
    .filter((component) =>
      typeGroups.some((typeGroup) =>
        componentMatchesTypeGroup(component, typeGroup)
      )
    )
    .flatMap((component) => [component.long_name, component.short_name])
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));

const getComponentValue = ({
  preferEnglish,
  sources,
  typeGroups,
}: {
  preferEnglish?: boolean;
  sources: GoogleAddressSource[];
  typeGroups: string[][];
}) => {
  const candidates = getComponentCandidates(sources, typeGroups);

  if (preferEnglish) {
    // English stores should avoid Arabic component values when Google returns
    // mixed-language address data.
    const englishCandidate = candidates.find(
      (value) => !containsArabicText(value)
    );

    if (englishCandidate) {
      return englishCandidate;
    }
  }

  return candidates[0] || "";
};

const uniqueAddressParts = (parts: string[]) =>
  // Keep the display address readable without repeating values that appear in
  // both long_name and short_name.
  parts.filter((part, index) => part && parts.indexOf(part) === index);

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

  // Remove short code from street
  if (normalizedStreet && normalizedShortCode) {
    const shortCodePattern = new RegExp(
      `(?:^|[\\s,\\-:/#])${escapeRegExp(normalizedShortCode)}(?=$|[\\s,\\-:/#])`,
      "gi"
    );
    normalizedStreet = normalizedStreet.replace(shortCodePattern, " ").trim();
    normalizedStreet = normalizedStreet.replace(/\s{2,}/g, " ");
    normalizedStreet = normalizedStreet.replace(/\s+,/g, ",").trim();
    normalizedStreet = normalizedStreet.replace(/,\s*,/g, ",").trim();
    normalizedStreet = normalizedStreet.replace(/^,\s*|\s*,$/g, "").trim();
  }

  // Remove district from street - more comprehensive approach
  if (normalizedStreet && normalizedDistrict) {
    // Try multiple patterns to remove district
    // Pattern 1: district with surrounding commas or spaces
    let districtPattern = new RegExp(
      `\\s*,?\\s*${escapeRegExp(normalizedDistrict)}\\s*,?\\s*`,
      "gi"
    );
    normalizedStreet = normalizedStreet.replace(districtPattern, " ");
    // Pattern 2: district at the beginning with trailing separator
    districtPattern = new RegExp(
      `^${escapeRegExp(normalizedDistrict)}\\s*[,\\-]?\\s*`,
      "gi"
    );
    normalizedStreet = normalizedStreet.replace(districtPattern, "");
    // Clean up multiple spaces and commas
    normalizedStreet = normalizedStreet.replace(/\s{2,}/g, " ");
    normalizedStreet = normalizedStreet.replace(/\s+,/g, ",").trim();
    normalizedStreet = normalizedStreet.replace(/,\s*,/g, ",").trim();
    normalizedStreet = normalizedStreet.replace(/^,\s*|\s*,$/g, "").trim();
  }

  // Remove trailing hyphens and clean up
  normalizedStreet = normalizedStreet.replace(/[\s\-,]+$/g, "").trim();

  return normalizedStreet;
};

export const extractGoogleAddressData = ({
  addressComponents,
  addressResults,
  formattedAddress,
  preferEnglish,
}: {
  addressComponents?: google.maps.GeocoderAddressComponent[];
  addressResults?: google.maps.GeocoderResult[];
  formattedAddress?: null | string;
  preferEnglish?: boolean;
}): GoogleAddressData => {
  // Places details passes a single source, while reverse geocoding passes all
  // results so we can look for better language-specific component values.
  const sources: GoogleAddressSource[] = addressResults?.length
    ? addressResults.map((result) => ({
        addressComponents: result.address_components,
        formattedAddress: result.formatted_address,
      }))
    : [{ addressComponents, formattedAddress }];

  const hasAddressComponents = sources.some(
    (source) => source.addressComponents?.length
  );

  const formattedAddressCandidates = sources
    .map((source) => source.formattedAddress?.trim())
    .filter((value): value is string => Boolean(value));
  const safeFormattedAddress = preferEnglish
    ? formattedAddressCandidates.find((value) => !containsArabicText(value)) ||
      ""
    : formattedAddressCandidates[0] || "";

  if (!hasAddressComponents) {
    return {
      ...emptyGoogleAddressData(),
      formattedAddress: safeFormattedAddress,
      shortCode: "",
      street: sanitizeStreetValue({
        street: safeFormattedAddress,
      }),
    };
  }

  const streetNumber = getComponentValue({
    preferEnglish,
    sources,
    typeGroups: [["street_number"]],
  });
  const route = getComponentValue({
    preferEnglish,
    sources,
    typeGroups: [["route"]],
  });
  const premise = getComponentValue({
    preferEnglish,
    sources,
    typeGroups: [["premise"]],
  });
  const district = getComponentValue({
    preferEnglish,
    sources,
    typeGroups: [
      ["sublocality"],
      // ["sublocality_level_1", "political"],
      // ["neighborhood", "political"],
      // ["administrative_area_level_2", "political"],
    ],
  });
  const city = getComponentValue({
    preferEnglish,
    sources,
    typeGroups: [
      ["locality"],
      // ["administrative_area_level_1", "political"],
    ],
  });
  const postalCode = getComponentValue({
    preferEnglish,
    sources,
    typeGroups: [["postal_code"]],
  });

  // Prefer a structured address built from components over formatted_address,
  // because formatted_address may be Arabic or incomplete for English stores.
  const streetParts = [streetNumber, route].filter(Boolean);
  const street = sanitizeStreetValue({
    district,
    shortCode: premise,
    street: streetParts.join(" "),
  });
  const structuredAddress = uniqueAddressParts([
    premise,
    street,
    district,
    city,
    postalCode,
  ]).join(", ");

  return {
    city,
    district,
    formattedAddress: structuredAddress || safeFormattedAddress,
    postalCode,
    shortCode: premise,
    street: street || safeFormattedAddress,
  };
};
