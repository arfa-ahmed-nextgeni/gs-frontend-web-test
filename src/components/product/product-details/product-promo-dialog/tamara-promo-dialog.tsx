"use client";

import { useState } from "react";

import dynamic from "next/dynamic";
import Image from "next/image";

import { useDirection } from "@radix-ui/react-direction";

import TamaraArButtonImage from "@/assets/images/tamara-ar-button-image.svg";
import TamaraButtonImage from "@/assets/images/tamara-button-image.svg";
import { ProductPromoDialogLoadingContent } from "@/components/product/product-details/product-promo-dialog/product-promo-dialog-loading-content";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useLocaleInfo } from "@/hooks/i18n/use-locale-info";
import { trackTamaraViewLearnMore } from "@/lib/analytics/events";
import { TAMARA_PUBLIC_KEY } from "@/lib/config/client-env";

const loadProductPromoDialogContent = () =>
  import("@/components/product/product-details/product-promo-dialog/product-promo-dialog-content");

const ProductPromoDialogContent = dynamic(
  () =>
    loadProductPromoDialogContent().then(
      (mod) => mod.ProductPromoDialogContent
    ),
  {
    loading: () => <ProductPromoDialogLoadingContent title="Tamara Promo" />,
  }
);

export function TamaraPromoDialog({ price }: { price: number }) {
  const { language, region } = useLocaleInfo();

  const direction = useDirection();

  const [isOpen, setIsOpen] = useState(false);

  const iframeUrl = `https://cdn.tamara.co/widget-v2/tamara-widget.html?lang=${language}&public_key=${TAMARA_PUBLIC_KEY}&country=${region}&amount=${price}`;

  return (
    <Dialog
      onOpenChange={(open) => {
        setIsOpen(open);

        // Track tamara_view_learn_more when user clicks learn more in tamara payment cell
        if (open) {
          trackTamaraViewLearnMore();
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
          alt="tamara"
          className="h-6.25 w-16.25"
          height={25}
          src={direction === "rtl" ? TamaraArButtonImage : TamaraButtonImage}
          width={65}
        />
      </DialogTrigger>
      {isOpen ? (
        <ProductPromoDialogContent iframeUrl={iframeUrl} title="Tamara Promo" />
      ) : null}
    </Dialog>
  );
}
