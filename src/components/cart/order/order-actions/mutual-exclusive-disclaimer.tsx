import Image from "next/image";

import { useTranslations } from "next-intl";

import WarningIcon from "@/assets/icons/warning-icon.svg";

export function MutualExclusiveDisclaimer() {
  const t = useTranslations("CartPage.orderSummary");

  return (
    <li className="bg-bg-warm px-7.5 flex items-center gap-2.5 py-2.5">
      <Image
        alt=""
        className="size-5.5 shrink-0"
        height={22}
        src={WarningIcon}
        unoptimized
        width={22}
      />
      <span className="text-text-primary text-xs">
        {t("actions.mutualExclusiveDisclaimer")}
      </span>
    </li>
  );
}
