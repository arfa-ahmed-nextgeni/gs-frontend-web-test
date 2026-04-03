"use client";

import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { DeferredMobileSearchDialog } from "@/components/search/mobile-search/deferred-mobile-search-dialog";
import { SearchContainer } from "@/components/search/search-container";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useIsScrolling } from "@/hooks/use-is-scrolling";
import { useResponsiveValue } from "@/hooks/use-responsive-value";
import { useScrollClass } from "@/hooks/use-scroll-class";
import { ZIndexLevel } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

type HeaderContextType = {
  closeMobileNavigationMenu: () => void;
  isScrolling: boolean;
  showDesktopNavigation: boolean;
  showStaticMobileNavigation: boolean;
  showStickyMobileNavigation: boolean;
  toggleDesktopNavigation: () => void;
  toggleStaticMobileNavigation: () => void;
  toggleStickyMobileNavigation: () => void;
};

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export const HeaderContainer = ({ children }: PropsWithChildren) => {
  const siteHeaderRef = useRef<HTMLDivElement>(null);

  const [showDesktopNavigation, setShowDesktopNavigation] = useState(false);
  const [showStaticMobileNavigation, setShowStaticMobileNavigation] =
    useState(false);
  const [showStickyMobileNavigation, setShowStickyMobileNavigation] =
    useState(false);

  const isScrolling = useIsScrolling();

  const topOffset = useResponsiveValue({ lg: 160 }, 100);

  useScrollClass(siteHeaderRef as React.RefObject<HTMLElement>, topOffset);

  const isMobile = useIsMobile();

  const closeMobileNavigationMenu = useCallback(() => {
    setShowStaticMobileNavigation(false);
    setShowStickyMobileNavigation(false);
  }, []);

  useEffect(() => {
    const headerEl = siteHeaderRef.current;
    if (!headerEl) return;

    if (!headerEl.classList.contains("is-scrolling")) {
      setShowDesktopNavigation(false);
    }

    if (isScrolling) {
      closeMobileNavigationMenu();
    }
  }, [closeMobileNavigationMenu, isScrolling]);

  const toggleDesktopNavigation = () => {
    setShowDesktopNavigation((prev) => !prev);
  };

  const toggleStaticMobileNavigation = () => {
    setShowStaticMobileNavigation((prev) => !prev);
  };

  const toggleStickyMobileNavigation = () => {
    setShowStickyMobileNavigation((prev) => !prev);
  };

  return (
    <HeaderContext.Provider
      value={{
        closeMobileNavigationMenu,
        isScrolling,
        showDesktopNavigation,
        showStaticMobileNavigation,
        showStickyMobileNavigation,
        toggleDesktopNavigation,
        toggleStaticMobileNavigation,
        toggleStickyMobileNavigation,
      }}
    >
      <SearchContainer>
        <header
          className={cn(
            "site-header bg-bg-default top-0 w-full",
            ZIndexLevel.z50
          )}
          ref={siteHeaderRef}
        >
          <DeferredMobileSearchDialog isMobile={isMobile} />
          {children}
        </header>
      </SearchContainer>
    </HeaderContext.Provider>
  );
};

export const useHeaderContext = () => {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error("useHeaderContext must be used within a HeaderContainer");
  }
  return context;
};
