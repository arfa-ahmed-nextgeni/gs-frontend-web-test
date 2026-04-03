import { StaticImport } from "next/dist/shared/lib/get-img-props";
import Image from "next/image";

import { cn } from "@/lib/utils";

interface AddPickupPointMapControlButtonProps {
  alt: string;
  ariaLabel: string;
  icon: StaticImport | string;
  onClick: () => void;
}

export const AddPickupPointMapControlButton = ({
  alt,
  ariaLabel,
  icon,
  onClick,
}: AddPickupPointMapControlButtonProps) => {
  return (
    <button
      aria-label={ariaLabel}
      className={cn(
        "size-7.5 border-border-base bg-bg-default box-border flex items-center justify-center rounded-lg border",
        "transition-default hover:bg-bg-surface"
      )}
      onClick={onClick}
      type="button"
    >
      <Image alt={alt} className="size-3.5" height={14} src={icon} width={14} />
    </button>
  );
};
