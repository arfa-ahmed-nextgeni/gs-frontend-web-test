"use client";

import Image from "next/image";

import { useTranslations } from "next-intl";

import EditIcon from "@/assets/icons/edit-icon.svg";
import { Link } from "@/i18n/navigation";
import { QueryParamsKey } from "@/lib/constants/query-params";
import { ROUTES } from "@/lib/constants/routes";

export const EditCustomerAddressButton = ({
  id,
  isOnlyAddress,
}: {
  id: string;
  isOnlyAddress?: boolean;
}) => {
  const t = useTranslations("CustomerAddressesPage");

  return (
    <Link
      className="gap-1.25 flex flex-row"
      href={`${ROUTES.CUSTOMER.PROFILE.ADDRESSES.EDIT(id)}${isOnlyAddress ? `?${QueryParamsKey.SetAsDefault}=true` : ""}`}
    >
      <Image
        alt=""
        className="size-3.75"
        height={15}
        src={EditIcon}
        unoptimized
        width={15}
      />
      <p className="text-text-primary text-xs font-normal">{t("edit")}</p>
    </Link>
  );
};
