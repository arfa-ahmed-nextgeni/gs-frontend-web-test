import { ReactNode } from "react";

import Image from "next/image";

import DownArrowIcon from "@/assets/icons/down-arrow-icon.svg";

export const CategoryMobileFilterSkeleton = ({
  icon,
  label,
}: {
  icon?: ReactNode;
  label: string;
}) => {
  return (
    <button
      className="bg-bg-default rounded-4xl gap-1.25 px-3.75 relative flex h-7 flex-shrink-0 flex-row items-center justify-center lg:hidden"
      type="button"
    >
      {icon}
      <span className="text-text-primary text-xs font-semibold">{label}</span>
      <Image
        alt="open"
        className="transition-default rotate-180"
        src={DownArrowIcon}
      />
    </button>
  );
};
