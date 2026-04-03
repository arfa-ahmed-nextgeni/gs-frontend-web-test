import { NextRequest, NextResponse } from "next/server";

import { hasLocale } from "next-intl";

import { routing } from "@/i18n/routing";
import { getStoreConfig } from "@/lib/actions/config/get-store-config";
import { Locale } from "@/lib/constants/i18n";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const locale = searchParams.get("locale") as Locale;

  if (!hasLocale(routing.locales, locale)) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }

  const response = await getStoreConfig({ locale });

  return NextResponse.json(response);
}
