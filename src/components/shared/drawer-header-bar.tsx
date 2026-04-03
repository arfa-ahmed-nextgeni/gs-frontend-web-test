import Image from "next/image";

import BackIcon from "@/assets/icons/back-icon.svg";
import CloseIcon from "@/assets/icons/close-icon.svg";
import { DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

type DrawerHeaderBarProps = {
  backButtonAriaLabel?: string;
  className?: string;
  closeButtonAriaLabel?: string;
  onBack?: () => void;
  onClose: () => void;
  showBackButton?: boolean;
  title: string;
  titleClassName?: string;
};

export function DrawerHeaderBar({
  backButtonAriaLabel = "Back",
  className,
  closeButtonAriaLabel = "Close",
  onBack,
  onClose,
  showBackButton = false,
  title,
  titleClassName,
}: DrawerHeaderBarProps) {
  return (
    <DrawerHeader
      className={cn(
        "bg-bg-default h-15 lg:pt-7.5 relative flex shrink-0 flex-row items-center justify-between px-5 lg:h-16 lg:flex-row-reverse lg:justify-end lg:gap-5",
        className
      )}
    >
      <DrawerTitle
        className={cn(
          "text-text-primary text-center text-xl font-medium leading-none",
          titleClassName
        )}
      >
        {title}
      </DrawerTitle>

      {showBackButton && onBack ? (
        <button aria-label={backButtonAriaLabel} onClick={onBack}>
          <Image alt="Back" className="rtl:rotate-180" src={BackIcon} />
        </button>
      ) : (
        <button aria-label={closeButtonAriaLabel} onClick={onClose}>
          <Image alt="Close" src={CloseIcon} />
        </button>
      )}
    </DrawerHeader>
  );
}
