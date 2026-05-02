import Image from "next/image";

import { useTranslations } from "next-intl";

import ArrowRightGrayIcon from "@/assets/icons/arrow-right-gray-icon.svg";
import { OriginalProductDialog } from "@/components/dialogs/original-product-dialog";
import { OriginalProductDialogContent as OriginalProductDialogBody } from "@/components/dialogs/original-product-dialog-content";
import { cn } from "@/lib/utils";

import type { OriginalProductDialogContent as OriginalProductDialogContentData } from "@/lib/types/contentful/pdp-dialog-config";

export const ProductDetailsOriginalProduct = ({
  containerProps,
  content,
}: {
  containerProps?: React.ComponentProps<"div">;
  content?: OriginalProductDialogContentData;
}) => {
  const t = useTranslations("ProductPage.header");

  return (
    <OriginalProductDialog
      dialogContent={
        content ? <OriginalProductDialogBody content={content} /> : undefined
      }
      title={content?.title}
    >
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
