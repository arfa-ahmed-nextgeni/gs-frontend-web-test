import { NextRequest } from "next/server";

import { WEBHOOK_SECRET, WEBHOOK_TOKEN } from "@/lib/config/server-env";
import { HEADERS } from "@/lib/constants/api";

type WebhookAuthResult = {
  error?: string;
  source?: string;
  valid: boolean;
};

export function logWebhookAttempt(
  request: NextRequest,
  authResult: WebhookAuthResult,
  tag?: string
) {
  const logData = {
    authSource: authResult.source,
    authValid: authResult.valid,
    ip:
      request.headers.get(HEADERS.X_FORWARDED_FOR) ||
      request.headers.get(HEADERS.X_REAL_IP),
    method: request.method,
    tag,
    timestamp: new Date().toISOString(),
    url: request.url,
    userAgent: request.headers.get(HEADERS.USER_AGENT),
  };

  if (authResult.valid) {
    console.info("✅ Webhook authenticated:", logData);
  } else {
    console.warn("❌ Webhook auth failed:", {
      ...logData,
      error: authResult.error,
    });
  }
}

export async function validateWebhookAuth(
  request: NextRequest
): Promise<WebhookAuthResult> {
  try {
    // Method 1: Custom Webhook Secret Header (Primary)
    const webhookSecret = request.headers.get(HEADERS.X_WEBHOOK_SECRET);
    if (webhookSecret) {
      if (webhookSecret === WEBHOOK_SECRET) {
        return { source: "webhook-secret", valid: true };
      } else {
        return {
          error: "Invalid webhook secret",
          source: "webhook-secret",
          valid: false,
        };
      }
    }

    // Method 2: Bearer Token (Fallback)
    const authHeader = request.headers.get(HEADERS.AUTHORIZATION);
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      if (token === WEBHOOK_TOKEN) {
        return { source: "bearer", valid: true };
      } else {
        return {
          error: "Invalid bearer token",
          source: "bearer",
          valid: false,
        };
      }
    }

    return { error: "No authentication method provided", valid: false };
  } catch (error) {
    console.error("Webhook auth validation error:", error);
    return { error: "Authentication validation failed", valid: false };
  }
}
