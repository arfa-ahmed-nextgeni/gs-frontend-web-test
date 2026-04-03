export class SiteFooter {
  public appSection: {
    appLinks: {
      image: string;
      url: string;
    }[];
    paymentMethods: {
      id: string;
      image: string;
      path: string;
    }[];
    title: string;
  };

  public contactSection: {
    contacts: {
      iconUrl: string;
      items?: { icon: string; value: string }[];
      value?: string;
    }[];
  };

  public copyrightSection: {
    showBullet?: boolean;
    text: string;
  }[];

  public navSection: {
    id: number;
    lists: {
      id: number;
      image?: any;
      path: string;
      title: string;
    }[];
    type: string;
    widgetTitle: string;
  }[];

  public promotionSection: {
    images: {
      url: string;
    }[];
    titleParts: {
      isSecondary: boolean;
      text: string;
    }[];
  };

  public socialSection: {
    links: {
      activeIcon: string;
      href: string;
      id: string;
      inactiveIcon: string;
    }[];
    title: string;
  };

  constructor(data: any) {
    const {
      appSection,
      contactsSection,
      copyrightSection,
      navSection,
      promotion,
      socialMediaLinks,
      socialSectionTitle,
    } = data;

    this.contactSection = { contacts: contactsSection };
    this.copyrightSection = copyrightSection;
    this.appSection = appSection;

    this.promotionSection = {
      images: promotion.images.map((img: any) => ({
        url: img.fields.file.url,
      })),
      titleParts: [
        {
          isSecondary: promotion.twoToneTitle.firstText.color === "secondary",
          text: promotion.twoToneTitle.firstText.title,
        },
        {
          isSecondary: promotion.twoToneTitle.secondText.color === "secondary",
          text: promotion.twoToneTitle.secondText.title,
        },
      ],
    };

    this.navSection = navSection;

    this.socialSection = {
      links: socialMediaLinks.map((s: any) => ({
        activeIcon: s.fields.activeIcon,
        href: s.fields.path,
        id: s.fields.id,
        inactiveIcon: s.fields.inactiveIcon,
      })),
      title: socialSectionTitle,
    };
  }
}
