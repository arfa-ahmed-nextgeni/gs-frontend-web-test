import Image from "next/image";

import { useTranslations } from "next-intl";

import ArrowRightGrayIcon from "@/assets/icons/arrow-right-gray-icon.svg";
import { OriginalProductDialog } from "@/components/dialogs/original-product-dialog";
import { cn } from "@/lib/utils";

export const ProductDetailsOriginalProduct = ({
  containerProps,
}: {
  containerProps?: React.ComponentProps<"div">;
}) => {
  const t = useTranslations("ProductPage.header");

  return (
    <OriginalProductDialog>
      <div
        className={cn(
          "gap-1.25 flex flex-row items-center",
          containerProps?.className
        )}
      >
        <p className="text-text-secondary text-[10px] font-medium">
          {t("originalProduct")}
        </p>
        <Image
          alt=""
          className="size-2 rtl:rotate-180"
          height={8}
          src={ArrowRightGrayIcon}
          width={8}
        />
      </div>
    </OriginalProductDialog>
  );
};
