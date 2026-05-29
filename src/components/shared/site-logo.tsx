import type { CSSProperties } from "react";

import { locale as rootLocale } from "next/root-params";

import { GoldenScentLogo } from "@/components/icons/golden-scent-logo";
import { ContentfulImage } from "@/components/shared/contentful-image";
import { getSiteLogoData } from "@/lib/actions/contentful/get-site-logo-data";
import { cn } from "@/lib/utils";

interface SiteLogoProps {
  className?: string;
  preserveIntrinsicHeight?: boolean;
}

export async function SiteLogo({
  className,
  preserveIntrinsicHeight = true,
}: SiteLogoProps) {
  const locale = await rootLocale();
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
  const imageStyle: CSSProperties | undefined = preserveIntrinsicHeight
    ? { height: "auto" }
    : undefined;

  return (
    <>
      <ContentfulImage
        alt={altText}
        className={cn("block lg:hidden", className)}
        height={30}
        src={mobileLogoUrl}
        style={imageStyle}
        width={mobileLogoWidth}
      />
      <ContentfulImage
        alt={altText}
        className={cn("hidden lg:block", className)}
        height={40}
        src={desktopLogoUrl}
        style={imageStyle}
        width={desktopLogoWidth}
      />
    </>
  );
}
