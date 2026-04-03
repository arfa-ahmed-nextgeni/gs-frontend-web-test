"use client";

import type { ComponentProps, ReactNode } from "react";

import { serializeSectionHeaderClickOrigin } from "@/components/common/section-header/utils/section-header-click-origin-dataset";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { Link } from "@/i18n/navigation";
import { SECTION_HEADER_CLICK_ORIGIN_DATA_ATTRIBUTE } from "@/lib/constants/tracking-data-attributes";

type SectionHeaderSeeAllLinkProps = {
  children: ReactNode;
  lpColumn?: number;
  lpExtra?: Record<string, unknown>;
  lpRow?: number;
  mobileScroll?: boolean;
  scroll?: boolean;
} & Omit<ComponentProps<typeof Link>, "scroll">;

export function SectionHeaderSeeAllLink({
  children,
  lpColumn,
  lpExtra,
  lpRow,
  mobileScroll,
  scroll,
  ...linkProps
}: SectionHeaderSeeAllLinkProps) {
  const isMobile = useIsMobile();
  const serializedClickOrigin = serializeSectionHeaderClickOrigin({
    lpColumn,
    lpExtra,
    lpRow,
  });

  return (
    <Link
      {...linkProps}
      {...(serializedClickOrigin
        ? {
            [SECTION_HEADER_CLICK_ORIGIN_DATA_ATTRIBUTE]: serializedClickOrigin,
          }
        : {})}
      scroll={mobileScroll && isMobile ? true : scroll}
    >
      {children}
    </Link>
  );
}
