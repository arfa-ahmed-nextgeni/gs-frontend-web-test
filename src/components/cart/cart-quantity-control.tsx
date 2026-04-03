"use client";

import { ComponentProps, useEffect, useState } from "react";

import Image from "next/image";

import MinusIcon from "@/assets/icons/minus-icon.svg";
import PlusIcon from "@/assets/icons/plus-icon.svg";
import TrashIcon from "@/assets/icons/trash-icon.svg";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export const CartQuantityControl = ({
  containerProps,
  disableIncrement = false,
  isLoading,
  onRemoveItemAction,
  onUpdateQuantityAction,
  quantity,
}: {
  containerProps?: ComponentProps<"div">;
  disableIncrement?: boolean;
  isLoading?: boolean;
  onRemoveItemAction: () => void;
  onUpdateQuantityAction: (quantity: number) => Promise<void> | void;
  quantity: number;
}) => {
  const [prevQuantity, setPrevQuantity] = useState(quantity);
  const [nextQuantity, setNextQuantity] = useState<null | number>(null);
  const [direction, setDirection] = useState<"down" | "up">("up");

  useEffect(() => {
    if (quantity === prevQuantity || isLoading) return;

    setDirection(quantity > prevQuantity ? "up" : "down");
    setNextQuantity(quantity);
  }, [quantity, prevQuantity, isLoading]);

  function handleAnimationEnd() {
    if (nextQuantity !== null) {
      setPrevQuantity(nextQuantity);
      setNextQuantity(null);
    }
  }

  async function increment() {
    if (isLoading) return;
    await onUpdateQuantityAction(quantity + 1);
  }

  async function decrement() {
    if (isLoading) return;
    if (quantity <= 1) {
      onRemoveItemAction();
      return;
    }
    await onUpdateQuantityAction(quantity - 1);
  }

  const showRemoveIcon = quantity <= 1;

  return (
    <div
      {...containerProps}
      className={cn(
        "border-border-base flex h-10 flex-row rounded-3xl border",
        containerProps?.className
      )}
      dir="ltr"
    >
      <button
        className="flex flex-1 items-center justify-center disabled:opacity-50"
        disabled={isLoading}
        onClick={showRemoveIcon ? onRemoveItemAction : decrement}
      >
        {showRemoveIcon ? (
          <Image
            alt="remove"
            className="size-3"
            height={12}
            src={TrashIcon}
            width={12}
          />
        ) : (
          <Image alt="remove" className="w-3" src={MinusIcon} width={12} />
        )}
      </button>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        {isLoading ? (
          <Spinner className="size-3.75" size={15} variant="dark" />
        ) : (
          <>
            <span
              className={cn(
                "text-text-primary absolute text-lg font-medium leading-none",
                nextQuantity !== null &&
                  (direction === "up"
                    ? "animate-slide-up-out"
                    : "animate-slide-down-out")
              )}
              onAnimationEnd={handleAnimationEnd}
            >
              {prevQuantity}
            </span>

            {nextQuantity !== null && (
              <span
                className={cn(
                  "text-text-primary absolute text-lg font-medium leading-none",
                  direction === "up"
                    ? "animate-slide-up-in"
                    : "animate-slide-down-in"
                )}
              >
                {nextQuantity}
              </span>
            )}
          </>
        )}
      </div>

      <button
        className="flex flex-1 items-center justify-center disabled:opacity-50"
        disabled={isLoading || disableIncrement}
        onClick={increment}
      >
        <Image
          alt="add"
          className="size-3"
          height={12}
          src={PlusIcon}
          width={12}
        />
      </button>
    </div>
  );
};
