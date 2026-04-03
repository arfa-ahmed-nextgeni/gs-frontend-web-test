import type { CSSProperties } from "react";

import { WebsiteFooterData } from "@/lib/types/contentful/page-landing";

export type WebsiteFooterContactAndSocialLinks = {
  contactSection: {
    contacts: {
      address?: string;
      country?: string;
      iconUrl: string;
      number?: string;
      type: string;
    }[];
    mainIconUrl: string;
  };
  socialSection: {
    links: {
      activeIcon?: string;
      iconUrl: string;
      label: string;
      url: string;
    }[];
    title: string;
  };
};

export type WebsiteFooterLinks = {
  appSection: {
    appLinks: { imageUrl: string; label: string; url: string }[];
    paymentMethods: { imageUrl: string; label: string }[];
    title: string;
  };
  footerSections: {
    links?: { label: string; url: string }[];
    text?: string[];
    title: string;
    verifiedBadge?: { imageUrl: string; label: string; url: string };
  }[];
};

export type WebsiteFooterPromoAndFeatures = {
  promoBar: {
    cta: { label: string; url: string };
    features: {
      highlight: string;
      iconStyles?: CSSProperties;
      iconUrl: string;
      suffix?: string;
      text?: string;
    }[];
    paymentPlanText: string;
  };
};

export class WebsiteFooter {
  public contactAndSocialLinks?: WebsiteFooterContactAndSocialLinks;
  public copyrightText?: {
    content: any[];
    data: any;
    nodeType: string;
  };
  public footerLinks?: WebsiteFooterLinks;
  public internalName?: string;
  public promoAndFeatures?: WebsiteFooterPromoAndFeatures;

  constructor(data: WebsiteFooterData) {
    this.internalName = data.internalName;
    this.promoAndFeatures = data.promoAndFeatures;
    this.contactAndSocialLinks = data.contactAndSocialLinks;
    this.footerLinks = data.footerLinks;
    this.copyrightText = data.copyrightText;
  }
}
