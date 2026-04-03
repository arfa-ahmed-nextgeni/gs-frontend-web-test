import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import {
  logWebhookAttempt,
  validateWebhookAuth,
} from "@/lib/actions/webhooks/auth";
import { CacheTags } from "@/lib/constants/cache/tags";

const VALID_TAGS = Object.values(CacheTags) as string[];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tag: string }> }
) {
  const { tag } = await params;

  if (!VALID_TAGS.includes(tag)) {
    return NextResponse.json({ message: "Invalid tag" }, { status: 400 });
  }

  if (tag === CacheTags.Magento) {
    try {
      revalidateTag(tag, { expire: 0 });

      console.info(`🔄 Cache revalidated via GET (magento):`, {
        method: "GET",
        tag,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json({
        message: `Cache revalidated for tag: ${tag}`,
        revalidated: true,
        tag,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("❌ GET revalidate error:", error);
      return NextResponse.json(
        {
          error: "Revalidation failed",
          tag,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }
  }

  if (process.env.NODE_ENV === "development") {
    try {
      revalidateTag(tag, { expire: 0 });

      console.info(`🔄 Cache revalidated via GET (dev mode):`, {
        method: "GET",
        tag,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json({
        environment: "development",
        message: `Cache revalidated for tag: ${tag}`,
        revalidated: true,
        tag,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("❌ GET revalidate error:", error);
      return NextResponse.json(
        {
          error: "Revalidation failed",
          tag,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({
    availableTags: VALID_TAGS,
    message: `Webhook endpoint ready for tag: ${tag}`,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tag: string }> }
) {
  const startTime = Date.now();

  const { tag } = await params;

  try {
    const authResult = await validateWebhookAuth(request);

    logWebhookAttempt(request, authResult, tag);

    if (!authResult.valid) {
      return NextResponse.json(
        { error: authResult.error, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!VALID_TAGS.includes(tag)) {
      console.warn(`Invalid tag attempted: ${tag}`);
      return NextResponse.json(
        { message: "Invalid cache tag" },
        { status: 400 }
      );
    }

    let webhookPayload;
    try {
      webhookPayload = await request.json();
    } catch (error) {
      console.warn("Failed to parse webhook payload:", error);
      webhookPayload = null;
    }

    revalidateTag(tag, { expire: 0 });

    const processingTime = Date.now() - startTime;

    console.info(`🔄 Cache revalidated successfully:`, {
      processingTime: `${processingTime}ms`,
      source: authResult.source,
      tag,
      timestamp: new Date().toISOString(),
      webhookType: webhookPayload?.sys?.type || "unknown",
    });

    return NextResponse.json({
      processingTime: `${processingTime}ms`,
      revalidated: true,
      source: authResult.source,
      success: true,
      tag,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    const errorMessage =
      process.env.NODE_ENV === "development"
        ? error instanceof Error
          ? error.message
          : String(error)
        : "Internal server error";

    console.error("❌ Revalidate error:", {
      error: errorMessage,
      processingTime: `${processingTime}ms`,
      tag,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        error: errorMessage,
        message: "Internal server error",
        processingTime: `${processingTime}ms`,
        success: false,
      },
      { status: 500 }
    );
  }
}
