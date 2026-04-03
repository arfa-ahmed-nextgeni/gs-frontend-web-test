import Image from "next/image";

import ArrowDownIcon from "@/assets/icons/arrow-down.svg";
import { ContentfulImage } from "@/components/shared/contentful-image";
import { Link } from "@/i18n/navigation";
import { FAQ_TRACKING_DATA_ATTRIBUTE } from "@/lib/constants/tracking-data-attributes";
import { WebsiteFooterLinks } from "@/lib/models/website-footer";

type FooterNavSectionItem = WebsiteFooterLinks["footerSections"][number];
type FooterVerifiedBadge = FooterNavSectionItem["verifiedBadge"];

const isFaqLink = (link: { url: string }) =>
  typeof link.url === "string" && link.url.includes("faq.");

const NavLinks = ({
  links,
  text,
  verifiedBadge,
}: {
  links?: FooterNavSectionItem["links"];
  text?: FooterNavSectionItem["text"];
  verifiedBadge?: FooterVerifiedBadge;
}) => {
  return (
    <>
      {links && (
        <ul className="mt-2 flex flex-col gap-2.5">
          {links.map((link, idx) => (
            <li key={idx}>
              <a
                className="transition-default text-text-secondary hover:text-text-brand focus:text-text-brand active:text-text-brand text-[13px] font-medium hover:font-semibold hover:underline focus:font-semibold focus:underline focus:outline-none focus:ring-0 active:font-semibold active:underline"
                {...(isFaqLink(link)
                  ? {
                      [FAQ_TRACKING_DATA_ATTRIBUTE]: link.label,
                    }
                  : {})}
                href={link.url}
                rel={isFaqLink(link) ? "noopener noreferrer" : undefined}
                target={isFaqLink(link) ? "_blank" : undefined}
                title={link.label}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
      {text && (
        <div className="mt-4 flex flex-col gap-2.5">
          {text.map((t, idx) => (
            <div
              className="text-text-secondary whitespace-nowrap text-[13px] font-medium"
              key={idx}
            >
              {t}
            </div>
          ))}
          {verifiedBadge && (
            <div className="mt-1 flex items-end gap-2">
              <Link
                href={verifiedBadge.url}
                rel="noopener noreferrer"
                target="_blank"
                title={verifiedBadge.label}
              >
                <ContentfulImage
                  alt={verifiedBadge.label}
                  height={50}
                  src={verifiedBadge.imageUrl}
                  width={70}
                />
              </Link>
              <Link
                href={verifiedBadge.url}
                rel="noopener noreferrer"
                target="_blank"
                title={verifiedBadge.label}
              >
                <span className="text-text-primary whitespace-nowrap text-base font-extrabold">
                  {verifiedBadge.label}
                </span>
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export const FooterNavLinks = ({ data }: { data: FooterNavSectionItem }) => {
  const { links, text, title, verifiedBadge } = data;

  return (
    <>
      <details className="group col-span-1 lg:hidden [&_summary::-webkit-details-marker]:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-0">
          <div className="text-text-primary text-base font-extrabold">
            {title}
          </div>
          <Image
            alt="arrow down"
            className="transition-default group-open:rotate-180"
            src={ArrowDownIcon}
          />
        </summary>
        <div className="pt-1">
          <NavLinks links={links} text={text} verifiedBadge={verifiedBadge} />
        </div>
      </details>
      <div className="col-span-1 hidden lg:block">
        <div className="text-text-primary text-base font-extrabold">
          {title}
        </div>
        <NavLinks links={links} text={text} verifiedBadge={verifiedBadge} />
      </div>
    </>
  );
};
