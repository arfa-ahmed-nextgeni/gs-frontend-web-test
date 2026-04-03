import { AsyncBoundary } from "@/components/common/async-boundary";
import { FlashSaleContainer } from "@/components/product/flash-sale-section/flash-sale-container";
import { FlashSaleContent } from "@/components/product/flash-sale-section/flash-sale-content";
import { FlashSaleContentSkeleton } from "@/components/product/flash-sale-section/flash-sale-content-skeleton";
import { FlashSale } from "@/lib/models/flash-sale";

export const FlashSaleSection = (
  props: { delayMs?: number; lpRow?: number } & FlashSale
) => {
  return (
    <FlashSaleContainer flashSale={structuredClone(props)}>
      <AsyncBoundary
        loadingFallback={<FlashSaleContentSkeleton variant={props.variant} />}
      >
        <FlashSaleContent
          {...props}
          delayMs={props.delayMs}
          lpRow={props.lpRow}
        />
      </AsyncBoundary>
    </FlashSaleContainer>
  );
};
