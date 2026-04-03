import { PaymentCardNetwork } from "@/lib/constants/payment-card";
import { CustomerPaymentCardDto } from "@/lib/types/api/payment-card";
import {
  detectPaymentCardNetwork,
  formatPaymentCardExpiry,
  isPaymentCardExpired,
} from "@/lib/utils/payment-card";

export class PaymentCard {
  bin: string;
  cardNetwork: PaymentCardNetwork;
  checkoutPaymentId: null | string;
  expiry: string;
  id: string;
  isDefault: boolean;
  isExpired: boolean;
  last4: string;
  sourceId: string;

  constructor(dto: CustomerPaymentCardDto, opts?: { default?: boolean }) {
    this.id = dto.id;
    this.sourceId =
      dto.id?.trim() && dto.id.startsWith("src_")
        ? dto.id.trim()
        : dto.checkout_payment_id?.trim() || "";
    this.checkoutPaymentId = dto.checkout_payment_id?.trim() || null;
    this.bin = dto.bin || "";
    this.last4 = dto.last4;
    this.cardNetwork = detectPaymentCardNetwork(dto.bin || dto.issuer || "");
    this.expiry = formatPaymentCardExpiry({
      month: dto.expiry_month,
      year: dto.expiry_year,
    });
    this.isExpired = isPaymentCardExpired({
      month: dto.expiry_month,
      year: dto.expiry_year,
    });
    this.isDefault = !!opts?.default;
  }
}

export class PaymentCardCollection {
  paymentCards: PaymentCard[];
  constructor(list?: CustomerPaymentCardDto[]) {
    this.paymentCards =
      list?.map?.(
        (item) => new PaymentCard(item, { default: !!item.is_default })
      ) || [];
  }
}
