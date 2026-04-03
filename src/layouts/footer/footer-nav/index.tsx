import Container from "@/components/shared/container";
import { FooterAppLinks } from "@/layouts/footer/footer-nav/footer-app-links";
import { FooterNavLinks } from "@/layouts/footer/footer-nav/footer-nav-links";
import { WebsiteFooterLinks } from "@/lib/models/website-footer";

type FooterAppSection = WebsiteFooterLinks["appSection"];
type FooterNavSection = WebsiteFooterLinks["footerSections"];

export const FooterNav = ({
  appSection,
  navSection,
}: {
  appSection: FooterAppSection;
  navSection: FooterNavSection;
}) => {
  return (
    <Container
      className="border-border-base bg-bg-default border-t"
      variant="FullWidth"
    >
      <Container className="grid grid-cols-1 gap-8 py-6 lg:grid-cols-5 lg:gap-0 lg:py-8">
        <FooterAppLinks appSection={appSection} />
        <div className="col-span-1 hidden lg:block" />
        {navSection.map((data, idx) => (
          <FooterNavLinks
            data={data}
            key={`footer-nav-key${data.title}-${idx}`}
          />
        ))}
      </Container>
    </Container>
  );
};
