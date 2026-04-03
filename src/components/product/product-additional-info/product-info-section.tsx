"use client";

import React, { PropsWithChildren, useState } from "react";

import Image from "next/image";

import { useTranslations } from "next-intl";

import MinusIcon from "@/assets/icons/minus-icon.svg";
import PlusIcon from "@/assets/icons/plus-icon.svg";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useIsMobile } from "@/hooks/use-is-mobile";

export const ProductInfoSection = ({
  children,
  paragraphs,
  title,
  value,
}: PropsWithChildren<{
  paragraphs: string[];
  title: string;
  value: string;
}>) => {
  const t = useTranslations("ProductPage.additionalInfo");

  const isMobile = useIsMobile();

  const [isExpanded, setIsExpanded] = useState(false);

  const visibleParagraphs =
    isMobile && !isExpanded && paragraphs.length > 2
      ? paragraphs.slice(0, 2)
      : paragraphs;

  return (
    <AccordionItem className="border-border-base" value={value}>
      <AccordionTrigger className="text-text-primary h-12.5 group flex items-center justify-between px-4 hover:no-underline [&>svg]:hidden">
        <span className="text-text-primary text-xl font-medium">{title}</span>
        <Image
          alt="collapse"
          className="transition-default group-data-[state=open]:block group-data-[state=closed]:hidden"
          src={MinusIcon}
        />
        <Image
          alt="expand"
          className="transition-default group-data-[state=closed]:block group-data-[state=open]:hidden"
          src={PlusIcon}
        />
      </AccordionTrigger>
      <AccordionContent className="border-border-base text-text-primary border-t p-5 text-sm font-normal">
        {children ||
          visibleParagraphs.map((text, index) => (
            <div key={`paragraph-${index}`}>
              <p dangerouslySetInnerHTML={{ __html: text }} />
              {isMobile &&
                paragraphs.length > 2 &&
                index === visibleParagraphs.length - 1 && (
                  <>
                    {isExpanded ? " " : ".."}
                    <button
                      className="text-text-info"
                      onClick={() => setIsExpanded(!isExpanded)}
                    >
                      {isExpanded ? t("showLess") : t("seeMore")}
                    </button>
                  </>
                )}
            </div>
          ))}
      </AccordionContent>
    </AccordionItem>
  );
};
