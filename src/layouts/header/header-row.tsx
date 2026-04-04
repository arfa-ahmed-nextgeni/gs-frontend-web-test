import SearchIcon from "@/components/icons/search-icon";
import Container from "@/components/shared/container";
import { HeaderRowShell } from "@/layouts/header/header-row-shell";
import { ZIndexLevel } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

export const HeaderRow = ({
  zIndexLevel = ZIndexLevel.z40,
}: {
  hoverZIndexLevel?: ZIndexLevel;
  isSticky?: boolean;
  zIndexLevel?: ZIndexLevel;
}) => {
  // const defaultHeaderContent = (
  //   <>
  //     {/* <Link aria-label="Home" href={ROUTES.ROOT} title="Go to homepage">
  //       <GoldenScentLogo />
  //     </Link> */}
  //     <Suspense>
  //       <SearchBar isSticky={isSticky} />
  //     </Suspense>
  //   </>
  // );

  // const desktopHeaderActionsFallback = (
  //   <div aria-hidden="true" className="flex flex-row items-center gap-5">
  //     <div className="relative flex h-auto shrink-0 transform items-center justify-center">
  //       <CartIcon />
  //     </div>
  //     <div className="relative">
  //       <div className="cart-button">
  //         <ProfileIcon />
  //       </div>
  //     </div>
  //     {isSticky ? <MenuIcon /> : null}
  //   </div>
  // );

  return (
    <Container
      className={cn(
        "border-border-base bg-bg-default relative border-b",
        zIndexLevel,
      )}
      variant="FullWidth"
    >
      <HeaderRowShell>
        <div className="flex-1">
          <div className="relative z-30 mx-auto flex w-full shrink-0 flex-col justify-center">
            <form className="relative flex w-full" noValidate role="search">
              <span className="ltr:lg:left-7.5 rtl:lg:right-7.5 absolute top-0 flex h-full shrink-0 items-center justify-center focus:outline-none ltr:left-5 rtl:right-5">
                <SearchIcon />
              </span>
              <label className="flex flex-1 items-center py-0.5">
                <input
                  autoComplete="off"
                  className={cn(
                    "rounded-4xl text-text-primary lg:ltr:pl-17.5 lg:rtl:pr-17.5 ltr:pl-12.5 rtl:pr-12.5 placeholder:text-text-placeholder bg-bg-surface focus:bg-bg-default w-full border-none py-[10px] text-base font-normal outline-none focus:border-transparent focus:ring-0 lg:text-sm ltr:pr-5 lg:ltr:pr-12 rtl:pl-5 lg:rtl:pl-12",
                  )}
                  placeholder="Search all brands..."
                />
              </label>
            </form>
          </div>
        </div>
        {/* <DeferredMobileTopBar fallback={defaultHeaderContent} /> */}

        {/* <div className="hidden h-full flex-row gap-7 lg:flex">
          <AsyncBoundary fallback={<RegionLanguageSwitcherSkeleton />}>
            <RegionLanguageSwitcher hoverZIndexLevel={hoverZIndexLevel} />
          </AsyncBoundary>
          <DeferredDesktopHeaderActions
            fallback={desktopHeaderActionsFallback}
            hoverZIndexLevel={hoverZIndexLevel}
            isSticky={isSticky}
          />
        </div> */}

        {/* <MobileMenuButton isSticky={isSticky} /> */}
      </HeaderRowShell>
    </Container>
  );
};
