"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import Image from "next/image";

import { useTranslations } from "next-intl";

import AlertIcon from "@/assets/icons/Alert.svg";
import { GiftWrappingCard } from "@/components/checkout/delivery/gift-wrapping/gift-wrapping-card";
import { Checkbox } from "@/components/ui/checkbox";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { Spinner } from "@/components/ui/spinner";
import { useNotifyMe } from "@/contexts/notify-me-context";
import { useAddProductsToCartWithGiftMessage } from "@/hooks/mutations/cart/use-add-products-to-cart-with-gift-message";
import { useRemoveProductFromCart } from "@/hooks/mutations/cart/use-remove-product-from-cart";
import { useHorizontalScroll } from "@/hooks/use-horizontal-scroll";
import { useRouter } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils";

import type {
  GiftWrappingProduct,
  GiftWrappingSection,
} from "@/components/checkout/delivery/gift-wrapping/types";

interface GiftWrappingSectionListProps {
  items: GiftWrappingProduct[];
  onSelect: (giftId: string) => void;
  selectedGiftId: null | string;
}

const GiftWrappingSectionList = ({
  items,
  onSelect,
  selectedGiftId,
}: GiftWrappingSectionListProps) => {
  const scrollRef = useHorizontalScroll<HTMLDivElement>();

  return (
    <div
      className="scrollbar-hidden flex gap-[10px] overflow-x-auto"
      ref={scrollRef}
    >
      {items.map((item) => (
        <GiftWrappingCard
          gift={item}
          isSelected={selectedGiftId === item.id}
          key={item.id}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};

interface AddGiftWrappingFormProps {
  defaultGiftMessage?: string;
  defaultSelectedGiftId: null | string;
  existingWrapItem?: { sku?: string; uidInCart?: string } | null;
  giftSections: GiftWrappingSection[];
  isEditMode: boolean;
}

export const AddGiftWrappingForm = ({
  defaultGiftMessage,
  defaultSelectedGiftId,
  existingWrapItem,
  giftSections,
  isEditMode,
}: AddGiftWrappingFormProps) => {
  const router = useRouter();
  const t = useTranslations("CheckoutPage.AddGiftWrappingDrawer");
  const notifyMeT = useTranslations("productCard.cartAction");
  const formRef = useRef<HTMLFormElement>(null);
  const { setNotifyMeData } = useNotifyMe();
  const [isNavigatingToNotifyMe, startNavigatingToNotifyMe] = useTransition();

  const normalizedGiftSections = useMemo(
    () =>
      giftSections.filter(
        (section) => section.items && section.items.length > 0
      ),
    [giftSections]
  );

  const firstAvailableSelection =
    defaultSelectedGiftId ?? normalizedGiftSections[0]?.items?.[0]?.id ?? null;

  const [selectedGiftId, setSelectedGiftId] = useState<null | string>(
    firstAvailableSelection
  );
  const [message, setMessage] = useState(defaultGiftMessage || "");
  const [isStandardBoxSelected, setIsStandardBoxSelected] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Reset state and scroll to top when in edit mode or when defaultSelectedGiftId changes
  useEffect(() => {
    // Reset client-side state in edit mode (data comes from API)
    if (isEditMode) {
      setSelectedGiftId(defaultSelectedGiftId);
      setMessage(defaultGiftMessage || "");
      setIsStandardBoxSelected(false);
      setIsExpanded(false);
    } else {
      // In add mode, set initial values
      setSelectedGiftId(firstAvailableSelection);
      setMessage("");
      setIsStandardBoxSelected(false);
      setIsExpanded(false);
    }

    // Scroll to top whenever the form opens (both edit and add mode)
    if (formRef.current) {
      formRef.current.scrollTop = 0;
    }
  }, [
    isEditMode,
    defaultSelectedGiftId,
    defaultGiftMessage,
    firstAvailableSelection,
  ]);

  // Find the selected gift product to get its SKU
  const selectedGift = useMemo(() => {
    if (!selectedGiftId) return null;
    for (const section of normalizedGiftSections) {
      const gift = section.items.find((item) => item.id === selectedGiftId);
      if (gift) return gift;
    }
    return null;
  }, [selectedGiftId, normalizedGiftSections]);
  const isSelectedGiftOutOfStock = !!selectedGift && !selectedGift.inStock;

  const addToCartMutation = useAddProductsToCartWithGiftMessage({
    giftMessage: undefined,
    selectedOptionId: selectedGiftId ?? undefined,
    sku: selectedGift?.sku ?? "",
  });

  const removeMutation = useRemoveProductFromCart({
    sku: existingWrapItem?.sku || "",
  });

  const handleGiftSelect = (giftId: string) => {
    setSelectedGiftId(giftId);
    setIsStandardBoxSelected(false);
  };

  const handleStandardBoxToggle = (checked: boolean) => {
    setIsStandardBoxSelected(checked);
    if (checked) {
      setSelectedGiftId(null);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // If standard box is selected
    if (isStandardBoxSelected) {
      // In edit mode, remove the existing gift wrap item (standard box = no wrap)
      if (isEditMode && existingWrapItem?.uidInCart) {
        removeMutation.mutate(
          { itemUid: existingWrapItem.uidInCart },
          {
            onSuccess: () => {
              // Close the gift wrapping drawer on success
              router.back();
            },
          }
        );
      } else {
        // In add mode, just close without calling API
        router.back();
      }
      return;
    }

    // If no gift is selected, don't submit
    if (!selectedGift || !selectedGift.sku) {
      return;
    }

    if (!selectedGift.inStock) {
      return;
    }

    // If in edit mode, first remove the existing wrap item, then add the new one
    if (isEditMode && existingWrapItem?.uidInCart) {
      removeMutation.mutate(
        { itemUid: existingWrapItem.uidInCart },
        {
          onSuccess: () => {
            // After successful removal, add the new gift wrap item
            addToCartMutation.mutate(
              {
                giftMessage: {
                  message: message.trim() || undefined,
                },
                sku: selectedGift.sku,
              },
              {
                onSuccess: () => {
                  // Close the gift wrapping drawer on success
                  router.back();
                },
              }
            );
          },
        }
      );
    } else {
      // Normal add flow (not in edit mode)
      addToCartMutation.mutate(
        {
          giftMessage: {
            message: message.trim() || undefined,
          },
          sku: selectedGift.sku,
        },
        {
          onSuccess: () => {
            // Close the gift wrapping drawer on success
            router.back();
          },
        }
      );
    }
  };

  const handleNavigateToNotifyMe = () => {
    if (!selectedGift?.externalId || !selectedGift.name) {
      return;
    }

    setNotifyMeData({
      product: null,
      productCard: null,
      selectedProduct: null,
    });

    startNavigatingToNotifyMe(() => {
      router.push(
        ROUTES.NOTIFY_ME(selectedGift.externalId, selectedGift.name),
        {
          scroll: false,
        }
      );
    });
  };

  const isSubmitting =
    addToCartMutation.isPending ||
    removeMutation.isPending ||
    isNavigatingToNotifyMe;

  return (
    <form
      className="scrollbar-hidden flex max-h-full flex-col gap-4 overflow-y-auto px-5 py-4"
      onSubmit={handleSubmit}
      ref={formRef}
    >
      {normalizedGiftSections.map((section) => (
        <div className="flex flex-col gap-2" key={section.id}>
          <p className="text-text-secondary text-[14px] font-medium">
            {section.title}
          </p>
          <GiftWrappingSectionList
            items={section.items}
            onSelect={handleGiftSelect}
            selectedGiftId={selectedGiftId}
          />
        </div>
      ))}

      <div className="flex flex-col gap-1.5">
        <p className="text-text-secondary text-[14px] font-medium">
          {t("writeMessage")}
        </p>
        <textarea
          className="border-border-base bg-bg-surface placeholder:text-text-placeholder text-text-primary focus:border-text-primary min-h-[80px] w-full resize-none rounded-[10px] border px-4 py-2 text-[15px] leading-snug focus:outline-none"
          onChange={(event) => setMessage(event.target.value)}
          placeholder={t("messagePlaceholder")}
          value={message}
        />
      </div>

      <div className="flex flex-col gap-3 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={isStandardBoxSelected}
              id="standard-box"
              onCheckedChange={(checked) =>
                handleStandardBoxToggle(checked === true)
              }
            />
            <label
              className="text-text-primary text-sm font-medium"
              htmlFor="standard-box"
            >
              {t("standardBox")}
            </label>
          </div>
          <span className="text-btn-bg-teal text-sm font-medium">
            {t("free")}
          </span>
        </div>

        <div className="text-text-tertiary flex items-start gap-2 text-xs leading-snug">
          <Image
            alt="note"
            className="mt-1 shrink-0"
            height={12}
            src={AlertIcon}
            width={12}
          />
          <div className="rtl:flex rtl:flex-col">
            <p className="rtl:block">
              {t("infoMessage")}
              {isExpanded && (
                <>
                  {" "}
                  {t("expandedMessage")}{" "}
                  <button
                    className="text-text-brand underline rtl:mt-0 rtl:block"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsExpanded(false);
                    }}
                    type="button"
                  >
                    {t("readLess")}
                  </button>
                </>
              )}
              {!isExpanded && (
                <>
                  {" "}
                  <button
                    className="text-text-brand underline rtl:mt-0 rtl:block"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsExpanded(true);
                    }}
                    type="button"
                  >
                    {t("readMore")}
                  </button>
                </>
              )}
            </p>
          </div>
        </div>

        {isStandardBoxSelected || !isSelectedGiftOutOfStock ? (
          <FormSubmitButton
            className="bg-bg-primary text-text-inverse h-[50px] w-full rounded-[10px] text-[20px] font-medium"
            isSubmitting={isSubmitting}
          >
            {isStandardBoxSelected ? t("skip") : t("add")}
          </FormSubmitButton>
        ) : (
          <button
            className={cn(
              "transition-default bg-btn-bg-primary text-text-ghost h-12.5 rounded-xl text-xl font-medium",
              "hover:bg-btn-bg-slate",
              !isSubmitting && "disabled:bg-btn-bg-muted",
              { "bg-btn-bg-slate": isSubmitting },
              "focus:bg-btn-bg-primary focus:outline-none",
              "h-[50px] w-full rounded-[10px]"
            )}
            disabled={isSubmitting}
            onClick={handleNavigateToNotifyMe}
            type="button"
          >
            {isSubmitting ? (
              <div className="flex h-full w-full items-center justify-center">
                <Spinner label="Loading" />
              </div>
            ) : (
              notifyMeT("notify_me")
            )}
          </button>
        )}
      </div>
    </form>
  );
};
