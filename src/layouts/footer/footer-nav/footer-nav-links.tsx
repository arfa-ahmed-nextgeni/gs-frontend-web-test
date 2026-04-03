"use client";

import Image from "next/image";

import ArrowDownIcon from "@/assets/icons/arrow-down.svg";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "@/i18n/navigation";
import { trackFaqPageOpen } from "@/lib/analytics/events";

const isFaqLink = (link: { url: string }) =>
  typeof link.url === "string" && link.url.includes("faq.");

const NavLinks = ({
  links,
  text,
  verifiedBadge,
}: {
  links?: { label: string; url: string }[];
  text?: string[];
  verifiedBadge?: { imageUrl: string; label: string; url: string };
}) => {
  return (
    <>
      {links && (
        <ul className="mt-2 flex flex-col gap-2.5">
          {links.map((link, idx) => (
            <li key={idx}>
              <a
                className="transition-default text-text-secondary hover:text-text-brand focus:text-text-brand active:text-text-brand text-[13px] font-medium hover:font-semibold hover:underline focus:font-semibold focus:underline focus:outline-none focus:ring-0 active:font-semibold active:underline"
                href={link.url}
                onClick={() => {
                  try {
                    if (isFaqLink(link)) {
                      trackFaqPageOpen({ section: link.label });
                    }
                  } catch (e) {
                    // don't break navigation on analytics errors
                    console.error("FAQ analytics error:", e);
                  }
                }}
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
                <Image
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

export const FooterNavLinks = ({ data }: { data: any }) => {
  const { links, text, title, verifiedBadge } = data;

  return (
    <>
      <div className="col-span-1 lg:hidden">
        <Accordion className="w-full" collapsible type="single">
          <AccordionItem value={title}>
            <AccordionTrigger className="group flex w-full items-center justify-between p-0 hover:no-underline [&>svg]:hidden">
              <div className="text-text-primary text-base font-extrabold">
                {title}
              </div>
              <Image
                alt="arrow down"
                className="transition-default group-data-[state=open]:rotate-180"
                src={ArrowDownIcon}
              />
            </AccordionTrigger>
            <AccordionContent className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
              <NavLinks
                links={links}
                text={text}
                verifiedBadge={verifiedBadge}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      <div className="col-span-1 hidden lg:block">
        <div className="text-text-primary text-base font-extrabold">
          {title}
        </div>
        <NavLinks links={links} text={text} verifiedBadge={verifiedBadge} />
      </div>
    </>
  );
};
