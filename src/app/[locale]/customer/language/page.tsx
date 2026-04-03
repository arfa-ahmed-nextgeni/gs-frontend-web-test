import { LanguageSwitchForm } from "@/components/customer/language/language-switch-form";
import { initializePageLocale } from "@/lib/utils/locale";

export default async function LanguagePage({
  params,
}: PageProps<"/[locale]/customer/language">) {
  const { locale } = await params;

  initializePageLocale(locale);

  return <LanguageSwitchForm />;
}
