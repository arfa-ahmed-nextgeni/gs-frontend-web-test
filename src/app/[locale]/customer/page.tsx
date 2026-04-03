import { redirect } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants/routes";
import { initializePageLocale } from "@/lib/utils/locale";

export default async function CustomerPage({
  params,
}: PageProps<"/[locale]/customer">) {
  const { locale } = await params;

  initializePageLocale(locale);

  redirect({ href: ROUTES.CUSTOMER.ACCOUNT, locale });
}
