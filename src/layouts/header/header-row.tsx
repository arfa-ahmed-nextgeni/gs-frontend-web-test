import { AsyncBoundary } from "@/components/common/async-boundary";
import { CartIcon } from "@/components/icons/cart-icon";
import { GoldenScentLogo } from "@/components/icons/golden-scent-logo";
import { SearchBar } from "@/components/search/search-bar";
import Container from "@/components/shared/container";
import { Link } from "@/i18n/navigation";
import { AuthDropdown } from "@/layouts/header/auth-dropdown";
import { CartButton } from "@/layouts/header/cart-button";
import { DesktopNavigationToggleButton } from "@/layouts/header/desktop-navigation-toggle-button";
import { MobileMenuButton } from "@/layouts/header/mobile-menu-button";
import { MobileTopBar } from "@/layouts/header/mobile-top-bar";
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

  return (
    <Container
      className={cn(
        "border-border-base bg-bg-default relative border-b",
        zIndexLevel
      )}
      variant="FullWidth"
    >
      <Container className="flex h-[var(--mobile-header-height)] flex-row items-center gap-5 lg:h-[var(--desktop-header-height)] lg:gap-7">
        <MobileTopBar fallback={defaultHeaderContent} />

        <div className="hidden h-full flex-row gap-7 lg:flex">
          <AsyncBoundary fallback={<RegionLanguageSwitcherSkeleton />}>
            <RegionLanguageSwitcher hoverZIndexLevel={hoverZIndexLevel} />
          </AsyncBoundary>
          <div className="flex flex-row items-center gap-5">
            <CartButton>
              <CartIcon />
            </CartButton>
            <AuthDropdown hoverZIndexLevel={hoverZIndexLevel} />
            {isSticky && <DesktopNavigationToggleButton />}
          </div>
        </div>

        <MobileMenuButton isSticky={isSticky} />
      </Container>
    </Container>
  );
};
