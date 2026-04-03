import { LoginForm } from "@/components/customer/login/login-form";
import { initializePageLocale } from "@/lib/utils/locale";

export default async function CustomerLoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  initializePageLocale(locale);

  return <LoginForm />;
}
