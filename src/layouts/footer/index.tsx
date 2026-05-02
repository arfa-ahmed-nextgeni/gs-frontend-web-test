import { Copyright } from "@/layouts/footer/copyright";
import { FooterContact } from "@/layouts/footer/footer-contact";
import { FooterNav } from "@/layouts/footer/footer-nav";
import { FooterPromotion } from "@/layouts/footer/footer-promotion";

import type { WebsiteFooter } from "@/lib/models/website-footer";

export const Footer = ({
  hidePromotion = false,
  websiteFooter,
}: {
  hidePromotion?: boolean;
  websiteFooter: undefined | WebsiteFooter;
}) => {
  if (!websiteFooter) return null;
  return (
    <footer className="bg-bg-body lg:mt-25 mt-5">
      {!hidePromotion && websiteFooter.promoAndFeatures?.promoBar && (
        <FooterPromotion promoBar={websiteFooter.promoAndFeatures.promoBar} />
      )}
      {websiteFooter.contactAndSocialLinks && (
        <FooterContact
          contactSection={websiteFooter.contactAndSocialLinks.contactSection}
          socialSection={websiteFooter.contactAndSocialLinks.socialSection}
        />
      )}
      {websiteFooter.footerLinks && (
        <FooterNav
          appSection={websiteFooter.footerLinks.appSection}
          navSection={websiteFooter.footerLinks.footerSections}
        />
      )}
      {websiteFooter.copyrightText && (
        <Copyright copyrightText={websiteFooter.copyrightText} />
      )}
    </footer>
  );
};
