import Image from "next/image";

import { useTranslations } from "next-intl";

import SalutingFaceEmoji from "@/assets/images/saluting-face-emoji.svg";
import { WalletBalanceCard } from "@/components/customer/wallet-balance-card";
import { CurrencyEnum } from "@/graphql/graphql";
import { useLocaleInfo } from "@/hooks/i18n/use-locale-info";
import { cn } from "@/lib/utils";
import { getFormattedFullName } from "@/lib/utils/name-formatting";

export const UserGreetingCard = ({
  firstName,
  isCompact,
  lastName,
  phoneNumber,
  rewardPointsBalance,
}: {
  firstName: string;
  isCompact?: boolean;
  lastName: string;
  phoneNumber: string;
  rewardPointsBalance?: {
    currency?: CurrencyEnum | null;
    value?: null | number;
  };
}) => {
  const t = useTranslations("AccountPage.userInfo");
  const { language } = useLocaleInfo();

  const formattedName = getFormattedFullName(firstName, lastName, language);

  return (
    <div
      className={cn(
        "flex flex-col",
        isCompact
          ? "bg-bg-body gap-5 px-5 py-2.5"
          : "bg-bg-default mx-5 rounded-xl lg:mx-0"
      )}
    >
      <div
        className={cn(
          "flex",
          isCompact
            ? "flex-col gap-2.5 p-5"
            : "flex-row items-center justify-between gap-1 p-5"
        )}
      >
        <div className="flex min-w-0 flex-1 flex-row items-center gap-1">
          <p
            className={cn(
              "text-text-primary truncate font-medium",
              isCompact ? "text-sm" : "text-xl"
            )}
          >
            {formattedName
              ? t("greeting", { name: formattedName })
              : t("greetingUnknown")}
          </p>
          <Image
            alt="salute emoji"
            className="size-5"
            height={20}
            src={SalutingFaceEmoji}
            unoptimized
            width={20}
          />
        </div>
        <div className="text-text-secondary text-sm font-medium" dir="ltr">
          {phoneNumber}
        </div>
      </div>
      <WalletBalanceCard balance={rewardPointsBalance} isCompact={isCompact} />
    </div>
  );
};
