"use client";

import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS, Document, MARKS } from "@contentful/rich-text-types";

import { useIsMobile } from "@/hooks/use-is-mobile";
import { Link } from "@/i18n/navigation";
import { clickOriginTrackingManager } from "@/lib/analytics/click-origin-tracking-manager";
import { cn } from "@/lib/utils";

export type SectionHeaderProps = {
  className?: string;
  clearButton?: ClearButtonConfig;
  headingPosition?: string;
  lpColumn?: number;
  lpExtra?: Record<string, unknown>;
  lpRow?: number;
  richTitle?: Document;
  sectionHeading?: React.ReactNode | string;
  sectionHeadingClassName?: string;
  sectionSubHeading?: string;
  seeAllButton?: SeeAllButtonConfig;
};

type ClearButtonConfig = {
  className?: string;
  show: boolean;
  text: string;
};

type SeeAllButtonConfig = {
  className?: string;
  href: string;
  mobileScroll?: boolean;
  scroll?: boolean;
  show: boolean;
  text: string;
};

const SectionHeader = ({
  className,
  clearButton,
  lpColumn,
  lpExtra,
  lpRow,
  richTitle,
  sectionHeading,
  sectionHeadingClassName,
  seeAllButton,
}: SectionHeaderProps) => {
  const isMobile = useIsMobile();

  const handleSeeAllClick = () => {
    // Track LP click origin if row and column are available (landing page/home page)
    if (lpRow !== undefined && lpColumn !== undefined) {
      clickOriginTrackingManager.setClickOrigin({
        column: lpColumn,
        extra: lpExtra,
        origin: "lp",
        row: lpRow,
      });
    }
  };

  return (
    <div
      className={cn(
        "relative flex flex-row items-center justify-between",
        className
      )}
    >
      <div
        className={cn(
          "text-text-primary whitespace-nowrap text-[25px] font-normal rtl:font-semibold",
          sectionHeadingClassName
        )}
      >
        {richTitle
          ? documentToReactComponents(richTitle, {
              renderMark: {
                [MARKS.BOLD]: (text) => (
                  <h2 className="inline font-semibold rtl:font-bold">{text}</h2>
                ),
              },
              renderNode: {
                // SEO: Convert h1 to h2 to ensure only one h1 per page
                [BLOCKS.HEADING_1]: (_node, children) => (
                  <h2 className="inline font-semibold rtl:font-bold">
                    {children}
                  </h2>
                ),
                [BLOCKS.PARAGRAPH]: (_node, children) => <>{children}</>,
              },
            })
          : sectionHeading}
      </div>
      <div className="flex flex-row items-center gap-2 lg:gap-14">
        {clearButton?.show && (
          <button
            className={cn(
              "text-text-error text-base font-normal",
              clearButton.className
            )}
          >
            {clearButton.text}
          </button>
        )}
        {seeAllButton?.show && (
          <Link
            className={cn(
              "text-text-tertiary text-[15px] font-normal",
              seeAllButton.className
            )}
            href={seeAllButton.href || ""}
            onClick={handleSeeAllClick}
            prefetch={false}
            scroll={
              seeAllButton.mobileScroll && isMobile ? true : seeAllButton.scroll
            }
          >
            {seeAllButton.text}
          </Link>
        )}
      </div>
    </div>
  );
};

export default SectionHeader;
