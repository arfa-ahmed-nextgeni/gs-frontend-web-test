import { ComponentProps } from "react";

import Image from "next/image";

import { useTranslations } from "next-intl";

import TrashIcon from "@/assets/icons/trash-icon.svg";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const DeleteAccountButton = ({
  className,
  ...props
}: ComponentProps<typeof Button>) => {
  const t = useTranslations("AccountPage.deleteAccountButton");

  return (
    <Button
      {...props}
      className={cn(
        "h-20.5 bg-btn-bg-soft -mt-2.5 rounded-xl px-5",
        "bg-[radial-gradient(212px_circle_at_-42px,#FFA50033_0%,#FE500033_0%,transparent_100%)]",
        "rtl:bg-[radial-gradient(212px_circle_at_calc(100%+42px),#FFA50033_0%,#FE500033_0%,transparent_100%)]",
        className
      )}
    >
      <div className="gap-3.75 flex flex-row">
        <Image
          alt=""
          className="aspect-square"
          height={20}
          src={TrashIcon}
          unoptimized
          width={20}
        />
        <div className="flex flex-col items-start gap-1">
          <span className="text-text-danger text-base font-semibold">
            {t("title")}
          </span>
          <span className="text-text-secondary text-sm font-medium">
            {t("description")}
          </span>
        </div>
      </div>
    </Button>
  );
};
