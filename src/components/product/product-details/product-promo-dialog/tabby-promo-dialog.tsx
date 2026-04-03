"use client";

import { useState } from "react";

import dynamic from "next/dynamic";
import Image from "next/image";

import TabbyButtonImage from "@/assets/images/tabby-button-image.svg";
import { ProductPromoDialogLoadingContent } from "@/components/product/product-details/product-promo-dialog/product-promo-dialog-loading-content";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useLocaleInfo } from "@/hooks/i18n/use-locale-info";
import { trackTabbyViewLearnMore } from "@/lib/analytics/events";

const loadProductPromoDialogContent = () =>
  import("@/components/product/product-details/product-promo-dialog/product-promo-dialog-content");

const ProductPromoDialogContent = dynamic(
  () =>
    loadProductPromoDialogContent().then(
      (mod) => mod.ProductPromoDialogContent
    ),
  {
    loading: () => <ProductPromoDialogLoadingContent title="Tabby Promo" />,
  }
);

export function TabbyPromoDialog({
  currency,
  price,
}: {
  currency: string;
  price: number;
}) {
  const { language } = useLocaleInfo();

  const [isOpen, setIsOpen] = useState(false);

  const iframeUrl = `https://checkout.tabby.ai/promos/product-page/installments/${language}/?price=${price}&currency=${currency}`;

  return (
    <Dialog
      onOpenChange={(open) => {
        setIsOpen(open);

        // Track tabby_view_learn_more when user clicks learn more in tabby payment cell
        if (open) {
          trackTabbyViewLearnMore();
        }
      }}
      open={isOpen}
    >
      <DialogTrigger
        onFocus={() => {
          void loadProductPromoDialogContent();
        }}
        onPointerEnter={() => {
          void loadProductPromoDialogContent();
        }}
        onTouchStart={() => {
          void loadProductPromoDialogContent();
        }}
      >
        <Image
          alt="tabby"
          className="h-6.25 w-13.75"
          height={25}
          src={TabbyButtonImage}
          width={55}
        />
      </DialogTrigger>
      {isOpen ? (
        <ProductPromoDialogContent iframeUrl={iframeUrl} title="Tabby Promo" />
      ) : null}
    </Dialog>
  );
}
