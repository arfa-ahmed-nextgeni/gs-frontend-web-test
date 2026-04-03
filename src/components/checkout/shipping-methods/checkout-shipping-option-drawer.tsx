"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

import Image from "next/image";
import type { StaticImageData } from "next/image";

import { useLocale, useTranslations } from "next-intl";

import Fodel from "@/assets/icons/Fodel.svg";
import GiftIcon from "@/assets/icons/Gifting.svg";
import HomeIcon from "@/assets/icons/home.svg";
import RedBox from "@/assets/icons/RedBox.svg";
import { DrawerLayout } from "@/components/shared/layouts/drawer-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useCheckoutContext } from "@/contexts/checkout-context";
import { useStoreConfig } from "@/contexts/store-config-context";
import { useRouteMatch } from "@/hooks/use-route-match";
import { useRouter } from "@/i18n/navigation";
import { estimateShippingMethodsAction } from "@/lib/actions/checkout/estimate-shipping-methods";
import {
  trackSelectFodel,
  trackSelectRedbox,
  trackShippingTypeSelection,
} from "@/lib/analytics/events";
import { LockerType } from "@/lib/constants/checkout/locker-locations";
import { ROUTES } from "@/lib/constants/routes";
import { getShippingTypeFromOption } from "@/lib/utils/checkout/shipping-type";
import { getLocaleInfo } from "@/lib/utils/locale";
import { isOk } from "@/lib/utils/service-result";

interface CheckoutShippingOptionDrawerProps {
  countryCode?: string;
  initialSelectedOption?: null | string;
  onClose: () => void;
  onConfirm: (selectedOption: string) => void;
}

type ShippingMethod = {
  amount: {
    currency: null | string;
    value: null | number;
  } | null;
  available: boolean;
  carrier_code: null | string;
  carrier_title: null | string;
  cutting_time: null | string;
  delivery_time: null | string;
  free_over_cart_value: null | number;
  method_code: null | string;
  method_title: null | string;
  shipping_days_max: null | number;
  shipping_days_min: null | number;
  shipping_fee: null | number;
  shipping_method_title: null | string;
  shipping_time: null | string;
  start_hour: null | string;
};

type ShippingOption = {
  description: string;
  eta: string;
  icon: StaticImageData | string;
  iconBackground: string;
  id: string;
  title: string;
};

type ShippingOptionSection = {
  options: ShippingOption[];
  title?: string;
};

const iconSize = { height: 20, width: 20 };

const OPTION_ID_TO_METHOD_CODES: Record<string, string[]> = {
  gift_delivery: ["gift_delivery", "gifting"],
  home_delivery: ["flatrate", "flat_rate", "lambdashipping_flatrate"],
  pickup_fodel: ["fodellocker", "fodel_locker", "lambdashipping_fodellocker"],
  pickup_redbox: [
    "redbox",
    "red_box",
    "lambdashipping_redbox",
    "lambdashipping_redboxlocker_redboxlocker",
  ],
};

export function CheckoutShippingOptionDrawer({
  countryCode,
  initialSelectedOption,
  onClose,
  onConfirm,
}: CheckoutShippingOptionDrawerProps) {
  const { setCameFromShippingOptionDrawer } = useCheckoutContext();
  const { storeConfig } = useStoreConfig();
  const allowGiftOrder = storeConfig?.allowGiftOrder ?? false;
  const router = useRouter();
  const { isAddDeliveryAddress, isAddPickupPoint } = useRouteMatch();
  const locale = useLocale();
  const isArabic = locale?.toLowerCase().startsWith("ar");
  const t = useTranslations("CheckoutPage.shippingMethodsDrawer");
  const [isPending, startTransition] = useTransition();
  const [selectedOption, setSelectedOption] = useState<null | string>(
    initialSelectedOption ?? null
  );
  const [availableMethodCodes, setAvailableMethodCodes] = useState<Set<string>>(
    new Set()
  );
  const [shippingMethodsData, setShippingMethodsData] = useState<
    ShippingMethod[]
  >([]);
  const [isLoadingMethods, setIsLoadingMethods] = useState(true);
  const [pendingLockerRoute, setPendingLockerRoute] = useState<null | string>(
    null
  );

  // Prefetch add-pickup-point and add-delivery-address routes for better performance
  useEffect(() => {
    const fodelRoute = ROUTES.CHECKOUT.ADD_PICKUP_POINT(LockerType.Fodel);
    const redboxRoute = ROUTES.CHECKOUT.ADD_PICKUP_POINT(LockerType.Redbox);
    const deliveryRoute = ROUTES.CHECKOUT.ADD_DELIVERY_ADDRESS;

    // Prefetch all routes
    router.prefetch(fodelRoute);
    router.prefetch(redboxRoute);
    router.prefetch(deliveryRoute);
  }, [router]);

  useEffect(() => {
    if (initialSelectedOption !== undefined) {
      setSelectedOption(initialSelectedOption);
    }
  }, [initialSelectedOption]);

  // Close drawer when route changes to add pickup point page or add delivery address page
  useEffect(() => {
    if (pendingLockerRoute && (isAddPickupPoint || isAddDeliveryAddress)) {
      // Route has changed to add pickup point or add delivery address, close the drawer
      onClose();
      setPendingLockerRoute(null);
    }
  }, [isAddPickupPoint, isAddDeliveryAddress, pendingLockerRoute, onClose]);

  useEffect(() => {
    const effectiveCountryCode =
      countryCode ||
      (() => {
        const localeInfo = getLocaleInfo(locale);
        return localeInfo.region;
      })();

    if (!effectiveCountryCode) {
      console.warn(
        "[CheckoutShippingOptionDrawer] No country code available, skipping estimateShippingMethodsAction"
      );
      setIsLoadingMethods(false);
      return;
    }

    setIsLoadingMethods(true);
    estimateShippingMethodsAction({ countryCode: effectiveCountryCode })
      .then((result) => {
        if (isOk(result)) {
          const methodCodes = new Set<string>();
          result.data.methods.forEach((method) => {
            if (method.method_code) {
              methodCodes.add(method.method_code.toLowerCase());
            }
            if (method.carrier_code) {
              methodCodes.add(method.carrier_code.toLowerCase());
            }
            if (method.carrier_code && method.method_code) {
              const combined =
                `${method.carrier_code}_${method.method_code}`.toLowerCase();
              methodCodes.add(combined);
            }
          });
          setAvailableMethodCodes(methodCodes);
          setShippingMethodsData(result.data.methods);
        }
      })
      .catch((error) => {
        console.error("Error estimating shipping methods:", error);
      })
      .finally(() => {
        setIsLoadingMethods(false);
      });
  }, [countryCode, locale]);

  const sections = useMemo<ShippingOptionSection[]>(() => {
    const getEtaFromStoreConfig = (optionId: string): null | string => {
      const estimatedDays = storeConfig?.estimatedDeliveryDays;
      if (!estimatedDays || estimatedDays.length === 0) {
        return null;
      }

      const possibleCodes = OPTION_ID_TO_METHOD_CODES[optionId] || [];
      for (const configItem of estimatedDays) {
        const configMethod = configItem?.method?.toLowerCase() || "";
        if (!configMethod) continue;

        const exactMatch = possibleCodes.some((code) => {
          const lowerCode = code.toLowerCase();
          return configMethod === lowerCode;
        });

        if (exactMatch && configItem) {
          const etaText = isArabic
            ? configItem.days_ar
            : configItem.days_en || configItem.days_ar;
          if (etaText) {
            return etaText
              .replace(
                /^(Estimated Delivery|Delivery in|التوصيل خلال):?\s*/i,
                ""
              )
              .trim();
          }
        }
      }

      for (const configItem of estimatedDays) {
        const configMethod = configItem?.method?.toLowerCase() || "";
        if (!configMethod) continue;

        const matches = possibleCodes.some((code) => {
          const lowerCode = code.toLowerCase();

          if (configMethod === `lambdashipping_${lowerCode}`) return true;
          if (lowerCode === `lambdashipping_${configMethod}`) return true;

          const configMethodBase = configMethod.replace(/^lambdashipping_/, "");
          const lowerCodeBase = lowerCode.replace(/^lambdashipping_/, "");

          if (configMethodBase === lowerCodeBase && configMethodBase)
            return true;
          if (configMethod === lowerCodeBase && lowerCodeBase) return true;
          if (lowerCode === configMethodBase && configMethodBase) return true;

          if (
            (configMethod === "gifting" && lowerCode === "gift_delivery") ||
            (configMethod === "gift_delivery" && lowerCode === "gifting")
          ) {
            return true;
          }
          if (configMethod.startsWith(lowerCode + "_")) {
            return true;
          }
          if (lowerCode.startsWith(configMethod + "_")) {
            const configBase = configMethod.replace(/^lambdashipping_/, "");
            const codeBase = lowerCode.replace(/^lambdashipping_/, "");
            const codeParts = codeBase.split("_");
            const configParts = configBase.split("_");
            if (configParts.every((part) => codeParts.includes(part))) {
              return true;
            }
          }

          return false;
        });

        if (matches && configItem) {
          const etaText = isArabic
            ? configItem.days_ar
            : configItem.days_en || configItem.days_ar;
          if (etaText) {
            return etaText
              .replace(
                /^(Estimated Delivery|Delivery in|التوصيل خلال):?\s*/i,
                ""
              )
              .trim();
          }
        }
      }

      return null;
    };
    const getDynamicEta = (optionId: string): null | string => {
      const storeConfigEta = getEtaFromStoreConfig(optionId);
      if (storeConfigEta) {
        return storeConfigEta;
      }
      const possibleCodes = OPTION_ID_TO_METHOD_CODES[optionId] || [];

      for (const method of shippingMethodsData) {
        if (!method.available) continue;

        const methodCode = method.method_code?.toLowerCase() || "";
        const carrierCode = method.carrier_code?.toLowerCase() || "";
        const combined =
          method.carrier_code && method.method_code
            ? `${carrierCode}_${methodCode}`.toLowerCase()
            : "";

        const matches = possibleCodes.some((code) => {
          const lowerCode = code.toLowerCase();
          return (
            methodCode === lowerCode ||
            methodCode === `lambdashipping_${lowerCode}` ||
            carrierCode === lowerCode ||
            combined.includes(lowerCode) ||
            combined.includes(`lambdashipping_${lowerCode}`)
          );
        });

        if (matches) {
          let eta: null | string = null;

          if (method.delivery_time) {
            eta = method.delivery_time;
          } else if (method.shipping_time) {
            eta = method.shipping_time;
          } else if (
            method.shipping_days_min !== null &&
            method.shipping_days_max !== null
          ) {
            if (method.shipping_days_min === method.shipping_days_max) {
              const daysText = method.shipping_days_min === 1 ? "day" : "days";
              eta = `${method.shipping_days_min} ${daysText}`;
            } else {
              eta = `${method.shipping_days_min} - ${method.shipping_days_max} days`;
            }
          }
          if (eta) {
            return eta
              .replace(
                /^(Estimated Delivery|Delivery in|التوصيل خلال):?\s*/i,
                ""
              )
              .trim();
          }
        }
      }

      return null;
    };

    const isOptionAvailableLocal = (optionId: string): boolean => {
      if (optionId === "gift_delivery") {
        return allowGiftOrder;
      }

      if (availableMethodCodes.size === 0) {
        return true;
      }

      const possibleCodes = OPTION_ID_TO_METHOD_CODES[optionId] || [];
      return possibleCodes.some((code) => {
        const lowerCode = code.toLowerCase();
        return (
          availableMethodCodes.has(lowerCode) ||
          availableMethodCodes.has(`lambdashipping_${lowerCode}`)
        );
      });
    };
    const allOptions: ShippingOption[] = [
      {
        description: t("deliverySection.options.home.description"),
        eta:
          getDynamicEta("home_delivery") ||
          t("deliverySection.options.home.eta"),
        icon: HomeIcon,
        iconBackground: "bg-[#FFE9D6]",
        id: "home_delivery",
        title: t("deliverySection.options.home.title"),
      },
      // Only include gift delivery if allowed by store config
      ...(allowGiftOrder
        ? [
            {
              description: t("deliverySection.options.gift.description"),
              eta:
                getDynamicEta("gift_delivery") ||
                t("deliverySection.options.gift.eta"),
              icon: GiftIcon,
              iconBackground: "bg-[#EFE1FF]",
              id: "gift_delivery",
              title: t("deliverySection.options.gift.title"),
            },
          ]
        : []),
      {
        description: t("pickupSection.options.redbox.description"),
        eta:
          getDynamicEta("pickup_redbox") ||
          t("pickupSection.options.redbox.eta"),
        icon: RedBox,
        iconBackground: "bg-[#FFE1E1]",
        id: "pickup_redbox",
        title: t("pickupSection.options.redbox.title"),
      },
      {
        description: t("pickupSection.options.fodel.description"),
        eta:
          getDynamicEta("pickup_fodel") || t("pickupSection.options.fodel.eta"),
        icon: Fodel,
        iconBackground: "bg-[#E3F2FF]",
        id: "pickup_fodel",
        title: t("pickupSection.options.fodel.title"),
      },
    ];

    const availableOptions = allOptions.filter((option) =>
      isOptionAvailableLocal(option.id)
    );

    const deliveryOptions = availableOptions.filter(
      (option) => option.id === "home_delivery" || option.id === "gift_delivery"
    );
    const pickupOptions = availableOptions.filter(
      (option) => option.id === "pickup_redbox" || option.id === "pickup_fodel"
    );

    const result: ShippingOptionSection[] = [];

    if (deliveryOptions.length > 0) {
      result.push({
        options: deliveryOptions,
      });
    }

    if (pickupOptions.length > 0) {
      result.push({
        options: pickupOptions,
        title: t("pickupSection.title"),
      });
    }

    return result;
  }, [
    t,
    availableMethodCodes,
    allowGiftOrder,
    shippingMethodsData,
    storeConfig,
    isArabic,
  ]);

  return (
    <DrawerLayout
      onBack={onClose}
      onClose={onClose}
      showBackButton
      title={t("title")}
      widthClassName="!w-[420px]"
    >
      <div
        className="flex h-full flex-col bg-[#F7F8FA]"
        dir={isArabic ? "rtl" : "ltr"}
      >
        <div className="flex-1 overflow-y-auto px-5 pb-6 pt-5">
          {isLoadingMethods ? (
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="space-y-1">
                  {[1, 2].map((index) => (
                    <div
                      className="flex w-full rounded-[10px] border border-transparent bg-white p-4"
                      key={`skeleton-delivery-${index}`}
                    >
                      <div className="flex flex-1 gap-5">
                        <Skeleton className="h-5 w-5 shrink-0 rounded-xl" />
                        <div className="flex-1 space-y-2">
                          <Skeleton
                            className={`h-4 w-32 ${isArabic ? "rtl:text-right" : "ltr:text-left"}`}
                          />
                          <Skeleton
                            className={`h-3 w-48 ${isArabic ? "rtl:text-right" : "ltr:text-left"}`}
                          />
                        </div>
                        <Skeleton
                          className={`h-3 w-16 ${isArabic ? "rtl:text-right" : "ltr:text-left"}`}
                        />
                      </div>
                      <Skeleton
                        className={`h-5 w-5 shrink-0 rounded-full ${isArabic ? "ml-0 mr-4" : "ml-4"}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <Skeleton
                  className={`h-4 w-24 ${isArabic ? "text-right" : "text-left"}`}
                />
                <div className="space-y-1">
                  {[1, 2].map((index) => (
                    <div
                      className="flex w-full rounded-[10px] border border-transparent bg-white p-4"
                      key={`skeleton-pickup-${index}`}
                    >
                      <div className="flex flex-1 gap-5">
                        <Skeleton className="h-5 w-5 shrink-0 rounded-xl" />
                        <div className="flex-1 space-y-2">
                          <Skeleton
                            className={`h-4 w-32 ${isArabic ? "rtl:text-right" : "ltr:text-left"}`}
                          />
                          <Skeleton
                            className={`h-3 w-48 ${isArabic ? "rtl:text-right" : "ltr:text-left"}`}
                          />
                        </div>
                        <Skeleton
                          className={`h-3 w-16 ${isArabic ? "rtl:text-right" : "ltr:text-left"}`}
                        />
                      </div>
                      <Skeleton
                        className={`h-5 w-5 shrink-0 rounded-full ${isArabic ? "ml-0 mr-4" : "ml-4"}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : sections.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <span className="text-text-secondary text-sm">
                {t("noShippingMethodsAvailable")}
              </span>
            </div>
          ) : (
            <div className="space-y-6">
              {sections.map((section, index) => (
                <div
                  className="space-y-3"
                  key={section.title ?? `section-${index}`}
                >
                  {section.title && (
                    <h3
                      className={`text-sm font-medium text-[#85878A] ${isArabic ? "text-right" : "text-left"}`}
                    >
                      {section.title}
                    </h3>
                  )}

                  <div className="space-y-1">
                    {section.options.map((option) => {
                      const isSelected = option.id === selectedOption;

                      return (
                        <button
                          className={`flex w-full rounded-[10px] p-4 transition focus-visible:outline-none ${
                            isSelected
                              ? "border-primary bg-white shadow-sm"
                              : "border-transparent bg-white"
                          }`}
                          key={option.id}
                          onClick={() => setSelectedOption(option.id)}
                          type="button"
                        >
                          <div className="flex flex-1 gap-5">
                            <Image
                              alt={option.title}
                              className="-mt-[20px] rounded-xl"
                              height={iconSize.height}
                              priority
                              src={option.icon}
                              unoptimized
                              width={iconSize.width}
                            />

                            <div className="flex-1">
                              <p
                                className={`text-text-primary text-[15px] font-normal ltr:text-left rtl:text-right`}
                              >
                                {option.title}
                              </p>
                              <p
                                className={`text-xs text-[#BDC2C5] ltr:text-left rtl:text-right`}
                              >
                                {option.description}
                              </p>
                            </div>

                            <span
                              className={`text-text-secondary $ltr:text-left mt-10 text-xs font-medium rtl:text-right`}
                            >
                              {option.eta}
                            </span>
                          </div>

                          <span
                            aria-hidden="true"
                            className={`border-[#D0D5DD]" } border-1 ml-4 inline-flex h-5 w-5 items-center justify-center rounded-full ${isArabic ? "ml-0 mr-4" : ""}`}
                          >
                            {isSelected && (
                              <span className="bg-primary inline-block h-3 w-3 rounded-full bg-[#6543F5]" />
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-5 pb-6">
          <button
            className="hover:bg-primary/90 inline-flex h-[50px] w-full items-center justify-center gap-2 rounded-[12px] bg-[#374957] text-[20px] font-medium text-white transition disabled:cursor-not-allowed disabled:bg-[#B5B8C1]"
            disabled={!selectedOption || isLoadingMethods || isPending}
            onClick={() => {
              if (!selectedOption) return;

              // Track shipping_type_selection for all options
              trackShippingTypeSelection(
                getShippingTypeFromOption(selectedOption)
              );

              // Track specific locker selection events
              if (selectedOption === LockerType.Fodel) {
                trackSelectFodel();
              } else if (selectedOption === LockerType.Redbox) {
                trackSelectRedbox();
              }

              if (
                [LockerType.Fodel, LockerType.Redbox].includes(
                  selectedOption as LockerType
                )
              ) {
                // Set flag to indicate we came from shipping option drawer
                setCameFromShippingOptionDrawer(true);
                const targetRoute = ROUTES.CHECKOUT.ADD_PICKUP_POINT(
                  selectedOption as LockerType
                );
                // Store the target route to detect when navigation completes
                setPendingLockerRoute(targetRoute);
                // Use transition to keep UI responsive during navigation
                startTransition(() => {
                  router.push(targetRoute);
                });
                // Drawer will close automatically when pathname changes (via useEffect)
                return;
              } else if (
                selectedOption === "home_delivery" ||
                selectedOption === "gift_delivery"
              ) {
                // Set flag to indicate we came from shipping option drawer
                setCameFromShippingOptionDrawer(true);
                const targetRoute = `${ROUTES.CHECKOUT.ADD_DELIVERY_ADDRESS}?type=${selectedOption}`;
                // Store the target route to detect when navigation completes
                setPendingLockerRoute(targetRoute);
                // Use transition to keep UI responsive during navigation
                startTransition(() => {
                  router.push(targetRoute);
                });
                // Drawer will close automatically when pathname changes (via useEffect)
                return;
              } else {
                onConfirm(selectedOption);
              }
            }}
            type="button"
          >
            {isPending && <Spinner size={20} variant="light" />}
            {t("proceedButton")}
          </button>
        </div>
      </div>
    </DrawerLayout>
  );
}
