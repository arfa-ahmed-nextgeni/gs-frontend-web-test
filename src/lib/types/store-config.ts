import { CountryCode, LanguageCode, StoreCode } from "@/lib/constants/i18n";
import { Store } from "@/lib/models/stores";
import { ServiceResultOk } from "@/lib/types/service-result";

export type GetStoreConfigResponse = [
  {
    europian_countries: string[];
    stores: {
      [key: string]: {
        allow_gift_order?: string;
        cashondelivery_max: string;
        cashondelivery_min: null;
        checkout_url: string;
        checkoutPayEnabled?: number;
        contact_email: string;
        contact_number: null | string;
        country: string;
        country_code: string;
        country_code_prefix: string;
        currencies: {
          [key: string]: {
            code: string;
            name: string;
            symbol: string;
          };
        };
        estimated_delivery_days?: Array<{
          days_ar?: string;
          days_en?: string;
          method: string;
        }>;
        express_delivery?: {
          cart_banner_text: string;
          cities: Record<string, string>;
          cut_off_time: string;
          cut_off_time_message: string;
          end_hour: string;
          pp_text: string;
          start_hour: string;
        } | null;
        fees: {
          cashondelivery: null;
          flatrate: string;
        };
        free_shipping_base_subtotal: string;
        free_shipping_subtotal: string;
        group_id: string;
        gs_tabby_pay_later: number;
        gs_tamara_installments: {
          web: { installments: number; version: null | string }[];
        };
        installments_widget_sorting: string[];
        is_active: boolean;
        lang_country: string;
        language_name: string;
        loyalty_rules_effect: number;
        sort_order: string;
        store_code?: string;
        store_id: string;
        store_view_id: string;
        storeview_code: StoreCode;
        tabby_installments_config: {
          enabled: 0 | 1;
        };
        tamara_installments_config: {
          enabled: 0 | 1;
        };
        tamara_pay_later_config: {
          enabled: 0 | 1;
        };
        website_code?: string;
        website_id: string;
      };
    };
  },
];

export type LocaleSwitchOption = {
  arLocale: LanguageCode.AR;
  arStoreCode: StoreCode;
  code: CountryCode;
  domain: string;
  enLocale: LanguageCode.EN;
  enStoreCode: StoreCode;
};

export type StoreConfigPromise = Promise<
  | ServiceResultOk<{
      localeSwitchOptions: LocaleSwitchOption[];
      store: Store;
    }>
  | ServiceResultOk<{
      localeSwitchOptions: never[];
      store: null;
    }>
>;
