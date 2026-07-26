import { NextRequest, NextResponse } from "next/server";

import { hasLocale } from "next-intl";

import { routing } from "@/i18n/routing";
import { getCountries } from "@/lib/actions/config/get-countries";
import { deleteCustomerAddress } from "@/lib/actions/customer/delete-customer-address";
import { getCustomerAddresses } from "@/lib/actions/customer/get-customer-addresses";
import { QueryParamsKey } from "@/lib/constants/query-params";
import { isError, isOk, isUnauthenticated } from "@/lib/utils/service-result";

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { data: null, error: "Address id is required" },
      { status: 400 }
    );
  }

  const result = await deleteCustomerAddress({ id });

  if (isError(result)) {
    return NextResponse.json(
      { data: null, error: result.error },
      { status: 400 }
    );
  }

  if (!isOk(result)) {
    return NextResponse.json(
      { data: null, error: "Failed to delete address" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: result.data, error: null }, { status: 200 });
}

export async function GET(request: NextRequest) {
  const locale = request.nextUrl.searchParams.get(QueryParamsKey.Locale);

  if (!locale || !hasLocale(routing.locales, locale)) {
    return NextResponse.json(
      { data: null, error: "Invalid locale" },
      { status: 400 }
    );
  }

  const result = await getCustomerAddresses(locale);

  if (isUnauthenticated(result)) {
    return NextResponse.json(
      { data: null, error: "UNAUTHENTICATED" },
      { status: 401 }
    );
  }

  if (isError(result)) {
    return NextResponse.json(
      { data: null, error: result.error },
      { status: 500 }
    );
  }

  if (!isOk(result)) {
    return NextResponse.json(
      { data: null, error: "Failed to fetch addresses" },
      { status: 500 }
    );
  }

  // Fetch countries to map country codes to country names
  const countriesResult = await getCountries({ locale });
  const countryMap = new Map<string, string>();

  if (isOk(countriesResult)) {
    countriesResult.data.forEach((country) => {
      countryMap.set(country.value, country.label);
    });
  }

  const addresses = result.data.addresses.map((address) => {
    const countryLabel =
      countryMap.get(address.countryCode) || address.countryCode;

    return {
      address_label: (address.raw as any)?.address_label || null,
      city: address.city,
      countryCode: address.countryCode,
      countryLabel,
      firstName: address.firstName,
      formattedAddress: address.formattedAddress,
      id: address.id,
      isDefault: address.isDefault,
      ksaShortAddress: address.ksaShortAddress,
      lastName: address.lastName,
      mobileNumber: address.mobileNumber,
      name: address.name,
      postcode: address.postcode,
      raw: address.raw,
      regionId: address.regionId,
      regionName: address.regionName,
      street: address.street,
    };
  });

  return NextResponse.json(
    { data: { addresses }, error: null },
    { status: 200 }
  );
}
