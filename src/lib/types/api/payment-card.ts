export type CheckoutTokenDto = {
  bin: string;
  card_category: string;
  card_type: string;
  expires_on: string;
  expiry_month: number;
  expiry_year: number;
  issuer: string;
  issuer_country: string;
  last4: string;
  product_id: string;
  product_type: string;
  scheme: string;
  token: string;
  type: string;
};

export type CustomerPaymentCardDto = {
  bin: string;
  checkout_payment_id: string;
  expiry_month: string;
  expiry_year: string;
  fingerprint: string;
  id: string;
  is_default: number;
  issuer: string;
  issuer_country: string;
  last4: string;
  type: string;
};
