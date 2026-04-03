import Container from "@/components/shared/container";
import { FooterAppLinks } from "@/layouts/footer/footer-nav/footer-app-links";
import { FooterNavLinks } from "@/layouts/footer/footer-nav/footer-nav-links";

export const FooterNav = ({
  appSection,
  navSection,
}: {
  appSection: any;
  navSection: any[];
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
          <FooterNavLinks data={data} key={`footer-nav-key${data.id ?? idx}`} />
        ))}
      </Container>
    </Container>
  );
};
