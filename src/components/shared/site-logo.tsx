import { getLocale } from "next-intl/server";

import { GoldenScentLogo } from "@/components/icons/golden-scent-logo";
import { ContentfulImage } from "@/components/shared/contentful-image";
import { getSiteLogoData } from "@/lib/actions/contentful/get-site-logo-data";
import { cn } from "@/lib/utils";

interface SiteLogoProps {
  className?: string;
}

export async function SiteLogo({ className }: SiteLogoProps) {
  const locale = await getLocale();
  const data = await getSiteLogoData({ locale });

  if (!data?.fields?.desktopLogo?.fields?.file?.url) {
    return <GoldenScentLogo className={className} />;
  }

  const {
    altText,
    desktopLogo,
    desktopLogoWidth = 140,
    mobileLogo,
    mobileLogoWidth = 105,
    useSameLogoForMobile = true,
  } = data.fields;

  const effectiveMobileLogo = useSameLogoForMobile ? desktopLogo : mobileLogo;
  const mobileLogoUrl =
    effectiveMobileLogo?.fields?.file?.url ?? desktopLogo.fields.file.url;
  const desktopLogoUrl = desktopLogo.fields.file.url;

  return (
    <>
      <ContentfulImage
        alt={altText}
        className={cn("block lg:hidden", className)}
        height={30}
        src={mobileLogoUrl}
        style={{ height: "auto" }}
        width={mobileLogoWidth}
      />
      <ContentfulImage
        alt={altText}
        className={cn("hidden lg:block", className)}
        height={40}
        src={desktopLogoUrl}
        style={{ height: "auto" }}
        width={desktopLogoWidth}
      />
    </>
  );
}
