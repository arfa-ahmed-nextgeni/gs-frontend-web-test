export interface PaymentMethod {
  description?: null | React.ReactNode | string;
  descriptionPrice?: null | string;
  downtimeAlert?: null | string;
  icon: string;
  id: string;
  isAvailable?: boolean;
  name: string;
  originalCode?: string;
}

export const PAYMENT_METHOD_IDS = {
  APPLE_PAY: "checkoutapplepay",
  COD: "cod",
  MADA: "mada",
  TABBY: "tabby",
  TAMARA: "tamara",
} as const;
