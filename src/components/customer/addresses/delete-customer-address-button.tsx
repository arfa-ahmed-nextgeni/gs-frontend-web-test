"use client";

import { useTransition } from "react";

import Image from "next/image";

import { useTranslations } from "next-intl";

import TrashIcon from "@/assets/icons/trash-icon.svg";
import { useToastContext } from "@/components/providers/toast-provider";
import { Spinner } from "@/components/ui/spinner";
import { deleteCustomerAddress } from "@/lib/actions/customer/delete-customer-address";
import { trackAddressbookDeleteAddress } from "@/lib/analytics/events";
import { isError, isOk } from "@/lib/utils/service-result";

export const DeleteCustomerAddressButton = ({
  id,
  isDefault,
}: {
  id: string;
  isDefault?: boolean;
}) => {
  const t = useTranslations("CustomerAddressesPage");

  const [isPending, startTransition] = useTransition();

  const { showError, showSuccess } = useToastContext();

  const handleDeleteAddress = () => {
    if (isDefault) {
      showError(t("messages.defaultAddressCannotBeDeleted"), " ");
      return;
    }
    startTransition(async () => {
      const response = await deleteCustomerAddress({ id });

      if (isOk(response)) {
        trackAddressbookDeleteAddress();
        showSuccess(response.data, " ");
      } else if (isError(response)) {
        showError(response.error, " ");
      }
    });
  };

  return (
    <button
      className="gap-1.25 flex flex-row"
      disabled={isPending}
      onClick={handleDeleteAddress}
    >
      {isPending ? (
        <Spinner className="size-3.75" size={15} variant="dark" />
      ) : (
        <Image alt="" height={15} src={TrashIcon} unoptimized width={15} />
      )}
      <p className="text-text-primary text-xs font-normal">{t("delete")}</p>
    </button>
  );
};
