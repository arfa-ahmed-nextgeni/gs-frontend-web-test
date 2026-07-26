// Use NEXT_PUBLIC_PROTOCOL env var first (allows UAT/staging to force https),
// then fall back to NODE_ENV check. All production-like environments should set
// NEXT_PUBLIC_PROTOCOL=https to ensure canonical URLs use the correct scheme.
export const PROTOCOL =
  process.env.NEXT_PUBLIC_PROTOCOL ||
  (process.env.NODE_ENV === "production" ? "https" : "http");
