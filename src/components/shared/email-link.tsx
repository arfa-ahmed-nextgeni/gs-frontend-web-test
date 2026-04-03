"use client";

import { ComponentProps } from "react";

import { Link } from "@/i18n/navigation";

interface EmailLinkProps extends Omit<ComponentProps<typeof Link>, "href"> {
  email: string;
}

/**
 * Client component for Email links with analytics tracking
 * Use this for Email links that need to track cs_email events
 */
export function EmailLink({ email, ...props }: EmailLinkProps) {
  const emailUrl = `mailto:${email}`;

  return <Link {...props} href={emailUrl} />;
}
