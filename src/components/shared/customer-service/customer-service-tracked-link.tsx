"use client";

import { ComponentProps, PropsWithChildren } from "react";

import { EmailLink } from "@/components/shared/email-link";
import { PhoneLink } from "@/components/shared/phone-link";
import { WhatsAppLink } from "@/components/shared/whatsapp-link";
import {
  trackCsCall,
  trackCsEmail,
  trackCsWhatsapp,
} from "@/lib/analytics/events";

type EmailLinkProps = PropsWithChildren<
  Omit<ComponentProps<typeof EmailLink>, "children">
>;

type PhoneLinkProps = PropsWithChildren<
  Omit<ComponentProps<typeof PhoneLink>, "children">
>;

type WhatsAppLinkProps = PropsWithChildren<
  Omit<ComponentProps<typeof WhatsAppLink>, "children">
>;

export function CustomerServiceCallLink({
  children,
  ...phoneLinkProps
}: PhoneLinkProps) {
  return (
    <PhoneLink {...phoneLinkProps} onClick={trackCsCall}>
      {children}
    </PhoneLink>
  );
}

export function CustomerServiceEmailLink({
  children,
  ...emailLinkProps
}: EmailLinkProps) {
  return (
    <EmailLink {...emailLinkProps} onClick={trackCsEmail}>
      {children}
    </EmailLink>
  );
}

export function CustomerServiceWhatsappLink({
  children,
  ...whatsappLinkProps
}: WhatsAppLinkProps) {
  return (
    <WhatsAppLink
      {...whatsappLinkProps}
      onClick={trackCsWhatsapp}
      target="_blank"
    >
      {children}
    </WhatsAppLink>
  );
}
