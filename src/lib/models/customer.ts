import { CurrencyEnum, GetCustomerQuery } from "@/graphql/graphql";
import { Helper } from "@/lib/models/helper";

export class Customer extends Helper {
  public dateOfBirth: string;
  public email: string;
  public firstName: string;
  public fullName: string;
  public gender?: null | number;
  public id: null | number;
  public lastName: string;
  public phoneNumber: string;
  public rewardPointsBalance?: {
    currency?: CurrencyEnum | null;
    value?: null | number;
  };

  get isProfileComplete() {
    return Boolean(
      this.firstName &&
        this.lastName &&
        this.email &&
        this.dateOfBirth &&
        this.gender &&
        this.phoneNumber
    );
  }

  constructor(dto: GetCustomerQuery) {
    super();

    this.id = dto.customer?.id ?? null;
    this.dateOfBirth = dto.customer?.date_of_birth || "";

    const mobileNumber = dto.customer?.custom_attributes?.find(
      (e) => e?.code === "mobile_number"
    ) as { code: string; value: string };

    this.phoneNumber = this.formatPhoneNumber(mobileNumber?.value || "");
    this.email = dto.customer?.email?.includes(mobileNumber?.value)
      ? ""
      : dto.customer?.email || "";
    this.gender = dto.customer?.gender;

    const firstName =
      dto.customer?.firstname !== "Unknown"
        ? dto.customer?.firstname || ""
        : "";
    const lastName =
      dto.customer?.lastname !== "Unknown" ? dto.customer?.lastname || "" : "";
    this.firstName = firstName;
    this.lastName = lastName;
    this.fullName = [firstName, lastName].filter(Boolean).join(" ");
    this.rewardPointsBalance = dto.customer?.reward_points?.balance?.money;
  }
}
