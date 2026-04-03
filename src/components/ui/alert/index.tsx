import Image from "next/image";

import { cva, type VariantProps } from "class-variance-authority";

import CloseIcon from "@/assets/icons/close-icon.svg";
import InformativeIcon from "@/assets/icons/informative-icon.svg";
import { AlertContainer } from "@/components/ui/alert/alert-container";
import { AlertDismissButton } from "@/components/ui/alert/alert-dismiss-button";
import { AlertTitle } from "@/components/ui/alert/alert-title";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-xl min-h-12.5 px-4 py-3 text-sm flex flex-row gap-5 justify-between items-center",
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default:
          "bg-bg-soft bg-[radial-gradient(212px_circle_at_-42px,#b2d7ff4d_0%,#B2D7FF4D_0%,transparent_100%)] rtl:bg-[radial-gradient(212px_circle_at_calc(100%+42px),#b2d7ff4d_0%,#B2D7FF4D_0%,transparent_100%)]",
      },
    },
  }
);

export const Alert = ({
  className,
  dismissable = true,
  title,
  variant,
  ...props
}: { dismissable?: boolean; title: string } & React.ComponentProps<"div"> &
  VariantProps<typeof alertVariants>) => {
  return (
    <AlertContainer>
      <div
        className={cn(alertVariants({ variant }), className)}
        data-slot="alert"
        role="alert"
        {...props}
      >
        <div className="flex flex-row items-center gap-5">
          <Image
            alt=""
            height={30}
            src={InformativeIcon}
            unoptimized
            width={30}
          />
          <AlertTitle>{title}</AlertTitle>
        </div>
        {dismissable && (
          <AlertDismissButton>
            <Image
              alt="close"
              height={20}
              src={CloseIcon}
              unoptimized
              width={20}
            />
          </AlertDismissButton>
        )}
      </div>
    </AlertContainer>
  );
};
