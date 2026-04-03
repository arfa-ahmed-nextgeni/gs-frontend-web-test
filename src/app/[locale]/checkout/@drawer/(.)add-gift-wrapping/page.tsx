import { AddGiftWrappingContainer } from "@/components/checkout/delivery/gift-wrapping/add-gift-wrapping-container";

interface PageProps {
  searchParams?: Promise<{ sku?: string }>;
}

export default async function AddGiftWrappingPage({ searchParams }: PageProps) {
  return <AddGiftWrappingContainer searchParams={searchParams} />;
}
