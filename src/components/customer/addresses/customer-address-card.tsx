import { use } from "react";

import Image from "next/image";

import { useTranslations } from "next-intl";

import VerifiedIcon from "@/assets/icons/verified-icon.svg";
import { DeleteCustomerAddressButton } from "@/components/customer/addresses/delete-customer-address-button";
import { EditCustomerAddressButton } from "@/components/customer/addresses/edit-customer-address-button";
import { MakeAddressDefaultButton } from "@/components/customer/addresses/make-address-default-button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useStoreCode } from "@/hooks/i18n/use-store-code";
import { CustomerAddress } from "@/lib/models/customer-addresses";
import {
  ServiceResultError,
  ServiceResultOk,
} from "@/lib/types/service-result";
import { SelectOption } from "@/lib/types/ui-types";
import { isOk } from "@/lib/utils/service-result";

export const CustomerAddressCard = ({
  countriesPromise,
  defaultExpanded,
  isOnlyAddress,
  statesPromise,
  ...customerAddress
}: {
  countriesPromise: Promise<
    ServiceResultError | ServiceResultOk<SelectOption[]>
  >;
  defaultExpanded?: boolean;
  isOnlyAddress?: boolean;
  statesPromise?: Promise<ServiceResultError | ServiceResultOk<SelectOption[]>>;
} & CustomerAddress) => {
  const t = useTranslations("CustomerAddressesPage");
  const { isGlobal } = useStoreCode();

  const {
    countryCode,
    formattedAddress,
    id,
    is_ksa_verified,
    isDefault,
    mobileNumber,
    name,
    regionId,
  } = customerAddress;
  let stateLabel = "";
  let countryLabel = countryCode;

  // Determine which phone number to display based on address_label
  const displayPhoneNumber =
    customerAddress.raw?.address_label === "Gift"
      ? customerAddress.raw?.telephone
      : mobileNumber;

  // Format the phone number for display
  const formattedPhoneNumber = displayPhoneNumber
    ? String(displayPhoneNumber).startsWith("+")
      ? String(displayPhoneNumber)
      : `+${String(displayPhoneNumber)}`
    : "";

  const countriesResponse = use(countriesPromise);
  if (isOk(countriesResponse)) {
    const foundCountry = countriesResponse.data.find(
      (country) => country.value === countryCode
    );

    countryLabel = foundCountry?.label || "";
  }

  if (isGlobal && regionId && statesPromise) {
    const statesResponse = use(statesPromise);
    if (isOk(statesResponse)) {
      const foundState = statesResponse.data.find(
        (state) => state.value === `${regionId}`
      );

      stateLabel = foundState?.label || "";
    }
  }

  return (
    <Collapsible
      alwaysOpenOnDesktop
      className="transition-default bg-bg-default hover:bg-bg-surface data-[state=closed]:bg-bg-surface flex flex-col rounded-xl shadow-[0_1px_0_0_var(--color-bg-surface)]"
      defaultOpen={defaultExpanded}
    >
      <CollapsibleTrigger className="flex flex-1 flex-col gap-2 px-5 py-[13.5px] lg:pointer-events-none">
        <div className="flex flex-row">
          <span className="text-text-tertiary w-20 min-w-20 text-start text-xs font-normal">
            {t("name")}
          </span>
          <span className="text-text-primary min-w-0 flex-1 truncate text-start text-xs font-normal">
            {name}
          </span>
        </div>
        <div className="flex flex-row">
          <span className="text-text-tertiary w-20 min-w-20 text-start text-xs font-normal">
            {t("address")}
          </span>
          <span className="text-text-primary min-w-0 flex-1 break-words text-start text-xs font-normal">
            {`${customerAddress.ksaShortAddress ? customerAddress.ksaShortAddress + ", " : ""}${countryLabel}, ${stateLabel ? stateLabel + "," : ""} ${formattedAddress}`}
          </span>
        </div>
        <div className="flex flex-row">
          <span className="text-text-tertiary w-20 min-w-20 text-start text-xs font-normal">
            {t("mobile")}
          </span>
          <span className="flex flex-1 items-center justify-between gap-3">
            <span
              className="text-text-primary text-left text-xs font-normal rtl:text-right"
              dir="ltr"
              style={{ direction: "ltr", unicodeBidi: "bidi-override" }}
            >
              {formattedPhoneNumber}
            </span>
            {is_ksa_verified ? (
              <span className="inline-flex items-center gap-1 text-[8px] font-medium text-[#2563EB]">
                <Image
                  alt={t("verified")}
                  className="shrink-0"
                  height={14}
                  src={VerifiedIcon}
                  width={14}
                />
                {t("verified")}
              </span>
            ) : (
              <span className="text-[8px] font-medium text-[#F59E0B]">
                {t("notVerified")}
              </span>
            )}
          </span>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="h-11.25 border-border-base flex flex-row items-center justify-between border-t px-5">
        {isDefault ? (
          <div className="h-6.25 bg-bg-primary text-text-inverse min-w-18.5 flex items-center justify-center rounded-xl px-2.5 text-[11px] font-medium leading-none">
            {t("default")}
          </div>
        ) : (
          <MakeAddressDefaultButton
            customerAddressRaw={customerAddress.raw}
            id={id}
          />
        )}
        <div className="gap-3.75 flex flex-row">
          <EditCustomerAddressButton id={id} isOnlyAddress={isOnlyAddress} />
          <DeleteCustomerAddressButton id={id} isDefault={isDefault} />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
