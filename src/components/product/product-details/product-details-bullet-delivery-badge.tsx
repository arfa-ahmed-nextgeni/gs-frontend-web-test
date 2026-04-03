"use client";

import { useMemo } from "react";

import dayjs from "dayjs";
import { useTranslations } from "next-intl";

import RocketIcon from "@/assets/icons/rocket-icon.svg";
import { ProductDetailBadge } from "@/components/product/product-details/product-details-badge";
import { useProductDetails } from "@/contexts/product-details-context";
import { useStoreConfig } from "@/contexts/store-config-context";
import { useLocaleInfo } from "@/hooks/i18n/use-locale-info";
import { useThrottledNow } from "@/hooks/use-throttled-now";

export const ProductDetailsBulletDeliveryBadge = () => {
  const { selectedProduct } = useProductDetails();
  const { storeConfig } = useStoreConfig();
  const storeTimezone = "Asia/Riyadh";
  const { language } = useLocaleInfo();

  const t = useTranslations("ProductPage.badges.bulletDelivery");

  const now = useThrottledNow(1000);

  const bulletDelivery = selectedProduct?.bulletDelivery;
  const bulletConfig = storeConfig?.bulletDeliveryConfig;

  const countdownData = useMemo(() => {
    if (!bulletConfig) return null;

    const { cutOffTime, endHour, startHour } = bulletConfig;
    if (!startHour || !endHour || !cutOffTime || !now) return null;

    const parseStoreTime = (timeStr: string) => {
      const [h = 0, m = 0, s = 0] = timeStr.split(":").map(Number);
      return dayjs().tz(storeTimezone).hour(h).minute(m).second(s);
    };

    const start = parseStoreTime(startHour);
    const end = parseStoreTime(endHour);
    const cutoff = parseStoreTime(cutOffTime);
    const nowDate = dayjs(now).tz(storeTimezone);

    const withinWindow = nowDate.isAfter(start) && nowDate.isBefore(end);

    const afterCutoff = nowDate.isAfter(cutoff);

    if (afterCutoff) {
      return { afterCutoff, remainingMs: 0, withinWindow };
    }

    const remainingMs = end.diff(nowDate);
    if (remainingMs <= 0) {
      return { afterCutoff: false, remainingMs: 0, withinWindow };
    }

    const d = dayjs.duration(remainingMs);
    return {
      afterCutoff: false,
      hours: Math.floor(d.asHours()),
      minutes: d.minutes(),
      remainingMs,
      withinWindow,
    };
  }, [bulletConfig, now, storeTimezone]);

  // Get flatrate delivery message from estimatedDeliveryDays when cutOffTimeMessage is empty
  const flatrateDeliveryMessage = useMemo(() => {
    const isArabic = language === "ar";
    const flatrateItem = storeConfig?.estimatedDeliveryDays?.find(
      (item) => item.method === "lambdashipping_flatrate"
    );

    if (!flatrateItem) return null;

    return isArabic
      ? flatrateItem.days_ar || flatrateItem.days_en || ""
      : flatrateItem.days_en || flatrateItem.days_ar || "";
  }, [language, storeConfig?.estimatedDeliveryDays]);

  if (!bulletConfig || !bulletDelivery) {
    return (
      <ProductDetailBadge bgColor="#FE50000D">
        <p className="text-text-primary text-[11px] font-medium leading-none">
          {flatrateDeliveryMessage}
        </p>
      </ProductDetailBadge>
    );
  }

  const { cutOffTimeMessage, message } = bulletConfig;

  const formatCountdown = () => {
    if (!countdownData || countdownData.remainingMs <= 0) return "";
    const { hours = 0, minutes = 0 } = countdownData;
    return `${hours > 0 ? `${hours} ${t("hours", { count: hours })} ` : ""}${minutes} ${t("minutes", { count: minutes })}`;
  };

  const showCountdown =
    !!countdownData &&
    countdownData.remainingMs > 0 &&
    !countdownData.afterCutoff;

  return (
    <ProductDetailBadge bgColor="#FE50000D" icon={RocketIcon} iconAlt="rocket">
      <div className="flex flex-row items-center gap-2.5">
        {showCountdown && (
          <p className="text-text-primary text-[11px] font-medium leading-none">
            {message || t("3hourDelivery")}
          </p>
        )}

        {showCountdown ? (
          <p className="text-text-danger text-[9px] font-medium leading-none">
            {t("orderIn", { countdown: formatCountdown() })}
          </p>
        ) : (
          <p className="text-text-danger text-[9px] font-medium leading-none">
            {cutOffTimeMessage || ""}
          </p>
        )}
      </div>
    </ProductDetailBadge>
  );
};
