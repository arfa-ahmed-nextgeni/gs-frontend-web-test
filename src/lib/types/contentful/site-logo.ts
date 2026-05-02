export type SiteLogoData = {
  fields: {
    altText: string;
    desktopLogo: SiteLogoAsset;
    desktopLogoWidth?: number;
    internalName?: string;
    linkUrl?: string;
    mobileLogo: SiteLogoAsset;
    mobileLogoWidth?: number;
    useSameLogoForMobile?: boolean;
  };
};

type SiteLogoAsset = {
  fields: {
    file: {
      url: string;
    };
    title?: string;
  };
};
