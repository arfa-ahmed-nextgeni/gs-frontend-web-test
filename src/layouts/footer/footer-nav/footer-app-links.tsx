import { ContentfulImage } from "@/components/shared/contentful-image";
import { Link } from "@/i18n/navigation";
import { WebsiteFooterLinks } from "@/lib/models/website-footer";

type FooterAppSection = WebsiteFooterLinks["appSection"];

export const FooterAppLinks = ({
  appSection,
}: {
  appSection: FooterAppSection;
}) => {
  return (
    <div className="border-border-base order-last col-span-1 flex flex-col border-t pt-6 lg:order-first lg:border-0 lg:pt-0">
      <div className="text-text-primary text-base font-extrabold">
        {appSection.title}
      </div>
      <div className="flex-1/1 mt-6 flex flex-col justify-between gap-2.5">
        <div className="flex flex-row gap-4">
          {appSection.appLinks.map((appLink, index) => (
            <Link
              href={appLink.url}
              key={`app-link-${index}`}
              rel="noopener noreferrer"
              target="_blank"
              title={appLink.label}
            >
              <ContentfulImage
                alt={appLink.label}
                height={40}
                src={appLink.imageUrl}
                width={120}
              />
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5 sm:mt-4">
          {appSection.paymentMethods.map((paymentMethod, idx) => (
            <ContentfulImage
              alt={paymentMethod.label}
              className="w-9.25 h-5"
              height={20}
              key={idx}
              src={paymentMethod.imageUrl}
              width={37}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
