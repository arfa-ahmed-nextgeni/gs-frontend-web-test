import { DeleteAccountForm } from "@/components/customer/delete-account/delete-account-form";
import { DeleteAccountWarning } from "@/components/customer/delete-account/delete-account-warning";
import { initializePageLocale } from "@/lib/utils/locale";

export default async function DeleteAccountPage({
  params,
}: PageProps<"/[locale]/customer/delete-account">) {
  const { locale } = await params;

  initializePageLocale(locale);

  return (
    <div className="mt-2.5 flex flex-col gap-2.5">
      <DeleteAccountWarning />
      <DeleteAccountForm />
    </div>
  );
}
