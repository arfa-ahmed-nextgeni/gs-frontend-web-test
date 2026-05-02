import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS, type Document, MARKS } from "@contentful/rich-text-types";

import { SectionHeaderSeeAllLink } from "@/components/common/section-header/section-header-see-all-link";
import { serializeSectionHeaderClickOrigin } from "@/components/common/section-header/utils/section-header-click-origin-dataset";
import { Link } from "@/i18n/navigation";
import { SECTION_HEADER_CLICK_ORIGIN_DATA_ATTRIBUTE } from "@/lib/constants/tracking-data-attributes";
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

export const SectionHeader = ({
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
  const serializedClickOrigin = serializeSectionHeaderClickOrigin({
    lpColumn,
    lpExtra,
    lpRow,
  });
  const seeAllTrackingProps = serializedClickOrigin
    ? {
        [SECTION_HEADER_CLICK_ORIGIN_DATA_ATTRIBUTE]: serializedClickOrigin,
      }
    : {};

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
        {seeAllButton?.show &&
          (seeAllButton.mobileScroll !== undefined ? (
            <SectionHeaderSeeAllLink
              {...seeAllTrackingProps}
              className={cn(
                "text-text-tertiary text-[15px] font-normal",
                seeAllButton.className
              )}
              href={seeAllButton.href}
              lpColumn={lpColumn}
              lpExtra={lpExtra}
              lpRow={lpRow}
              mobileScroll={seeAllButton.mobileScroll}
              scroll={seeAllButton.scroll}
            >
              {seeAllButton.text}
            </SectionHeaderSeeAllLink>
          ) : (
            <Link
              {...seeAllTrackingProps}
              className={cn(
                "text-text-tertiary text-[15px] font-normal",
                seeAllButton.className
              )}
              href={seeAllButton.href}
              scroll={seeAllButton.scroll}
            >
              {seeAllButton.text}
            </Link>
          ))}
      </div>
    </div>
  );
};
