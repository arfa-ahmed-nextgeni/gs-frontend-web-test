import DirhamCoinIcon from "@/assets/icons/dirham-coin-icon.svg";
import DollarCoinIcon from "@/assets/icons/dollar-coin-icon.svg";
import RiyalIcon from "@/assets/icons/riyal-icon.svg";
import { useLocaleInfo } from "@/hooks/i18n/use-locale-info";
import { CountryCode } from "@/lib/constants/i18n";

type WalletIcon = typeof RiyalIcon;

const WALLET_ICON_BY_COUNTRY: Record<string, WalletIcon> = {
  [CountryCode.Emirates]: DirhamCoinIcon,
  [CountryCode.Saudi]: RiyalIcon,
};

export function useOrderLocaleAssets() {
  const { language, region } = useLocaleInfo();

  return {
    language,
    walletIcon: getOrderWalletIconByCountry(region),
  };
}

function getOrderWalletIconByCountry(region: string): WalletIcon {
  return WALLET_ICON_BY_COUNTRY[region] ?? DollarCoinIcon;
}
