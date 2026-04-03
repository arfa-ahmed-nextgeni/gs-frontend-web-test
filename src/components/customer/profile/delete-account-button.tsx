"use client";

import { useTransition } from "react";

import Image from "next/image";

import { useTranslations } from "next-intl";

import TrashIcon from "@/assets/icons/trash-icon.svg";
import { useToastContext } from "@/components/providers/toast-provider";
import { Spinner } from "@/components/ui/spinner";
import { invalidateSession } from "@/lib/actions/auth/invalidate-session";
import { deleteCustomerAccount } from "@/lib/actions/customer/delete-customer-account";
import { trackDeleteUser } from "@/lib/analytics/events";

export const DeleteAccountButton = () => {
  const t = useTranslations("CustomerProfilePage.messages");

  const [isPending, startTransition] = useTransition();

  const { showError, showSuccess } = useToastContext();

  const handleDeleteProfile = () => {
    startTransition(async () => {
      const response = await deleteCustomerAccount();
      if (response.success) {
        // Track delete_user when user successfully deletes their account
        trackDeleteUser();
        showSuccess(response.message || t("accountDeleteSuccess"), " ");
        await invalidateSession();
      } else {
        showError(response.error, " ");
      }
    });
  };

  return (
    <button disabled={isPending} onClick={handleDeleteProfile}>
      {isPending ? (
        <Spinner label="Loading" size={20} variant="dark" />
      ) : (
        <Image alt="" height={20} src={TrashIcon} unoptimized width={20} />
      )}
    </button>
  );
};
