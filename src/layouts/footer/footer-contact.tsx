import Container from "@/components/shared/container";
import { ContentfulImage } from "@/components/shared/contentful-image";
import {
  CustomerServiceCallLink,
  CustomerServiceEmailLink,
  CustomerServiceWhatsappLink,
} from "@/components/shared/customer-service/customer-service-tracked-link";
import { Link } from "@/i18n/navigation";
import { WebsiteFooterContactAndSocialLinks } from "@/lib/models/website-footer";

type ContactSection = WebsiteFooterContactAndSocialLinks["contactSection"];
type ContactSectionItem = ContactSection["contacts"][number];
type SocialSection = WebsiteFooterContactAndSocialLinks["socialSection"];
type SocialSectionItem = SocialSection["links"][number];

export const FooterContact = ({
  contactSection,
  socialSection,
}: {
  contactSection: ContactSection;
  socialSection: SocialSection;
}) => {
  return (
    <Container
      className="border-border-base border-t-border-divider bg-bg-default border-t lg:bg-transparent"
      variant="FullWidth"
    >
      <Container className="py-4.5 flex flex-col justify-between lg:flex-row lg:py-1">
        <div className="flex flex-row justify-between gap-4 lg:items-center lg:gap-12">
          <div className="flex flex-row items-center gap-3">
            <ContentfulImage
              alt="Headset"
              className="h-5.5 w-6 flex-shrink-0"
              height={22}
              src={contactSection.mainIconUrl}
              width={24}
            />
            <div className="flex flex-col gap-2 lg:gap-0">
              {contactSection.contacts
                .filter(
                  (
                    contact
                  ): contact is { number: string } & ContactSectionItem => {
                    return contact.type === "phone" && Boolean(contact.number);
                  }
                )
                .map((contact, idx) => (
                  <div
                    className="flex items-center gap-2 whitespace-nowrap"
                    key={idx}
                  >
                    <ContentfulImage
                      alt={contact.country ?? ""}
                      className="h-3.75 w-5 flex-shrink-0"
                      height={15}
                      src={contact.iconUrl}
                      width={20}
                    />
                    <CustomerServiceCallLink
                      className="text-text-muted flex text-[13px] font-medium rtl:flex-row-reverse"
                      phoneNumber={contact.number}
                    >
                      {contact.number}
                    </CustomerServiceCallLink>
                  </div>
                ))}
            </div>
          </div>
          <div className="flex flex-col gap-2 lg:flex-row lg:gap-16">
            {contactSection.contacts
              .filter(
                (
                  contact
                ): contact is { number: string } & ContactSectionItem => {
                  return contact.type === "whatsapp" && Boolean(contact.number);
                }
              )
              .map((contact, idx) => (
                <div
                  className="flex items-center gap-2 whitespace-nowrap"
                  key={idx}
                >
                  <ContentfulImage
                    alt="WhatsApp"
                    className="size-5 flex-shrink-0"
                    height={20}
                    src={contact.iconUrl}
                    width={20}
                  />
                  <CustomerServiceWhatsappLink
                    className="text-text-muted text-[13px] font-medium"
                    phoneNumber={contact.number}
                  >
                    {contact.number}
                  </CustomerServiceWhatsappLink>
                </div>
              ))}
            {contactSection.contacts
              .filter(
                (
                  contact
                ): contact is { address: string } & ContactSectionItem => {
                  return contact.type === "email" && Boolean(contact.address);
                }
              )
              .map((contact, idx) => (
                <div
                  className="flex items-center gap-2 whitespace-nowrap"
                  key={idx}
                >
                  <ContentfulImage
                    alt="Email"
                    className="size-5.5 aspect-square flex-shrink-0"
                    height={22}
                    src={contact.iconUrl}
                    width={22}
                  />
                  <CustomerServiceEmailLink
                    className="text-text-muted text-[13px] font-medium"
                    email={contact.address}
                  >
                    {contact.address}
                  </CustomerServiceEmailLink>
                </div>
              ))}
          </div>
        </div>

        <div className="hidden flex-row items-center gap-5 py-4 lg:flex">
          <span className="text-text-primary mr-2 text-base font-medium">
            {socialSection.title}
          </span>
          <div className="gap-3.75 flex flex-row items-center">
            {socialSection.links.map((link: SocialSectionItem, idx) => (
              <Link
                className="group relative"
                href={link.url}
                key={idx}
                rel="noopener noreferrer"
                target="_blank"
                title={link.label}
              >
                <ContentfulImage
                  alt={link.label}
                  className="transition-default visible aspect-square size-5 opacity-100 group-hover:invisible group-hover:opacity-0 group-focus:invisible group-focus:opacity-0"
                  height={20}
                  src={link.iconUrl}
                  width={20}
                />
                <ContentfulImage
                  alt={link.label}
                  className="transition-default invisible absolute aspect-square size-5 -translate-y-full opacity-0 group-hover:visible group-hover:opacity-100 group-focus:visible group-focus:opacity-100"
                  height={20}
                  src={link.activeIcon ?? link.iconUrl}
                  width={20}
                />
              </Link>
            ))}
          </div>
        </div>
      </Container>
      <Container className="border-border-base bg-bg-default flex flex-row items-center justify-between gap-6 border-t py-5 lg:hidden lg:bg-transparent">
        <span className="text-text-primary mr-2 text-base font-medium">
          {socialSection.title}
        </span>
        <div className="flex flex-row items-center gap-4">
          {socialSection.links.map((link: SocialSectionItem, idx) => (
            <Link
              className="group relative inline-flex h-5 w-5 items-center justify-center"
              href={link.url}
              key={idx}
            >
              <ContentfulImage
                alt={link.label}
                className="transition-default visible aspect-square size-5 opacity-100 group-hover:invisible group-hover:opacity-0 group-focus:invisible group-focus:opacity-0"
                height={20}
                src={link.iconUrl}
                width={20}
              />
              <ContentfulImage
                alt={link.label}
                className="transition-default invisible absolute aspect-square size-5 opacity-0 group-hover:visible group-hover:opacity-100 group-focus:visible group-focus:opacity-100"
                height={20}
                src={link.activeIcon ?? link.iconUrl}
                width={20}
              />
            </Link>
          ))}
        </div>
      </Container>
    </Container>
  );
};
