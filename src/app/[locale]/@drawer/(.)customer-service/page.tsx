import { CustomerServiceContent } from "@/components/shared/customer-service/customer-service-content";
import { CustomerServiceOverlay } from "@/components/shared/customer-service/customer-service-overlay";
import { CustomerServiceTrackOpen } from "@/components/shared/customer-service/customer-service-track-open";
import { getPageLandingData } from "@/lib/actions/contentful/page-landing";
import { initializePageLocale } from "@/lib/utils/locale";

export default async function CustomerServiceDrawerPage({
  params,
}: PageProps<"/[locale]/customer-service">) {
  const { locale } = await params;
  initializePageLocale(locale);

  const pageLandingData = await getPageLandingData({
    locale,
  });

  const contactSection =
    pageLandingData?.websiteFooter?.contactAndSocialLinks?.contactSection;

  return (
    <>
      <CustomerServiceTrackOpen />
      <CustomerServiceOverlay>
        <CustomerServiceContent contactSection={contactSection} />
      </CustomerServiceOverlay>
    </>
  );
}
