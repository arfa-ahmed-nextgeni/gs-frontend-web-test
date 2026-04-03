import { AddDeliveryAddressPageContent } from "@/components/checkout/add-delivery-address/add-delivery-address-page-content";

export default async function AddDeliveryAddressPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  return <AddDeliveryAddressPageContent searchParams={searchParams} />;
}
