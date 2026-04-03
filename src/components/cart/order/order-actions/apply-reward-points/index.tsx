"use client";

import Image from "next/image";

import { useTranslations } from "next-intl";

import DirhamCoinIcon from "@/assets/icons/dirham-coin-icon.svg";
import DollarCoinIcon from "@/assets/icons/dollar-coin-icon.svg";
import RiyalIcon from "@/assets/icons/riyal-icon.svg";
import { RewardPointsSwitch } from "@/components/cart/order/order-actions/apply-reward-points/reward-points-switch";
import { LocalizedPrice } from "@/components/shared/localized-price";
import { useStoreConfig } from "@/contexts/store-config-context";
import { useCart } from "@/contexts/use-cart";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils/price";

interface ApplyRewardPointsProps {
  currencyCode: string;
}

export function ApplyRewardPoints({ currencyCode }: ApplyRewardPointsProps) {
  const { cart } = useCart();
  const { storeConfig } = useStoreConfig();
  const t = useTranslations("CartPage.orderSummary");

  // Only show wallet section if loyalty_rules_effect exists in store config
  if (!storeConfig?.loyaltyRulesEffect) {
    return null;
  }

  const code = storeConfig?.code;
  const store = code?.endsWith("sa")
    ? "sa"
    : code?.endsWith("ae")
      ? "ae"
      : "other";

  const walletIcon =
    store === "sa"
      ? RiyalIcon
      : store === "ae"
        ? DirhamCoinIcon
        : DollarCoinIcon;

  if (!cart?.pointsToSpend || cart.pointsToSpend <= 0) {
    return null;
  }

  const rewardThreshold = cart?.rewardThreshold ?? 0;
  const isThresholdNotMet = rewardThreshold > 0;

  return (
    <li className="border-border-base border-t">
      <div className="h-11.25 flex items-center justify-between px-4">
        <span className="flex items-center gap-3">
          {walletIcon ? (
            <Image
              alt="wallet icon"
              className="size-5 opacity-80"
              height={20}
              src={walletIcon}
              width={20}
            />
          ) : null}
          <span
            className={cn(
              "transition-default text-[15px]",
              cart.appliedRewardPoints ? "text-text-teal" : "text-text-primary"
            )}
          >
            {t.rich(
              cart.appliedRewardPoints
                ? "actions.usedWallet"
                : "actions.useWallet",
              {
                amount: () => (
                  <LocalizedPrice
                    containerProps={{
                      className: "font-semibold",
                    }}
                    price={formatPrice({
                      amount: cart.pointsToSpend ?? 0,
                      currencyCode,
                    })}
                  />
                ),
              }
            )}
          </span>
        </span>
        <RewardPointsSwitch />
      </div>
      {isThresholdNotMet && (
        <div className="bg-label-accent-light text-text-primary mx-4 mb-3 flex justify-center gap-1 rounded-md py-2 text-xs font-normal">
          {t.rich("actions.spendAdditionalToUnlock", {
            amount: () => (
              <LocalizedPrice
                containerProps={{
                  className: "font-semibold",
                }}
                price={formatPrice({
                  amount: rewardThreshold,
                  currencyCode,
                })}
              />
            ),
          })}
        </div>
      )}
    </li>
  );
}
