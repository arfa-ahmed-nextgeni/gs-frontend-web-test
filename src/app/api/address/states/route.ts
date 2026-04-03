import { NextRequest, NextResponse } from "next/server";

import { hasLocale } from "next-intl";

import { routing } from "@/i18n/routing";
import { getStates } from "@/lib/actions/config/get-states";
import { Locale } from "@/lib/constants/i18n";
import { ServiceResultOk } from "@/lib/types/service-result";
import { SelectOption } from "@/lib/types/ui-types";
import { isOk, ok } from "@/lib/utils/service-result";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const locale = searchParams.get("locale") as Locale;
  const countryCode = searchParams.get("country") as string;

  if (!hasLocale(routing.locales, locale)) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }

  let response: ServiceResultOk<SelectOption[]> = ok([]);

  const getStatesResponse = await getStates({ countryCode, locale });

  if (isOk(getStatesResponse)) {
    response = getStatesResponse;
  }

  return NextResponse.json(response);
}
