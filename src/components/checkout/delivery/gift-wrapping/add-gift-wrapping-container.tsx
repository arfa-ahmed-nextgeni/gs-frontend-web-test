import { CheckoutWrappingTracker } from "@/components/analytics/checkout-wrapping-tracker";
import { AddGiftWrappingView } from "@/components/checkout/delivery/gift-wrapping/add-gift-wrapping-view";

interface AddGiftWrappingContainerProps {
  searchParams?: Promise<{ message?: string; sku?: string }>;
}

export const AddGiftWrappingContainer = async ({
  searchParams,
}: AddGiftWrappingContainerProps) => {
  const params = await searchParams;
  const selectedSku = params?.sku;
  const giftMessage = params?.message;

  return (
    <>
      <CheckoutWrappingTracker />
      <AddGiftWrappingView
        giftMessage={giftMessage}
        selectedSku={selectedSku}
      />
    </>
  );
};
