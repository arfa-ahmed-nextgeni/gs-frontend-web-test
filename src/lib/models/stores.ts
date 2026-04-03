import {
  CountryCode,
  Locale,
  STORE_TO_LOCALE,
  StoreCode,
  TABBY_TAMARA_INSTALLMENTS_ENABLED_STORES,
} from "@/lib/constants/i18n";
import { GetStoreConfigResponse } from "@/lib/types/store-config";
import { getValues } from "@/lib/utils/object";

export class Store {
  public allowGiftOrder: boolean;
  public bulletDeliveryConfig?: {
    cartBannerText: string;
    cities?: Record<string, string>; // e.g., { "Riyadh": "00:00:00 - 23:10:59", "Jeddah": "00:00:00 - 23:59:59" }
    cutOffTime: string;
    cutOffTimeMessage: string;
    endHour: string;
    message: string;
    startHour: string;
  };
  public cashbackPercent: number | undefined;
  public checkoutPayEnabled: boolean;
  public code: StoreCode;
  public countryCode: string;
  public currencyCode: string;
  public estimatedDeliveryDays?: Array<{
    days_ar?: string;
    days_en?: string;
    method: string;
  }>;
  public freeShippingThreshold?: number;
  public id: string;
  public installmentsWidgetSorting = ["tabby", "tamara"];
  public locale: Locale;
  public loyaltyRulesEffect?: number;
  public regionCode: string;
  public storeCode: string;
  public tabbyInstallments = { enabled: false, installments: 0 };
  public tamaraInstallments = { enabled: false, installments: 0 };
  public websiteCode: string;

  constructor({
    allowGiftOrder,
    bulletDeliveryConfig,
    checkoutPayEnabled,
    code,
    countryCode,
    currencyCode,
    estimatedDeliveryDays,
    freeShippingThreshold,
    id,
    installmentsWidgetSorting,
    loyaltyRulesEffect,
    storeCode,
    tabbyInstallments,
    tamaraInstallments,
    websiteCode,
  }: {
    allowGiftOrder?: boolean;
    bulletDeliveryConfig?: {
      cartBannerText: string;
      cities?: Record<string, string>;
      cutOffTime: string;
      cutOffTimeMessage: string;
      endHour: string;
      message: string;
      startHour: string;
    } | null;
    checkoutPayEnabled?: boolean;
    code: StoreCode;
    countryCode: string;
    currencyCode: string;
    estimatedDeliveryDays?: Array<{
      days_ar?: string;
      days_en?: string;
      method: string;
    }>;
    freeShippingThreshold?: number;
    id: string;
    installmentsWidgetSorting?: string[];
    loyaltyRulesEffect?: number;
    storeCode: string;
    tabbyInstallments?: {
      enabled: boolean;
      installments: number;
    };
    tamaraInstallments?: {
      enabled: boolean;
      installments: number;
    };
    websiteCode: string;
  }) {
    this.code = code;
    this.id = id;
    this.locale = STORE_TO_LOCALE[code];
    this.allowGiftOrder = allowGiftOrder ?? false;
    this.checkoutPayEnabled = checkoutPayEnabled ?? false;
    this.freeShippingThreshold = freeShippingThreshold;
    this.currencyCode = currencyCode;
    this.websiteCode = websiteCode;
    this.storeCode = storeCode;
    this.countryCode = countryCode;
    this.regionCode = countryCode === "US" ? CountryCode.Global : countryCode;

    if (tamaraInstallments) {
      this.tamaraInstallments = tamaraInstallments;
    }

    if (tabbyInstallments) {
      this.tabbyInstallments = tabbyInstallments;
    }

    this.loyaltyRulesEffect = loyaltyRulesEffect;
    if (loyaltyRulesEffect) {
      this.cashbackPercent = loyaltyRulesEffect / 100;
    }

    if (installmentsWidgetSorting) {
      this.installmentsWidgetSorting = installmentsWidgetSorting;
    }

    if (bulletDeliveryConfig) {
      this.bulletDeliveryConfig = bulletDeliveryConfig;
    }

    if (estimatedDeliveryDays) {
      this.estimatedDeliveryDays = estimatedDeliveryDays;
    }
  }
}

export class Stores {
  public storesMap: Map<StoreCode, Store>;

  constructor(data: GetStoreConfigResponse) {
    this.storesMap = new Map(
      Object.values(data[0].stores).map((store) => {
        const websiteCode = store.website_code || "sa";
        const storeCode = store.store_code || "main_website_store";

        return [
          store.storeview_code,
          new Store({
            allowGiftOrder: store.allow_gift_order === "1",
            bulletDeliveryConfig: store.express_delivery
              ? {
                  cartBannerText:
                    store.express_delivery?.cart_banner_text || "",
                  cities: store.express_delivery?.cities || {},
                  cutOffTime: store.express_delivery?.cut_off_time || "",
                  cutOffTimeMessage:
                    store.express_delivery?.cut_off_time_message || "",
                  endHour: store.express_delivery?.end_hour || "",
                  message: store.express_delivery?.pp_text || "",
                  startHour: store.express_delivery?.start_hour || "",
                }
              : null,
            checkoutPayEnabled: store.checkoutPayEnabled === 1,
            code: store.storeview_code,
            countryCode: store.country_code,
            currencyCode: store.currencies
              ? getValues(store.currencies)[0].code
              : "",
            estimatedDeliveryDays: store.estimated_delivery_days,
            freeShippingThreshold: store.free_shipping_subtotal
              ? +store.free_shipping_subtotal
              : undefined,
            id: store.store_id,
            installmentsWidgetSorting: store.installments_widget_sorting,
            loyaltyRulesEffect: store.loyalty_rules_effect,
            storeCode,
            tabbyInstallments: {
              enabled:
                store.tabby_installments_config.enabled === 1 &&
                TABBY_TAMARA_INSTALLMENTS_ENABLED_STORES.includes(
                  store.storeview_code
                ),
              installments:
                store.gs_tamara_installments?.web?.[0]?.installments || 0,
            },
            tamaraInstallments: {
              enabled:
                store.tamara_installments_config?.enabled === 1 &&
                TABBY_TAMARA_INSTALLMENTS_ENABLED_STORES.includes(
                  store.storeview_code
                ),
              installments:
                store.gs_tamara_installments?.web?.[0]?.installments || 0,
            },
            websiteCode,
          }),
        ];
      })
    );
  }

  getAll(): Store[] {
    return [...this.storesMap.values()];
  }

  getByCode(code: StoreCode) {
    return this.storesMap.get(code);
  }
}
