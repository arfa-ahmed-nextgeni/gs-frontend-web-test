import { AsyncBoundary } from "@/components/common/async-boundary";
import { FlashSaleContainer } from "@/components/product/flash-sale-section/flash-sale-container";
import { FlashSaleContent } from "@/components/product/flash-sale-section/flash-sale-content";
import { FlashSaleContentSkeleton } from "@/components/product/flash-sale-section/flash-sale-content-skeleton";
import { FlashSale } from "@/lib/models/flash-sale";

export const FlashSaleSection = (props: { lpRow?: number } & FlashSale) => {
  return (
    <FlashSaleContainer
      visibility={{
        endTime: props.endTime,
        hasContent: Boolean(
          props.products?.length || props.saleProductCategoryId
        ),
        startTime: props.startTime,
      }}
    >
      <AsyncBoundary
        loadingFallback={<FlashSaleContentSkeleton variant={props.variant} />}
      >
        <FlashSaleContent {...props} lpRow={props.lpRow} />
      </AsyncBoundary>
    </FlashSaleContainer>
  );
};
