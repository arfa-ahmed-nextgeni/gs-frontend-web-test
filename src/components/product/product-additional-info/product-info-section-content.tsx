"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

const MOBILE_COLLAPSED_MAX_HEIGHT_CLASS = "max-h-24";

export const ProductInfoSectionContent = ({
  paragraphs,
  shouldAllowMobileCollapse,
  showLessLabel,
  showMoreLabel,
}: {
  paragraphs: string[];
  shouldAllowMobileCollapse: boolean;
  showLessLabel: string;
  showMoreLabel: string;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <div
        className={cn("flex flex-col gap-2.5 overflow-hidden", {
          "lg:max-h-none": shouldAllowMobileCollapse,
          [MOBILE_COLLAPSED_MAX_HEIGHT_CLASS]:
            shouldAllowMobileCollapse && !isExpanded,
        })}
      >
        {paragraphs.map((text, index) => (
          <div
            dangerouslySetInnerHTML={{ __html: text }}
            key={`paragraph-${index}`}
          />
        ))}
      </div>
      {shouldAllowMobileCollapse ? (
        <button
          className="text-text-info mt-2 lg:hidden"
          onClick={() => setIsExpanded((prevState) => !prevState)}
        >
          {isExpanded ? showLessLabel : showMoreLabel}
        </button>
      ) : null}
    </>
  );
};
