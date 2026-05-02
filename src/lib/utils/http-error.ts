export function isUnauthorizedRequestError(error: unknown) {
  const hasUnauthorizedStatus =
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    error.status === 401;
  const message = error instanceof Error ? error.message : String(error);

  return hasUnauthorizedStatus || /^HTTP Error: 401\b/.test(message);
}
