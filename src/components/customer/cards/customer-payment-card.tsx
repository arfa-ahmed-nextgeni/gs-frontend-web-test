import Image from "next/image";

import { useTranslations } from "next-intl";

import { DeletePaymentCardButton } from "@/components/customer/cards/delete-payment-card-button";
import { MakePaymentCardDefaultButton } from "@/components/customer/cards/make-payment-card-default-button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { PAYMENT_CARD_NETWORK_ICONS } from "@/lib/constants/payment-card";
import { PaymentCard } from "@/lib/models/payment-card";
import { cn } from "@/lib/utils";

export const CustomerPaymentCard = ({
  cardNetwork,
  defaultExpanded,
  expiry,
  id,
  isDefault,
  isExpired,
  last4,
}: { defaultExpanded?: boolean } & PaymentCard) => {
  const t = useTranslations("CustomerCardsPage");

  const cardTypeIcon = PAYMENT_CARD_NETWORK_ICONS[cardNetwork];

  return (
    <Collapsible
      alwaysOpenOnDesktop
      className="transition-default bg-bg-default hover:bg-bg-surface data-[state=closed]:bg-bg-surface flex flex-col rounded-xl shadow-[0_1px_0_0_var(--color-bg-surface)]"
      defaultOpen={defaultExpanded}
    >
      <CollapsibleTrigger className="h-12.5 flex flex-row items-center justify-between px-5 lg:pointer-events-none">
        {cardTypeIcon ? (
          <Image alt="Card network" src={cardTypeIcon} unoptimized />
        ) : (
          <div className="w-7.5" />
        )}
        <div className="flex flex-row gap-2.5">
          <p className="text-text-primary text-xs font-normal">
            {t("cardEndingIn")}
          </p>
          <p className="text-text-primary text-xs font-bold">{last4}</p>
        </div>
        <div
          className={cn("min-w-18 rtl:min-w-26 flex flex-row justify-between", {
            "rtl:justify-end": isExpired,
          })}
        >
          <p
            className={cn("text-text-primary text-xs font-normal", {
              "text-text-danger": isExpired,
            })}
          >
            {t(isExpired ? "expired" : "expiry")}
          </p>
          {!isExpired && (
            <p className="text-text-primary text-xs font-bold">{expiry}</p>
          )}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="h-11.25 border-border-base flex flex-row items-center justify-between border-t px-5">
        {isDefault ? (
          <div className="h-6.25 bg-bg-primary text-text-inverse min-w-18.5 flex items-center justify-center rounded-xl px-2.5 text-xs font-medium">
            {t("default")}
          </div>
        ) : (
          <MakePaymentCardDefaultButton id={id} />
        )}
        <DeletePaymentCardButton id={id} />
      </CollapsibleContent>
    </Collapsible>
  );
};
