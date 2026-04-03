import Image from "next/image";

import { getTranslations } from "next-intl/server";

import ArrowRightIcon from "@/assets/icons/arrow-right.svg";

import {
  CustomerServiceCallLink,
  CustomerServiceEmailLink,
  CustomerServiceWhatsappLink,
} from "./customer-service-tracked-link";

import type { WebsiteFooterContactAndSocialLinks } from "@/lib/models/website-footer";

export async function CustomerServiceContent({
  contactSection,
}: {
  contactSection?: WebsiteFooterContactAndSocialLinks["contactSection"];
}) {
  const t = await getTranslations("CustomerServiceActionSheet");

  if (!contactSection?.contacts?.length) {
    return null;
  }

  return (
    <>
      <p className="text-text-primary whitespace-pre-line text-xl font-medium">
        {t("description")}
      </p>
      <div className="flex flex-col gap-5">
        <p className="text-text-secondary text-sm font-medium">
          {t("whatsAppUs")}
        </p>
        <div className="flex flex-col gap-2.5">
          {contactSection.contacts
            .filter(({ type }) => type === "whatsapp")
            .map(({ iconUrl, number, type }, index) => (
              <CustomerServiceWhatsappLink
                className="h-12.5 bg-bg-surface flex flex-row items-center justify-between rounded-xl px-5"
                key={`${type}-${index}`}
                phoneNumber={number ?? ""}
              >
                <div className="flex flex-row items-center gap-2.5">
                  <Image
                    alt="WhatsApp"
                    className="size-5"
                    height={20}
                    src={iconUrl}
                    width={20}
                  />
                  <p className="text-text-primary text-lg font-normal">
                    {number}
                  </p>
                </div>
                <Image
                  alt=""
                  className="aspect-square size-5 rtl:rotate-180"
                  height={20}
                  src={ArrowRightIcon}
                  unoptimized
                  width={20}
                />
              </CustomerServiceWhatsappLink>
            ))}
        </div>
      </div>
      <div className="flex flex-col gap-5">
        <p className="text-text-secondary text-sm font-medium">{t("callUs")}</p>
        <div className="flex flex-col gap-2.5">
          {contactSection.contacts
            .filter(({ type }) => type === "phone")
            .map(({ country, iconUrl, number, type }, index) => (
              <CustomerServiceCallLink
                className="h-12.5 bg-bg-surface flex flex-row items-center justify-between rounded-xl px-5"
                key={`${type}-${index}`}
                phoneNumber={number ?? ""}
              >
                <div className="flex flex-row items-center gap-2.5">
                  <Image
                    alt={country ?? ""}
                    className="size-5"
                    height={20}
                    src={iconUrl}
                    width={20}
                  />
                  <p className="text-text-primary text-lg font-normal">
                    {number}
                  </p>
                </div>
                <Image
                  alt=""
                  className="aspect-square size-5 rtl:rotate-180"
                  height={20}
                  src={ArrowRightIcon}
                  unoptimized
                  width={20}
                />
              </CustomerServiceCallLink>
            ))}
        </div>
      </div>
      <div className="flex flex-col gap-5">
        <p className="text-text-secondary text-sm font-medium">
          {t("emailUs")}
        </p>
        <div className="flex flex-col gap-2.5">
          {contactSection.contacts
            .filter(({ type }) => type === "email")
            .map(({ address, iconUrl, type }, index) => (
              <CustomerServiceEmailLink
                className="h-12.5 bg-bg-surface flex flex-row items-center justify-between rounded-xl px-5"
                email={address ?? ""}
                key={`${type}-${index}`}
              >
                <div className="flex flex-row items-center gap-2.5">
                  <Image
                    alt="Email"
                    className="size-5"
                    height={20}
                    src={iconUrl}
                    width={20}
                  />
                  <p className="text-text-primary text-lg font-normal">
                    {address}
                  </p>
                </div>
                <Image
                  alt=""
                  className="aspect-square size-5 rtl:rotate-180"
                  height={20}
                  src={ArrowRightIcon}
                  unoptimized
                  width={20}
                />
              </CustomerServiceEmailLink>
            ))}
        </div>
      </div>
    </>
  );
}
