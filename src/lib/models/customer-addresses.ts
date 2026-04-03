import { GetCustomerAddressesQuery } from "@/graphql/graphql";

export class CustomerAddress {
  city: string;
  cityCode?: string;
  countryCode: string;
  firstName: string;
  formattedAddress: string;
  id: string;
  isDefault: boolean;
  lastName: string;
  middleName?: string;
  mobileNumber: string;
  name: string;
  postcode: string;
  raw: Record<string, unknown>;
  regionId?: null | number;
  regionName: string;
  street?: (null | string)[] | null;

  constructor({
    city,
    cityCode,
    countryCode,
    firstname,
    id,
    isDefault,
    lastname,
    middleName,
    postcode,
    raw,
    regionId,
    regionName,
    street,
    telephone,
  }: {
    city: string;
    cityCode?: string;
    countryCode: string;
    firstname: string;
    id: string;
    isDefault: boolean;
    lastname: string;
    middleName?: string;
    postcode: string;
    raw: Record<string, unknown>;
    regionId?: null | number;
    regionName: string;
    street?: (null | string)[] | null;
    telephone: string;
  }) {
    this.id = id;
    this.firstName = firstname;
    this.lastName = lastname;
    this.middleName = middleName;
    this.street = street;
    this.mobileNumber = telephone;
    this.isDefault = isDefault || false;
    this.city = city;
    this.postcode = postcode;
    this.countryCode = countryCode;
    this.regionName = regionName;
    this.regionId = regionId;
    this.raw = raw;
    this.cityCode = cityCode;

    this.name = [this.firstName, this.middleName, this.lastName]
      .filter(Boolean)
      .join(" ");

    this.formattedAddress = [
      this.cityCode || this.city,
      this.regionName,
      ...(this.street?.filter(
        (s): s is string => typeof s === "string" && s.trim().length > 0
      ) ?? []),
      this.postcode,
    ]
      .filter((part) => part.trim().length > 0)
      .join(", ");
  }
}

export class CustomerAddresses {
  public addresses: CustomerAddress[];

  constructor(dto: GetCustomerAddressesQuery) {
    const customerMobileNumber = dto.customer?.custom_attributes?.find(
      (e) => e?.code === "mobile_number"
    ) as { code: string; value: string };

    this.addresses =
      dto?.customer?.addresses
        ?.map(
          (address) =>
            new CustomerAddress({
              city: address?.city || "",
              cityCode: address?.city_code || "",
              countryCode: address?.country_code || "",
              firstname: address?.firstname || "",
              id: `${address?.id}`,
              isDefault:
                dto.customer?.default_billing === `${address?.id}` &&
                dto.customer?.default_shipping === `${address?.id}`,
              lastname: address?.lastname || "",
              middleName: address?.middlename || "",
              postcode: address?.postcode || "",
              raw: address ?? {},
              regionId: address?.region?.region_id,
              regionName: address?.region?.region || "",
              street: address?.street,
              telephone:
                customerMobileNumber?.value || address?.telephone || "",
            })
        )
        .sort((a, b) =>
          a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1
        ) || [];
  }
}
