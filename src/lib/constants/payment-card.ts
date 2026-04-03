import MadaIcon from "@/assets/icons/mada-icon.svg";
import MastercardIcon from "@/assets/icons/mastercard-icon.svg";
import VisaIcon from "@/assets/icons/visa-icon.svg";

export const enum PaymentCardNetwork {
  // AmericanExpress = "american-express",
  // DinersClub = "diners-club",
  // Discover = "discover",
  // Elo = "elo",
  // Hiper = "hiper",
  // Hipercard = "hipercard",
  // JCB = "jcb",
  Mada = "mada",
  // Maestro = "maestro",
  Mastercard = "mastercard",
  // Mir = "mir",
  // UnionPay = "unionpay",
  Unknown = "unknown",
  Visa = "visa",
}

export const PAYMENT_CARD_NETWORK_ICONS = {
  [PaymentCardNetwork.Mada]: MadaIcon,
  [PaymentCardNetwork.Mastercard]: MastercardIcon,
  [PaymentCardNetwork.Unknown]: null,
  [PaymentCardNetwork.Visa]: VisaIcon,
} as const;
