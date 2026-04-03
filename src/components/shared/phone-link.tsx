"use client";

import { ComponentProps } from "react";

import { Link } from "@/i18n/navigation";

interface PhoneLinkProps extends Omit<ComponentProps<typeof Link>, "href"> {
  phoneNumber: string;
}

/**
 * Client component for phone links with analytics tracking
 * Use this for phone links that need to track cs_call events
 */
export function PhoneLink({ phoneNumber, ...props }: PhoneLinkProps) {
  const phoneUrl = `tel:${phoneNumber}`;

  return <Link {...props} href={phoneUrl} />;
}
