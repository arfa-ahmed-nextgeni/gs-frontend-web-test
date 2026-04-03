"use client";

import { useState } from "react";

import Image from "next/image";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import TabbyButtonImage from "@/assets/images/tabby-button-image.svg";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useLocaleInfo } from "@/hooks/i18n/use-locale-info";
import { trackTabbyViewLearnMore } from "@/lib/analytics/events";

export function TabbyPromoDialog({
  currency,
  price,
}: {
  currency: string;
  price: number;
}) {
  const { language } = useLocaleInfo();

  const [isLoading, setIsLoading] = useState(true);

  const iframeUrl = `https://checkout.tabby.ai/promos/product-page/installments/${language}/?price=${price}&currency=${currency}`;

  return (
    <Dialog
      onOpenChange={(open) => {
        setIsLoading(true);
        // Track tabby_view_learn_more when user clicks learn more in tabby payment cell
        if (open) {
          trackTabbyViewLearnMore();
        }
      }}
    >
      <DialogTrigger>
        <Image
          alt="tabby"
          className="h-6.25 w-13.75"
          height={25}
          src={TabbyButtonImage}
          width={55}
        />
        <VisuallyHidden>
          <iframe
            key={`tabby-promo-${price}`}
            loading="eager"
            src={iframeUrl}
          />
        </VisuallyHidden>
      </DialogTrigger>
      <DialogContent
        aria-describedby={undefined}
        className="h-[90dvh] w-[90dvw] overflow-y-auto p-0 lg:w-[60dvw]"
      >
        <VisuallyHidden>
          <DialogTitle>Tabby Promo</DialogTitle>
        </VisuallyHidden>
        {isLoading && (
          <div className="absolute flex h-full w-full items-center justify-center">
            <Spinner className="size-12.5" size={50} variant="dark" />
          </div>
        )}
        <iframe
          className="h-full w-full border-0"
          loading="eager"
          onError={() => setIsLoading(false)}
          onLoad={() => setIsLoading(false)}
          src={iframeUrl}
        />
      </DialogContent>
    </Dialog>
  );
}
