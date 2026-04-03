"use client";

import Image from "next/image";

import { useTranslations } from "next-intl";

import ArrowDownIcon from "@/assets/icons/arrow-down.svg";
import { GiftItem } from "@/components/cart/order/gift-item";
import { Icon } from "@/components/cart/order/order-summary/order-summary-helpers";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CartItem } from "@/lib/models/cart";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  defaultOpen?: boolean;
  giftItems: CartItem[];
  totalQuantity: number;
};

export function GiftItemsSection({
  className,
  defaultOpen = true,
  giftItems,
  totalQuantity,
}: Props) {
  const t = useTranslations("CartPage.giftItems");

  return (
    <div className={cn("bg-bg-default rounded-none rounded-b-lg", className)}>
      <Accordion
        collapsible
        defaultValue={defaultOpen ? "gift-items" : undefined}
        type="single"
      >
        <AccordionItem className="border-none" value="gift-items">
          <AccordionTrigger
            className={cn(
              "w-full items-center justify-between",
              "rounded-none px-5 py-3",
              "no-underline hover:no-underline",
              "border-border-base border-b",
              "group"
            )}
          >
            <div className="flex min-w-0 items-center gap-2">
              <p className="text-text-primary truncate text-xs font-normal lg:text-[15px]">
                {t.rich("orderIncludesFreeGift", {
                  strong: (chunks) => (
                    <span className="font-medium rtl:font-bold">{chunks}</span>
                  ),
                })}
              </p>
            </div>

            <div className="ml-auto flex items-center rtl:ml-0 rtl:mr-auto">
              <div className="bg-card flex items-center gap-2 rounded-full px-2 py-1 rtl:flex-row-reverse">
                <span className="text-text-primary flex text-[16px] font-semibold rtl:flex-row-reverse">
                  <span>+</span>
                  <span>{totalQuantity}</span>
                </span>
                <div className="flex -space-x-3.5 rtl:space-x-reverse">
                  {giftItems.slice(0, 3).map((it) => (
                    <div
                      aria-hidden
                      className="border-border-light-gray relative h-6 w-6 shrink-0 overflow-hidden rounded-md border bg-white shadow-none"
                      key={it.id}
                      style={{
                        zIndex: 3 - giftItems.indexOf(it),
                      }}
                    >
                      <Image
                        alt={it.name}
                        className="h-full w-full object-cover"
                        height={28}
                        src={it.imageUrl}
                        width={28}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <span className="text-text-primary inline-flex transition-all duration-200 group-data-[state=open]:rotate-180 rtl:mr-2">
              <Icon size={16} src={ArrowDownIcon} />
            </span>
          </AccordionTrigger>

          <AccordionContent className="p-0">
            <div className="divide-border-base divide-y">
              {giftItems.map((item, idx) => (
                <GiftItem index={idx + 1} item={item} key={item.id} />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
