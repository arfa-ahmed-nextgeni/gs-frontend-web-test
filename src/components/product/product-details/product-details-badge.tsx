import Image, { StaticImageData } from "next/image";

import { cn } from "@/lib/utils";

export interface ProductDetailBadgeProps {
  bgColor?: string;
  children: React.ReactNode;
  className?: string;
  icon?: StaticImageData;
  iconAlt?: string;
}

export const ProductDetailBadge = ({
  bgColor = "#0000000D",
  children,
  className,
  icon,
  iconAlt = "",
}: ProductDetailBadgeProps) => {
  return (
    <div
      className={cn(
        "h-6.25 gap-1.25 flex flex-shrink-0 flex-row items-center rounded-[10px] px-2.5",
        className
      )}
      style={{ backgroundColor: bgColor }}
    >
      {icon && (
        <Image
          alt={iconAlt}
          className="size-3.5"
          height={14}
          src={icon}
          width={14}
        />
      )}
      {children}
    </div>
  );
};
