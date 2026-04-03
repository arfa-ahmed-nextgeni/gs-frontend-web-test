import { AddPickupPointPageContent } from "@/components/checkout/add-pickup-point/add-pickup-point-page-content";

export default async function AddPickupPointPage({
  searchParams,
}: PageProps<"/[locale]/checkout/add-pickup-point">) {
  return <AddPickupPointPageContent searchParams={searchParams} />;
}
