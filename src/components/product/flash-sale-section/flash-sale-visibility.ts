export type FlashSaleVisibilityInput = {
  endTime?: string;
  hasContent: boolean;
  startTime?: string;
};

type FlashSaleVisibility = {
  nextTransitionAt: null | number;
  shouldRender: boolean;
};

export function getFlashSaleVisibility(
  flashSale: FlashSaleVisibilityInput,
  nowMs: number
): FlashSaleVisibility {
  const startMs = flashSale.startTime ? Date.parse(flashSale.startTime) : NaN;
  const endMs = flashSale.endTime ? Date.parse(flashSale.endTime) : NaN;

  const hasStarted =
    !flashSale.startTime || (Number.isFinite(startMs) && startMs <= nowMs);
  const hasNotEnded =
    !flashSale.endTime || (Number.isFinite(endMs) && endMs > nowMs);

  if (!flashSale.hasContent) {
    return { nextTransitionAt: null, shouldRender: false };
  }

  if (!hasStarted) {
    return {
      nextTransitionAt: Number.isFinite(startMs) ? startMs : null,
      shouldRender: false,
    };
  }

  if (!hasNotEnded) {
    return { nextTransitionAt: null, shouldRender: false };
  }

  return {
    nextTransitionAt: Number.isFinite(endMs) ? endMs : null,
    shouldRender: true,
  };
}
