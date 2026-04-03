"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import Image from "next/image";

import { useTranslations } from "next-intl";

import CheckIcon from "@/assets/icons/check-icon.svg";
import { CheckoutAddCardModal } from "@/components/checkout/payment/checkout-add-card-modal";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PAYMENT_CARD_NETWORK_ICONS } from "@/lib/constants/payment-card";
import { cn } from "@/lib/utils";

import type { PaymentCardData } from "@/components/checkout/checkout-page";

interface CheckoutCardPaymentSectionProps {
  cardIdToRestore?: null | string;
  disableAutoSelect?: boolean;
  initialSavedCards?: PaymentCardData[];
  isDeliverySelected?: boolean;
  isPaymentMethodSelected?: boolean;
  onCardTokenReady: (
    token: string,
    card?: null | PaymentCardData,
    cardNumber?: string,
    cvv?: string,
    shouldRefreshCards?: boolean
  ) => void;
  onSelectPaymentMethod?: () => void;
  selectedCard: null | PaymentCardData;
}

export const CheckoutCardPaymentSection = ({
  cardIdToRestore = null,
  disableAutoSelect = false,
  initialSavedCards = [],
  isDeliverySelected = false,
  isPaymentMethodSelected = true,
  onCardTokenReady,
  onSelectPaymentMethod,
  selectedCard,
}: CheckoutCardPaymentSectionProps) => {
  const t = useTranslations("CheckoutPage.cardPaymentSection");
  const tSavedCards = useTranslations("CheckoutPage.savedCardsDialog");
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [savedCards, setSavedCards] =
    useState<PaymentCardData[]>(initialSavedCards);
  const [cvv, setCvv] = useState("");
  const cvvInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  const hasHydratedFromApiRef = useRef(false);
  const selectedCardRef = useRef<null | PaymentCardData>(selectedCard);
  const onCardTokenReadyRef = useRef(onCardTokenReady);
  const lastRefreshTimeRef = useRef<number>(0);
  const hasFetchedOnMountRef = useRef(false);
  const REFRESH_COOLDOWN_MS = 2000; // Prevent refreshing more than once every 2 seconds

  useEffect(() => {
    selectedCardRef.current = selectedCard;
  }, [selectedCard]);

  useEffect(() => {
    onCardTokenReadyRef.current = onCardTokenReady;
  }, [onCardTokenReady]);

  function mergeCardsById(
    existing: PaymentCardData[],
    incoming: PaymentCardData[]
  ): PaymentCardData[] {
    if (existing.length === 0) return incoming;
    if (incoming.length === 0) return existing;

    const byId = new Map<string, PaymentCardData>();
    existing.forEach((c) => byId.set(c.id, c));
    incoming.forEach((c) => byId.set(c.id, { ...byId.get(c.id), ...c }));

    // Preserve existing order: use existing array order as base, update with incoming data
    // New cards from incoming that don't exist in existing are added at the bottom
    const existingIds = new Set(existing.map((c) => c.id));
    const incomingIds = new Set(incoming.map((c) => c.id));

    // Existing cards maintain their order, updated with incoming data
    const existingCardsUpdated = existing
      .filter((c) => incomingIds.has(c.id))
      .map((c) => byId.get(c.id)!)
      .filter(Boolean);

    // Cards that were removed from incoming but exist in existing (shouldn't happen with preserveExisting, but handle it)
    const removedCards = existing
      .filter((c) => !incomingIds.has(c.id))
      .map((c) => byId.get(c.id)!)
      .filter(Boolean);

    // New cards (in incoming but not in existing) go last
    const newCards = incoming
      .filter((c) => !existingIds.has(c.id))
      .map((c) => byId.get(c.id)!)
      .filter(Boolean);

    return [...existingCardsUpdated, ...removedCards, ...newCards];
  }

  function getCardMetaKey(card: PaymentCardData): string {
    return `${card.cardNetwork}:${card.last4}:${card.expiry}`;
  }

  // Keep local list in sync with initialSavedCards without overwriting fresher API refreshes.
  useEffect(() => {
    setSavedCards((prev) => {
      // After we have refreshed from the API, don't allow potentially stale props
      // to re-introduce cards that were deleted elsewhere.
      const safeIncoming = hasHydratedFromApiRef.current
        ? initialSavedCards.filter((card) => prev.some((c) => c.id === card.id))
        : initialSavedCards;

      return mergeCardsById(prev, safeIncoming);
    });
  }, [initialSavedCards]);

  const displayCards = useMemo(() => {
    const list: PaymentCardData[] = [...savedCards];

    // Always keep the currently selected card visible in the list (prevents "selected then unselected" UX).
    if (selectedCard && !list.some((c) => c.id === selectedCard.id)) {
      list.unshift(selectedCard);
    }

    // De-dupe by id (keep first occurrence).
    const seenIds = new Set<string>();
    const uniqueById = list.filter((card) => {
      if (seenIds.has(card.id)) return false;
      seenIds.add(card.id);
      return true;
    });

    const selectedMetaKey = selectedCard ? getCardMetaKey(selectedCard) : null;
    const isSelectedTemp =
      !!selectedCard && !(selectedCard.sourceId?.trim?.() || "");

    const realMetaKeys = new Set(
      uniqueById.filter((card) => card.sourceId?.trim?.()).map(getCardMetaKey)
    );

    const filtered = uniqueById.filter((card) => {
      const metaKey = getCardMetaKey(card);
      const isTemp = !(card.sourceId?.trim?.() || "");

      // If the selected card is a temporary/tokenized card, prefer showing it
      // and hide any other cards with the same meta to avoid duplicates.
      if (isSelectedTemp && selectedMetaKey && metaKey === selectedMetaKey) {
        return card.id === selectedCard?.id;
      }

      // Otherwise, hide temp cards that have a matching real saved card from the API.
      if (isTemp && realMetaKeys.has(metaKey)) return false;

      return true;
    });

    // Preserve original order from savedCards - don't move selected card to top
    // This maintains the order from mergeCardsById where incoming/new cards are first
    return filtered.sort((a, b) => {
      const indexA = savedCards.findIndex((c) => c.id === a.id);
      const indexB = savedCards.findIndex((c) => c.id === b.id);
      // If cards are not found in savedCards, keep their relative order
      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }, [savedCards, selectedCard]);

  const selectedCardId = selectedCard?.id ?? "";
  const needsCvvForSelectedCard = Boolean(
    selectedCard?.sourceId?.trim?.() && !selectedCard.checkoutPaymentId
  );

  // Reset CVV when selected card changes and focus on CVV input if it's a saved card.
  // We intentionally avoid depending on `selectedCard` object identity (it can change while typing CVV),
  // and instead depend on stable primitives.
  useEffect(() => {
    setCvv("");
    // Focus on CVV input when a saved card is selected and needs CVV
    if (
      selectedCard &&
      selectedCard.sourceId &&
      selectedCard.sourceId.length > 0 &&
      !selectedCard.checkoutPaymentId &&
      isPaymentMethodSelected
    ) {
      // Use setTimeout to ensure the input is rendered before focusing
      // Increase delay to ensure DOM has updated
      const timeoutId = setTimeout(() => {
        const inputRef = cvvInputRefs.current.get(selectedCard.id);
        // Only focus if the input exists and is visible
        if (inputRef && inputRef.offsetParent !== null) {
          inputRef.focus();
        }
      }, 150);
      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsCvvForSelectedCard, selectedCardId, isPaymentMethodSelected]);

  // Fetch updated cards list from API
  const refreshCards = useCallback(
    async (opts?: { preserveExisting?: boolean }) => {
      // Prevent excessive API calls with a cooldown period
      const now = Date.now();
      if (now - lastRefreshTimeRef.current < REFRESH_COOLDOWN_MS) {
        return;
      }
      lastRefreshTimeRef.current = now;

      try {
        // Add cache-busting query parameter and timestamp to ensure fresh data
        const response = await fetch(
          `/api/customer/payment-cards?nocache=true&t=${Date.now()}`,
          {
            cache: "no-store",
          }
        );

        if (response.ok) {
          const json = (await response.json()) as {
            data: { paymentCards: PaymentCardData[] } | null;
            error: null | string;
          };

          if (json.data?.paymentCards) {
            const cards = json.data.paymentCards.filter((card) => {
              const hasSourceId =
                card.sourceId && card.sourceId.trim().length > 0;
              return hasSourceId;
            });

            hasHydratedFromApiRef.current = true;

            if (opts?.preserveExisting) {
              setSavedCards((prev) => mergeCardsById(prev, cards));
            } else {
              setSavedCards(cards);
            }

            const currentSelectedCard = selectedCardRef.current;
            if (currentSelectedCard && currentSelectedCard.id) {
              const cardStillExists = cards.some(
                (card) => card.id === currentSelectedCard.id
              );
              if (!cardStillExists) {
                // Don't clear selection for a temporary (tokenized) card during refresh.
                const isTempSelection = !(
                  currentSelectedCard.sourceId?.trim?.() || ""
                );
                if (!isTempSelection) {
                  onCardTokenReadyRef.current("", null, undefined, "");
                }
              } else {
                // Update selected card with latest data including checkoutPaymentId
                const updatedCard = cards.find(
                  (card) => card.id === currentSelectedCard.id
                );
                if (updatedCard) {
                  // Only update selection for real saved cards.
                  // For tokenized (temp) cards we must NOT call onCardTokenReady("") as it would clear the token.
                  const isSavedSelection =
                    currentSelectedCard.sourceId?.trim?.() || "";
                  if (isSavedSelection) {
                    // Update the selected card with latest data without touching CVV/token state.
                    onCardTokenReadyRef.current(
                      "",
                      updatedCard,
                      undefined,
                      undefined
                    );
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Failed to refresh payment cards:", error);
      }
    },
    [] // Remove onCardTokenReady dependency - use ref instead
  );

  // Always refresh cards when the card section mounts so deletions from "My Cards" reflect in checkout.
  // Only fetch once on mount, not on every render
  useEffect(() => {
    if (!hasFetchedOnMountRef.current) {
      hasFetchedOnMountRef.current = true;
      void refreshCards({ preserveExisting: true });
    }
  }, [refreshCards]); // refreshCards is stable (empty deps), so this only runs on mount

  // Also refresh when returning to the tab/window.
  // Use a stable ref for refreshCards to avoid recreating event listeners
  const refreshCardsRef = useRef(refreshCards);
  useEffect(() => {
    refreshCardsRef.current = refreshCards;
  }, [refreshCards]);

  useEffect(() => {
    const handleFocus = () => {
      void refreshCardsRef.current({ preserveExisting: true });
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void refreshCardsRef.current({ preserveExisting: true });
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []); // Empty deps - only set up listeners once, use ref for refreshCards

  // Determine default card selection: default card first, then first card
  const defaultCardId = useMemo(() => {
    const realCards = displayCards.filter(
      (card) => card.sourceId && card.sourceId.trim().length > 0
    );
    if (realCards.length === 0) return null;
    const defaultCard = realCards.find((card) => card.isDefault);
    return defaultCard?.id || realCards[0]?.id || null;
  }, [displayCards]);

  // Track if a card was explicitly selected by parent (during restoration)
  const wasCardPreselectedRef = useRef(false);
  const autoSelectTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Detect when parent provides a selectedCard on mount or shortly after
  useEffect(() => {
    if (selectedCard && !wasCardPreselectedRef.current) {
      wasCardPreselectedRef.current = true;
    }
  }, [selectedCard]);

  // Auto-select default card if no card is selected (unless disabled)
  // Only auto-select if payment method is selected and card wasn't preselected
  // Add a delay to allow parent to restore card selection first
  useEffect(() => {
    // Clear any existing timer
    if (autoSelectTimerRef.current) {
      clearTimeout(autoSelectTimerRef.current);
      autoSelectTimerRef.current = null;
    }

    // CRITICAL: Check if there's restoration data in session storage
    // If yes, skip auto-select entirely to avoid overriding restoration
    const hasRestorationData =
      typeof window !== "undefined" &&
      window.sessionStorage.getItem("payment-method-info") !== null;

    if (hasRestorationData) {
      return;
    }

    // CRITICAL: Check for restoration FIRST, before checking disableAutoSelect
    // If there's a card to restore, select it immediately
    // Check BOTH initialSavedCards (prop) and savedCards (state) to catch the card wherever it is
    if (cardIdToRestore && isPaymentMethodSelected && !selectedCard) {
      // Try initialSavedCards first (prop from parent), then savedCards (local state)
      const cardToRestore =
        initialSavedCards.find((c) => c.id === cardIdToRestore) ||
        savedCards.find((c) => c.id === cardIdToRestore);

      if (cardToRestore) {
        onCardTokenReady("", cardToRestore, undefined, "");
        return;
      }
    }

    if (
      isPaymentMethodSelected &&
      !selectedCard &&
      !wasCardPreselectedRef.current &&
      defaultCardId &&
      savedCards.length > 0
    ) {
      console.info(
        "[CheckoutCardPaymentSection] Scheduling auto-select check...",
        { defaultCardId, savedCardsCount: savedCards.length }
      );

      // Delay auto-select to give parent component time to restore card selection
      autoSelectTimerRef.current = setTimeout(() => {
        console.info(
          "[CheckoutCardPaymentSection] Auto-select timer fired, checking state:",
          {
            hasSelectedCardRef: !!selectedCardRef.current,
            selectedCardRefId: selectedCardRef.current?.id,
            wasPreselected: wasCardPreselectedRef.current,
          }
        );

        // IMPORTANT: Use ref to check current preselection state, not closure value
        // Check if a card was preselected while we were waiting
        if (wasCardPreselectedRef.current) {
          console.info(
            "[CheckoutCardPaymentSection] ⏭️ Skipping auto-select - card was preselected during delay"
          );
          return;
        }

        // Also check if selectedCard ref is set (use ref for current value, not closure)
        if (selectedCardRef.current) {
          console.info(
            "[CheckoutCardPaymentSection] ⏭️ Skipping auto-select - card is already selected:",
            selectedCardRef.current.id
          );
          return;
        }

        const cardToSelect = savedCards.find(
          (card) => card.id === defaultCardId
        );
        if (cardToSelect) {
          console.info(
            "[CheckoutCardPaymentSection] ▶️ Auto-selecting default card:",
            cardToSelect.id
          );
          onCardTokenReady("", cardToSelect, undefined, "");
        } else {
          console.info(
            "[CheckoutCardPaymentSection] ⚠️ No card to auto-select"
          );
        }
      }, 500); // Increased to 500ms delay to allow restoration to complete
    }

    return () => {
      if (autoSelectTimerRef.current) {
        clearTimeout(autoSelectTimerRef.current);
        autoSelectTimerRef.current = null;
      }
    };
  }, [
    cardIdToRestore,
    defaultCardId,
    disableAutoSelect,
    initialSavedCards,
    isPaymentMethodSelected,
    onCardTokenReady,
    savedCards,
    selectedCard,
  ]);

  const handleCardSelect = (cardId: string) => {
    // If payment method is not selected, allow card click to select the method first
    if (!isPaymentMethodSelected && onSelectPaymentMethod) {
      onSelectPaymentMethod();
    }
    const card = savedCards.find((c) => c.id === cardId);
    if (card) {
      setCvv("");
      onCardTokenReady("", card, undefined, "");
    }
  };

  const handleCvvChange = (value: string) => {
    setCvv(value);
    if (selectedCard) {
      onCardTokenReady("", selectedCard, undefined, value || "");
    }
  };

  const handleCardAdded = async (
    token: string,
    card?: PaymentCardData,
    cardNumber?: string,
    cvv?: string,
    shouldRefreshCards?: boolean
  ) => {
    onCardTokenReady(token, card, cardNumber, cvv, shouldRefreshCards);
    setShowAddCardModal(false);

    // Optimistically show the newly added (tokenized) card at the bottom of the list so it doesn't flicker/disappear.
    if (card) {
      setSavedCards((prev) => {
        const without = prev.filter((c) => c.id !== card.id);
        return [...without, card];
      });
    }

    // Refresh cards list after adding a new card if it was saved
    // Add a small delay to ensure backend has processed the card
    if (shouldRefreshCards) {
      // Wait a bit for backend to process the card, then refresh multiple times
      // to ensure we get the card even if backend processing is slow
      setTimeout(async () => {
        await refreshCards({ preserveExisting: true });
      }, 500);
      // Also refresh after a longer delay in case backend is slow
      setTimeout(async () => {
        await refreshCards({ preserveExisting: true });
      }, 2000);
    }
  };

  // Only show selected card if payment method is selected
  // Don't use defaultCardId here to allow user to switch between cards
  const currentSelectedCardId =
    isPaymentMethodSelected && selectedCard?.id ? selectedCard.id : "";

  return (
    <>
      <div className="border-border-base border-t" data-section="card-payment">
        {displayCards.length > 0 ? (
          <RadioGroup
            className={cn(
              "divide-y divide-[var(--divider)] [--divider:rgba(0,0,0,0.08)]",
              !isPaymentMethodSelected && "opacity-60"
            )}
            onValueChange={handleCardSelect}
            value={currentSelectedCardId}
          >
            {displayCards.map((card) => {
              const cardIcon =
                PAYMENT_CARD_NETWORK_ICONS[
                  card.cardNetwork as keyof typeof PAYMENT_CARD_NETWORK_ICONS
                ];
              const isSelected = card.id === currentSelectedCardId;
              const isSavedCard = card.sourceId && card.sourceId.length > 0;
              // CVV is only required if card does NOT have checkoutPaymentId (card not fully recorded for CVV-less flow)
              const needsCvv = isSavedCard && !card.checkoutPaymentId;

              return (
                <div
                  className={cn(
                    "flex items-center gap-3 px-6 py-3 lg:px-10",
                    isSelected && "bg-white"
                  )}
                  data-card-row
                  key={card.id}
                >
                  <label
                    className="flex flex-1 cursor-pointer items-center gap-3"
                    htmlFor={card.id}
                  >
                    {cardIcon && (
                      <Image
                        alt="Card network"
                        className="shrink-0"
                        src={cardIcon}
                        unoptimized
                      />
                    )}
                    <div className="flex flex-1 items-center gap-3">
                      <p className="text-text-primary text-sm font-medium">
                        <span className="hidden lg:inline">
                          XXXX XXXX XXXX{" "}
                        </span>{" "}
                        {card.last4}
                      </p>
                      <p className="text-text-secondary text-xs">
                        {t("expires")} {card.expiry}
                      </p>
                    </div>
                  </label>
                  {isSelected && needsCvv && (
                    <div className="relative inline-flex items-center">
                      <input
                        autoComplete="off"
                        className={cn(
                          "bg-bg-surface text-text-primary w-18 h-8 rounded-xl pl-2 pr-7 text-base transition-colors focus:outline-none lg:w-20",
                          {
                            "bg-bg-default border border-[#76D671]":
                              cvv.length >= 3,
                          }
                        )}
                        data-input="cvv"
                        inputMode="numeric"
                        maxLength={3}
                        onChange={(e) => {
                          const value = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 3);
                          handleCvvChange(value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        onPaste={(e) => {
                          e.preventDefault();
                          const text =
                            e.clipboardData.getData("text/plain") || "";
                          const digits = text.replace(/\D/g, "").slice(0, 3);
                          handleCvvChange(digits);
                        }}
                        placeholder={tSavedCards("cvvPlaceholder")}
                        ref={(el) => {
                          if (el) {
                            cvvInputRefs.current.set(card.id, el);
                          } else {
                            cvvInputRefs.current.delete(card.id);
                          }
                        }}
                        type="password"
                        value={isSelected ? cvv : ""}
                      />
                      {cvv.length >= 3 && (
                        <div className="absolute right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#76D671]">
                          <Image
                            alt="Valid"
                            className="h-2.5 w-2.5"
                            src={CheckIcon}
                            unoptimized
                          />
                        </div>
                      )}
                    </div>
                  )}
                  <RadioGroupItem id={card.id} value={card.id} />
                </div>
              );
            })}
          </RadioGroup>
        ) : null}
      </div>
      <div className="border-border-base border-t">
        <button
          className={cn(
            "h-[45px] w-full px-4 py-2 text-center text-[20px] font-medium transition-colors",
            isDeliverySelected
              ? "text-text-primary hover:bg-bg-surface cursor-pointer"
              : "text-text-secondary cursor-not-allowed opacity-60"
          )}
          disabled={!isDeliverySelected}
          onClick={() => {
            if (isDeliverySelected) {
              setShowAddCardModal(true);
            }
          }}
          type="button"
        >
          {t("addNewCard")}
        </button>
      </div>
      <CheckoutAddCardModal
        initialPaymentCards={savedCards}
        onCardAdded={handleCardAdded}
        onClose={() => setShowAddCardModal(false)}
        open={showAddCardModal}
      />
    </>
  );
};
