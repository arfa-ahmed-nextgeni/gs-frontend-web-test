"use client";

import { useTranslations } from "next-intl";

import { useLocaleInfo } from "@/hooks/i18n/use-locale-info";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

interface WalletFooterLinksProps {
  className?: string;
}

export function WalletFooterLinks({ className }: WalletFooterLinksProps) {
  const t = useTranslations("WalletPage");
  const { language } = useLocaleInfo();

  const faqUrl = `https://faq.goldenscent.com/${language}/faqs/wallet.html`;

  return (
    <div
      className={cn(
        "bg-bg-default flex w-full flex-row items-center justify-between px-5 lg:static lg:bg-transparent lg:px-0",
        "h-12.5 mt-21.25 fixed inset-x-0 bottom-0 lg:h-auto",
        className
      )}
    >
      <a
        className="text-text-info text-sm font-medium underline"
        href={faqUrl}
        rel="noopener noreferrer"
        target="_blank"
      >
        {t("howItWorks")}
      </a>
      <Link
        className="text-text-info text-sm font-medium underline"
        href="/terms-conditions"
      >
        {t("viewTerms")}
      </Link>
    </div>
  );
}
