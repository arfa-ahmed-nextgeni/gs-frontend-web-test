export const REGEX = {
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  BASIC_TEXT: /^[a-zA-Z0-9\s.,!?-]+$/,
  NO_SPECIAL_CHARS: /^[\p{L}\p{N}\s]+$/u,
  POSTAL_CODE: /^[a-zA-Z0-9\s\-]+$/,
} as const;
