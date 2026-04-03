"use client";

import { useState } from "react";

import Image from "next/image";

import { useDirection } from "@radix-ui/react-direction";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import TamaraArButtonImage from "@/assets/images/tamara-ar-button-image.svg";
import TamaraButtonImage from "@/assets/images/tamara-button-image.svg";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useLocaleInfo } from "@/hooks/i18n/use-locale-info";
import { trackTamaraViewLearnMore } from "@/lib/analytics/events";
import { TAMARA_PUBLIC_KEY } from "@/lib/config/client-env";

export function TamaraPromoDialog({ price }: { price: number }) {
  const { language, region } = useLocaleInfo();

  const direction = useDirection();

  const [isLoading, setIsLoading] = useState(true);

  const iframeUrl = `https://cdn.tamara.co/widget-v2/tamara-widget.html?lang=${language}&public_key=${TAMARA_PUBLIC_KEY}&country=${region}&amount=${price}`;

  return (
    <Dialog
      onOpenChange={(open) => {
        setIsLoading(true);
        // Track tamara_view_learn_more when user clicks learn more in tamara payment cell
        if (open) {
          trackTamaraViewLearnMore();
        }
      }}
    >
      <DialogTrigger>
        <Image
          alt="tamara"
          className="h-6.25 w-16.25"
          height={25}
          src={direction === "rtl" ? TamaraArButtonImage : TamaraButtonImage}
          width={65}
        />
        <VisuallyHidden>
          <iframe
            key={`tamara-promo-${price}`}
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
          <DialogTitle>Tamara Promo</DialogTitle>
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
