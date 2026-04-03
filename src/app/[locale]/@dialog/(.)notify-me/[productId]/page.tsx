import { NotifyMeDialog } from "@/components/dialogs/notify-me-dialog";
import { NotifyMeForm } from "@/components/dialogs/notify-me-dialog/notify-me-form";
import { NavigateBack } from "@/components/navigation/navigate-back";
import { QueryParamsKey } from "@/lib/constants/query-params";
import { ROUTE_PLACEHOLDER } from "@/lib/constants/routes";

export function generateStaticParams() {
  return [{ productId: ROUTE_PLACEHOLDER }];
}

export default async function NotifyMePage({
  params,
  searchParams,
}: PageProps<"/[locale]/notify-me/[productId]">) {
  const productName = (await searchParams)?.[QueryParamsKey.Name];
  const { productId } = await params;

  if (!productId || !productName || typeof productName !== "string") {
    return <NavigateBack />;
  }

  return (
    <NotifyMeDialog productName={productName}>
      <NotifyMeForm productId={productId} />
    </NotifyMeDialog>
  );
}
