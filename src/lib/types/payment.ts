export type MakePaymentRequest = {
  orderId: string;
  payload: PaymentPayload;
};

export type MakePaymentResponse = {
  additional_data?: string[];
  error?: string;
  message?: string;
  success?: boolean;
};

export type PayFortApplePayPayResponse = {
  body: {
    "3ds_url": string;
    amount: number;
    command: string;
    currency: string;
    eci: string;
    fort_id: string;
    language: string;
    merchant_reference: string;
    payment_option: string;
    response_code: string;
    response_message: string;
    status: string;
  };
  errors: object;
  exception: any[];
  message: string;
  status_code: number;
};

export type PaymentMethodType =
  | "checkoutapplepay"
  | "checkoutcom_pay"
  | "pay_by_instalments"
  | "payfortapplepay"
  | "payfortcc"
  | "tabby_installments";

export type PaymentPayload =
  | {
      "3ds"?: {
        enabled: boolean;
      };
      card_id: string;
      checkout_payment_id: string;
      failure_url?: string;
      success_url?: string;
    }
  | {
      "3ds"?: {
        enabled: boolean;
      };
      card_id: string;
      cvv: string;
      failure_url?: string;
      success_url?: string;
    }
  | {
      "3ds"?: {
        enabled: boolean;
      };
      failure_url?: string;
      success_url?: string;
      token: string;
    }
  | {
      // Optional metadata fields used by specific integrations (e.g. checkoutapplepay)
      base_url?: string;
      card_id?: string;
      cvv?: string;
      failure_url?: string;
      locale?: string;
      merchant_urls: {
        cancel: string;
        failure: string;
        success: string;
      };
      order_id?: string;
      payment_method_type?: string;
      success_url?: string;
      token?: string;
    }
  | {
      gateway: "payfort";
      status: "completed" | "failed";
    }
  | {
      instalments: string;
      is_mobile: boolean;
      merchant_urls: {
        cancel: string;
        failure: string;
        success: string;
      };
    }
  | {
      token: string;
    }
  | PayFortApplePayPayResponse;
