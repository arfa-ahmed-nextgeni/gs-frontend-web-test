import { NextRequest, NextResponse } from "next/server";

import { hasLocale } from "next-intl";

import { routing } from "@/i18n/routing";
import { getAreas } from "@/lib/actions/config/get-areas";
import { Locale } from "@/lib/constants/i18n";
import { ServiceResultOk } from "@/lib/types/service-result";
import { SelectOption } from "@/lib/types/ui-types";
import { isOk, ok } from "@/lib/utils/service-result";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const locale = searchParams.get("locale") as Locale;
  const city = searchParams.get("city") as string;

  if (!hasLocale(routing.locales, locale)) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }

  let response: ServiceResultOk<SelectOption[]> = ok([]);

  const getAreasResponse = await getAreas({ city, locale });

  if (isOk(getAreasResponse)) {
    response = getAreasResponse;
  }

  return NextResponse.json(response);
}
