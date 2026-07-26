import type { CSSProperties } from "react";

import Image from "next/image";
import { locale as rootLocale } from "next/root-params";

import FabianLogo from "@/assets/logos/fabian-logo.svg";
import SurratiLogo from "@/assets/logos/surrati-logo.png";
import { GoldenScentLogo } from "@/components/icons/golden-scent-logo";
import { ContentfulImage } from "@/components/shared/contentful-image";
import { getSiteLogoData } from "@/lib/actions/contentful/get-site-logo-data";
import { cn } from "@/lib/utils";
import { getBrandFromLocale } from "@/lib/utils/brand";

interface SiteLogoProps {
  className?: string;
  preserveIntrinsicHeight?: boolean;
}

export async function SiteLogo({
  className,
  preserveIntrinsicHeight = true,
}: SiteLogoProps) {
  const locale = await rootLocale();
  const brand = getBrandFromLocale(locale);

  if (brand === "surrati" || brand === "fabian") {
    return <StaticBrandLogo brand={brand} className={className} />;
  }

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

function StaticBrandLogo({
  brand,
  className,
}: {
  brand: "fabian" | "surrati";
  className?: string;
}) {
  if (brand === "surrati") {
    return (
      <Image
        alt="Surrati"
        className={className}
        height={40}
        src={SurratiLogo}
        style={{ height: "auto" }}
        width={160}
      />
    );
  }
  return (
    <Image
      alt="Fabian x Golden Scent"
      className={className}
      height={40}
      src={FabianLogo}
      style={{ height: "auto" }}
      width={200}
    />
  );
}
