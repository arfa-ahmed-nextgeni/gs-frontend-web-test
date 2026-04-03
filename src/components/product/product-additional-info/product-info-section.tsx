import type { PropsWithChildren } from "react";

import Image from "next/image";

import { useTranslations } from "next-intl";

import MinusIcon from "@/assets/icons/minus-icon.svg";
import PlusIcon from "@/assets/icons/plus-icon.svg";
import { ProductInfoSectionContent } from "@/components/product/product-additional-info/product-info-section-content";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const MOBILE_COLLAPSE_TEXT_LENGTH_THRESHOLD = 260;

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
  const shouldAllowMobileCollapse = shouldEnableMobileCollapse(paragraphs);

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
        {children ?? (
          <ProductInfoSectionContent
            paragraphs={paragraphs}
            shouldAllowMobileCollapse={shouldAllowMobileCollapse}
            showLessLabel={t("showLess")}
            showMoreLabel={t("seeMore")}
          />
        )}
      </AccordionContent>
    </AccordionItem>
  );
};

function shouldEnableMobileCollapse(paragraphs: string[]) {
  return paragraphs.some((paragraph) => {
    const plainText = paragraph
      .replaceAll(/<[^>]*>/g, " ")
      .replaceAll(/\s+/g, " ")
      .trim();

    return plainText.length > MOBILE_COLLAPSE_TEXT_LENGTH_THRESHOLD;
  });
}
