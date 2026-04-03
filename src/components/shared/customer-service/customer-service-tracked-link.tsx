import type { ComponentProps, PropsWithChildren } from "react";

import { Link } from "@/i18n/navigation";
import { CUSTOMER_SERVICE_TRACKING_DATA_ATTRIBUTE } from "@/lib/constants/tracking-data-attributes";

type CustomerServiceLinkProps = PropsWithChildren<
  Omit<ComponentProps<typeof Link>, "children" | "href">
>;

type EmailLinkProps = {
  email: string;
} & CustomerServiceLinkProps;

type PhoneLinkProps = {
  phoneNumber: string;
} & CustomerServiceLinkProps;

type WhatsAppLinkProps = {
  phoneNumber: string;
} & CustomerServiceLinkProps;

export function CustomerServiceCallLink({
  children,
  phoneNumber,
  ...linkProps
}: PhoneLinkProps) {
  return (
    <Link
      {...linkProps}
      href={`tel:${phoneNumber}`}
      {...{
        [CUSTOMER_SERVICE_TRACKING_DATA_ATTRIBUTE]: "call",
      }}
    >
      {children}
    </Link>
  );
}

export function CustomerServiceEmailLink({
  children,
  email,
  ...linkProps
}: EmailLinkProps) {
  return (
    <Link
      {...linkProps}
      href={`mailto:${email}`}
      {...{
        [CUSTOMER_SERVICE_TRACKING_DATA_ATTRIBUTE]: "email",
      }}
    >
      {children}
    </Link>
  );
}

export function CustomerServiceWhatsappLink({
  children,
  phoneNumber,
  ...linkProps
}: WhatsAppLinkProps) {
  return (
    <Link
      {...linkProps}
      href={getWhatsappUrl(phoneNumber)}
      target="_blank"
      {...{
        [CUSTOMER_SERVICE_TRACKING_DATA_ATTRIBUTE]: "whatsapp",
      }}
    >
      {children}
    </Link>
  );
}

function getWhatsappUrl(phoneNumber: string) {
  return `https://wa.me/${phoneNumber.replace(/\s+/g, "").replace(/[^\d+]/g, "")}`;
}
