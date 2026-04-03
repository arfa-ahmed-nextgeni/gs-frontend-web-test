"use client";

import { useTranslations } from "next-intl";

import { useToastContext } from "@/components/providers/toast-provider";
import { Spinner } from "@/components/ui/spinner";
import { useAddressesContext } from "@/contexts/addresses-context";
import { makeDefaultCustomerAddress } from "@/lib/actions/customer/make-default-customer-address";
import { isOk } from "@/lib/utils/service-result";

export const MakeAddressDefaultButton = ({
  customerAddressRaw,
  id,
}: {
  customerAddressRaw: Record<string, unknown>;
  id: string;
}) => {
  const t = useTranslations("CustomerAddressesPage");

  const {
    isUpdatingDefaultAddress,
    pendingAddressId,
    setPendingAddressId,
    startUpdateDefaultAddress,
  } = useAddressesContext();

  const { showError } = useToastContext();

  const handleMakeDefaultAddress = () => {
    setPendingAddressId(id);
    startUpdateDefaultAddress(async () => {
      const response = await makeDefaultCustomerAddress({
        id: +id,
        rawData: customerAddressRaw,
      });
      if (isOk(response)) {
        setPendingAddressId(null);
      } else {
        showError(response.error, " ");
        setPendingAddressId(null);
      }
    });
  };

  return (
    <button
      className="h-6.25 border-border-muted text-text-placeholder min-w-18.5 rounded-xl border bg-transparent px-2.5 text-center text-[11px] font-medium leading-none"
      disabled={isUpdatingDefaultAddress}
      onClick={handleMakeDefaultAddress}
    >
      {pendingAddressId === id ? (
        <Spinner
          className="size-3.75 mx-auto"
          label="Loading"
          size={15}
          variant="dark"
        />
      ) : (
        t("makeDefault")
      )}
    </button>
  );
};
