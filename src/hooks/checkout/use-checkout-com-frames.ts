"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type CheckoutComFramesFieldName = "card-number" | "cvv" | "expiry-date";

export type CheckoutComFramesFieldState = {
  isEmpty: boolean;
  isValid: boolean;
};

export type UseCheckoutComFramesOptions = {
  isScriptLoaded: boolean;
  localization?: CheckoutComFramesInitConfig["localization"];
  /**
   * Passed straight through to `Frames.init({ modes })`. Pass a stable
   * (module-level or memoized) array reference — a fresh array literal on
   * every render would re-run `Frames.init()` on every render, same as
   * `localization`.
   */
  modes?: string[];
  onCardTokenizationFailed?: () => void;
  onCardTokenized?: (event: CheckoutComFramesCardTokenizedEvent) => void;
  onFrameBlur?: (field: CheckoutComFramesFieldName) => void;
  onFrameFocus?: (field: CheckoutComFramesFieldName) => void;
  publicKey: string;
  rtl?: boolean;
};

const RTL_STYLE: CheckoutComFramesStyle = {
  base: { padding: "0 40px 0 12px", textAlign: "right" },
};

const LTR_STYLE: CheckoutComFramesStyle = {
  base: { padding: "0 12px 0 40px", textAlign: "left" },
};

/**
 * Wraps Checkout.com Frames.js v2. Must only be used inside a component
 * that renders `.card-number-frame` / `.expiry-date-frame` / `.cvv-frame`
 * placeholder divs — Frames targets these by its default class-name
 * convention. `Frames.submitCard()` validates the full card form, so a
 * CVV-only instance (with the other two frames hidden/empty) cannot
 * successfully tokenize — see the saved-card CVV re-entry design doc for
 * why that flow does not use this hook.
 */
export function useCheckoutComFrames({
  isScriptLoaded,
  localization,
  modes,
  onCardTokenizationFailed,
  onCardTokenized,
  onFrameBlur,
  onFrameFocus,
  publicKey,
  rtl = false,
}: UseCheckoutComFramesOptions) {
  const [isReady, setIsReady] = useState(false);
  const [isCardValid, setIsCardValid] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<null | string>(null);
  const [fieldStates, setFieldStates] = useState<
    Partial<Record<CheckoutComFramesFieldName, CheckoutComFramesFieldState>>
  >({});
  const onCardTokenizedRef = useRef(onCardTokenized);
  const onCardTokenizationFailedRef = useRef(onCardTokenizationFailed);
  const onFrameBlurRef = useRef(onFrameBlur);
  const onFrameFocusRef = useRef(onFrameFocus);

  useEffect(() => {
    onCardTokenizedRef.current = onCardTokenized;
  }, [onCardTokenized]);

  useEffect(() => {
    onCardTokenizationFailedRef.current = onCardTokenizationFailed;
  }, [onCardTokenizationFailed]);

  useEffect(() => {
    onFrameBlurRef.current = onFrameBlur;
  }, [onFrameBlur]);

  useEffect(() => {
    onFrameFocusRef.current = onFrameFocus;
  }, [onFrameFocus]);

  // `localization` is often passed as a fresh object literal by callers
  // (e.g. CheckoutComCvvField) on every render. Depending on it by
  // reference in the effect below would re-run Frames.init() (and tear
  // down/rebuild the hosted iframes) even when its content is unchanged,
  // so we depend on this content-based key instead.
  const localizationKey = useMemo(
    () => JSON.stringify(localization),
    [localization]
  );

  useEffect(() => {
    if (!isScriptLoaded || !window.Frames || !publicKey) {
      return;
    }

    const Frames = window.Frames;

    try {
      Frames.init({
        localization,
        // Must be an array: the Checkout.com SDK iterates `modes` with
        // `.forEach` during init, so passing `undefined` throws
        // "Cannot read properties of undefined (reading 'forEach')" and
        // takes down the whole checkout render.
        modes: modes ?? [],
        publicKey,
        style: rtl ? RTL_STYLE : LTR_STYLE,
      });
    } catch (error) {
      // A failure inside the third-party Frames SDK must not bubble up and
      // trip the global error boundary (the "system maintenance" / 500
      // page). Surface it as a tokenization failure so the caller can show
      // an inline error instead.
      console.error("[useCheckoutComFrames] Frames.init failed", error);
      onCardTokenizationFailedRef.current?.();
      return;
    }

    const handleFrameValidationChanged = (
      event: CheckoutComFramesValidationChangedEvent
    ) => {
      setFieldStates((prev) => ({
        ...prev,
        [event.element]: { isEmpty: event.isEmpty, isValid: event.isValid },
      }));
    };

    const handleCardValidationChanged = () => {
      setIsCardValid(Frames.isCardValid());
    };

    const handlePaymentMethodChanged = (
      event: CheckoutComFramesPaymentMethodChangedEvent
    ) => {
      setPaymentMethod(event.paymentMethod);
    };

    const handleCardTokenizationFailed = () => {
      Frames.enableSubmitForm();
      onCardTokenizationFailedRef.current?.();
    };

    const handleCardTokenized = (
      event: CheckoutComFramesCardTokenizedEvent
    ) => {
      onCardTokenizedRef.current?.(event);
    };

    const handleReady = () => setIsReady(true);

    const handleFrameBlur = (event: CheckoutComFramesFrameElementEvent) => {
      onFrameBlurRef.current?.(event.element);
    };

    const handleFrameFocus = (event: CheckoutComFramesFrameElementEvent) => {
      onFrameFocusRef.current?.(event.element);
    };

    Frames.addEventHandler(
      Frames.Events.FRAME_VALIDATION_CHANGED,
      handleFrameValidationChanged
    );
    Frames.addEventHandler(
      Frames.Events.CARD_VALIDATION_CHANGED,
      handleCardValidationChanged
    );
    Frames.addEventHandler(
      Frames.Events.PAYMENT_METHOD_CHANGED,
      handlePaymentMethodChanged
    );
    Frames.addEventHandler(
      Frames.Events.CARD_TOKENIZATION_FAILED,
      handleCardTokenizationFailed
    );
    Frames.addEventHandler(Frames.Events.CARD_TOKENIZED, handleCardTokenized);
    Frames.addEventHandler(Frames.Events.READY, handleReady);
    Frames.addEventHandler(Frames.Events.FRAME_BLUR, handleFrameBlur);
    Frames.addEventHandler(Frames.Events.FRAME_FOCUS, handleFrameFocus);

    return () => {
      Frames.removeEventHandler(
        Frames.Events.FRAME_VALIDATION_CHANGED,
        handleFrameValidationChanged
      );
      Frames.removeEventHandler(
        Frames.Events.CARD_VALIDATION_CHANGED,
        handleCardValidationChanged
      );
      Frames.removeEventHandler(
        Frames.Events.PAYMENT_METHOD_CHANGED,
        handlePaymentMethodChanged
      );
      Frames.removeEventHandler(
        Frames.Events.CARD_TOKENIZATION_FAILED,
        handleCardTokenizationFailed
      );
      Frames.removeEventHandler(
        Frames.Events.CARD_TOKENIZED,
        handleCardTokenized
      );
      Frames.removeEventHandler(Frames.Events.READY, handleReady);
      Frames.removeEventHandler(Frames.Events.FRAME_BLUR, handleFrameBlur);
      Frames.removeEventHandler(Frames.Events.FRAME_FOCUS, handleFrameFocus);
    };
    // localizationKey (a JSON.stringify'd, memoized content key) is used
    // here instead of localization itself; see the comment above
    // localizationKey's definition for why. `modes` is intentionally
    // excluded too — callers must pass a stable reference, per its JSDoc
    // above, for the same reason.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScriptLoaded, publicKey, rtl, localizationKey]);

  const submitCard = useCallback(async () => {
    if (!window.Frames) {
      throw new Error("Checkout.com Frames SDK is not loaded");
    }
    return window.Frames.submitCard();
  }, []);

  return {
    fieldStates,
    isCardValid,
    isReady,
    paymentMethod,
    submitCard,
  };
}
