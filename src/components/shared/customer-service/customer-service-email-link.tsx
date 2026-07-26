"use client";

import type { ComponentProps, MouseEvent, PropsWithChildren } from "react";

import { useTranslations } from "next-intl";

import { toast } from "@/components/ui/sonner";
import { CUSTOMER_SERVICE_TRACKING_DATA_ATTRIBUTE } from "@/lib/constants/tracking-data-attributes";

const MAILTO_FALLBACK_DELAY_MS = 1200;

type CustomerServiceEmailLinkProps = {
  email: string;
} & PropsWithChildren<
  Omit<ComponentProps<"a">, "children" | "href" | "onClick">
>;

export function CustomerServiceEmailLink({
  children,
  email,
  ...linkProps
}: CustomerServiceEmailLinkProps) {
  const t = useTranslations("CustomerServiceActionSheet");
  const normalizedEmail = email.trim();

  return (
    <a
      {...linkProps}
      href={`mailto:${normalizedEmail}`}
      onClick={(event) => {
        handleMailtoClick(event, normalizedEmail, {
          copiedDescription: t("emailFallbackCopiedDescription"),
          copiedTitle: t("emailFallbackCopiedTitle"),
          fallbackDescription: t("emailFallbackDescription", {
            email: normalizedEmail,
          }),
          fallbackTitle: t("emailFallbackTitle"),
        });
      }}
      {...{
        [CUSTOMER_SERVICE_TRACKING_DATA_ATTRIBUTE]: "email",
      }}
    >
      {children}
    </a>
  );
}

function copyEmailToClipboard(email: string) {
  if (!navigator.clipboard) {
    return Promise.resolve(false);
  }

  return navigator.clipboard.writeText(email).then(
    () => true,
    () => false
  );
}

function handleMailtoClick(
  event: MouseEvent<HTMLAnchorElement>,
  email: string,
  messages: {
    copiedDescription: string;
    copiedTitle: string;
    fallbackDescription: string;
    fallbackTitle: string;
  }
) {
  if (!email) {
    event.preventDefault();
    return;
  }

  const copyResult = copyEmailToClipboard(email);

  window.setTimeout(() => {
    if (document.visibilityState !== "visible" || !document.hasFocus()) {
      return;
    }

    copyResult.then((didCopy) => {
      toast({
        description: didCopy
          ? messages.copiedDescription
          : messages.fallbackDescription,
        title: didCopy ? messages.copiedTitle : messages.fallbackTitle,
        type: "info",
      });
    });
  }, MAILTO_FALLBACK_DELAY_MS);
}
