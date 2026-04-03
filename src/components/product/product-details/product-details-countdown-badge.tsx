import { useTranslations } from "next-intl";

import FlashIcon from "@/assets/icons/flash-icon.svg";
import { ProductDetailBadge } from "@/components/product/product-details/product-details-badge";
import { useProductDetails } from "@/contexts/product-details-context";

export const ProductDetailsCountdownBadge = () => {
  const { countdownData, countdownTimer } = useProductDetails();

  const t = useTranslations("ProductPage.badges.flashSale");
  const tCommon = useTranslations("common");

  if (!countdownTimer || !countdownTimer.enabled || !countdownData) {
    return null;
  }

  const formatCountdown = () => {
    const { days, hours, minutes, seconds } = countdownData!;
    const pad = (n: number) => String(n).padStart(2, "0");
    const timePart = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    const daySuffix = tCommon("countdownDaySuffix");
    return days > 0 ? `${days}${daySuffix}:${timePart}` : timePart;
  };

  return (
    <ProductDetailBadge bgColor="#ffc72c0d" icon={FlashIcon} iconAlt="flash">
      <p className="text-text-primary text-[11px] font-medium leading-none">
        {t("endsIn", {
          countdown: formatCountdown(),
          hasTitle: countdownTimer.title ? "yes" : "other",
          title: countdownTimer.title,
        })}
      </p>
    </ProductDetailBadge>
  );
};
