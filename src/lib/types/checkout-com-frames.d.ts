// Minimal ambient types for Checkout.com Frames.js v2, loaded globally via
// <script src="https://cdn.checkout.com/js/framesv2.min.js">. No official
// npm types package exists for this SDK version.

interface CheckoutComFramesCardTokenizedEvent {
  bin?: string;
  card_type?: string;
  expiry_month: number;
  expiry_year: number;
  last4: string;
  local_storage?: boolean;
  scheme?: string;
  token: string;
  token_type: string;
}

type CheckoutComFramesEventHandler =
  | (() => void)
  | ((event: CheckoutComFramesCardTokenizedEvent) => void)
  | ((event: CheckoutComFramesFrameElementEvent) => void)
  | ((event: CheckoutComFramesPaymentMethodChangedEvent) => void)
  | ((event: CheckoutComFramesValidationChangedEvent) => void);

interface CheckoutComFramesFrameElementEvent {
  element: "card-number" | "cvv" | "expiry-date";
}

interface CheckoutComFramesInitConfig {
  containerSelector?: string;
  cvvPlaceholder?: string;
  localization?: {
    cardNumberPlaceholder?: string;
    cvvPlaceholder?: string;
    expiryMonthPlaceholder?: string;
    expiryYearPlaceholder?: string;
  };
  modes?: string[];
  publicKey: string;
  style?: CheckoutComFramesStyle;
}

interface CheckoutComFramesPaymentMethodChangedEvent {
  paymentMethod: null | string;
}

interface CheckoutComFramesStatic {
  addEventHandler: (
    event: string,
    handler: CheckoutComFramesEventHandler
  ) => void;
  enableSubmitForm: () => void;
  Events: {
    CARD_TOKENIZATION_FAILED: "cardTokenizationFailed";
    CARD_TOKENIZED: "cardTokenized";
    CARD_VALIDATION_CHANGED: "cardValidationChanged";
    FRAME_ACTIVATED: "frameActivated";
    FRAME_BLUR: "frameBlur";
    FRAME_FOCUS: "frameFocus";
    FRAME_VALIDATION_CHANGED: "frameValidationChanged";
    PAYMENT_METHOD_CHANGED: "paymentMethodChanged";
    READY: "ready";
  };
  init: (config: CheckoutComFramesInitConfig) => void;
  isCardValid: () => boolean;
  modes: {
    CVV_HIDDEN: "cvv_hidden";
    CVV_OPTIONAL: "cvv_optional";
    DISABLE_AUTO_FOCUS: "disable_auto_focus";
    DISABLE_COPY_PASTE: "disable_copy_paste";
    FEATURE_FLAG_SCHEME_CHOICE: "feature_flag_scheme_choice";
    RIGHT_TO_LEFT: "right_to_left";
  };
  removeEventHandler: (
    event: string,
    handler: CheckoutComFramesEventHandler
  ) => void;
  submitCard: () => Promise<CheckoutComFramesCardTokenizedEvent>;
}

interface CheckoutComFramesStyle {
  base?: Record<string, string>;
  focus?: Record<string, string>;
  invalid?: Record<string, string>;
  placeholder?: {
    base?: Record<string, string>;
  };
  valid?: Record<string, string>;
}

interface CheckoutComFramesValidationChangedEvent {
  element: "card-number" | "cvv" | "expiry-date";
  isEmpty: boolean;
  isValid: boolean;
}

declare global {
  interface Window {
    Frames?: CheckoutComFramesStatic;
  }
}
