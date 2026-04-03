"use client";

import { ComponentProps } from "react";

import { Link } from "@/i18n/navigation";

interface WhatsAppLinkProps extends Omit<ComponentProps<typeof Link>, "href"> {
  phoneNumber: string;
}

/**
 * Client component for WhatsApp links with analytics tracking
 * Use this for WhatsApp links that need to track cs_whatsapp events
 */
export function WhatsAppLink({ phoneNumber, ...props }: WhatsAppLinkProps) {
  const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\s+/g, "").replace(/[^\d+]/g, "")}`;

  return <Link {...props} href={whatsappUrl} target="_blank" />;
}
