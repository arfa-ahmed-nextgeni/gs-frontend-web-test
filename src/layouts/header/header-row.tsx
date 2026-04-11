import { AsyncBoundary } from "@/components/common/async-boundary";
import { CartIcon } from "@/components/icons/cart-icon";
import { GoldenScentLogo } from "@/components/icons/golden-scent-logo";
import { MenuIcon } from "@/components/icons/menu-icon";
import { ProfileIcon } from "@/components/icons/profile-icon";
import { SearchBar } from "@/components/search/search-bar";
import Container from "@/components/shared/container";
import { Link } from "@/i18n/navigation";
import { DeferredDesktopHeaderActions } from "@/layouts/header/deferred-desktop-header-actions";
import { DeferredMobileTopBar } from "@/layouts/header/deferred-mobile-top-bar";
import { HeaderRowShell } from "@/layouts/header/header-row-shell";
import { MobileMenuButton } from "@/layouts/header/mobile-menu-button";
import { RegionLanguageSwitcher } from "@/layouts/header/region-language-switcher";
import { RegionLanguageSwitcherSkeleton } from "@/layouts/header/region-language-switcher-skeleton";
import { ROUTES } from "@/lib/constants/routes";
import { ZIndexLevel } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

export const HeaderRow = ({
  hoverZIndexLevel = ZIndexLevel.z25,
  isSticky = false,
  zIndexLevel = ZIndexLevel.z40,
}: {
  hoverZIndexLevel?: ZIndexLevel;
  isSticky?: boolean;
  zIndexLevel?: ZIndexLevel;
}) => {
  const defaultHeaderContent = (
    <>
      <Link aria-label="Home" href={ROUTES.ROOT} title="Go to homepage">
        <GoldenScentLogo />
      </Link>
      <SearchBar isSticky={isSticky} />
    </>
  );

  const desktopHeaderActionsFallback = (
    <div aria-hidden="true" className="flex flex-row items-center gap-5">
      <div className="relative flex h-auto shrink-0 transform items-center justify-center">
        <CartIcon />
      </div>
      <div className="relative">
        <div className="cart-button">
          <ProfileIcon />
        </div>
      </div>
      {isSticky ? <MenuIcon /> : null}
    </div>
  );

  return (
    <Container
      className={cn(
        "border-border-base bg-bg-default relative border-b",
        zIndexLevel,
      )}
      variant="FullWidth"
    >
      <HeaderRowShell>
        <DeferredMobileTopBar fallback={defaultHeaderContent} />

        <div className="hidden h-full flex-row gap-7 lg:flex">
          <AsyncBoundary fallback={<RegionLanguageSwitcherSkeleton />}>
            <RegionLanguageSwitcher hoverZIndexLevel={hoverZIndexLevel} />
          </AsyncBoundary>
          <DeferredDesktopHeaderActions
            fallback={desktopHeaderActionsFallback}
            hoverZIndexLevel={hoverZIndexLevel}
            isSticky={isSticky}
          />
        </div>

        <MobileMenuButton isSticky={isSticky} />
      </HeaderRowShell>
    </Container>
  );
};
