"use client";

import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { DeferredMobileSearchDialog } from "@/components/search/mobile-search/deferred-mobile-search-dialog";
import { SearchContainer } from "@/components/search/search-container";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useIsScrolling } from "@/hooks/use-is-scrolling";
import { useResponsiveValue } from "@/hooks/use-responsive-value";
import { useWindowScrollThreshold } from "@/hooks/use-window-scroll-threshold";
import { ZIndexLevel } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

type HeaderActionsContextType = {
  closeMobileNavigationMenu: () => void;
  toggleDesktopNavigation: () => void;
  toggleStaticMobileNavigation: () => void;
  toggleStickyMobileNavigation: () => void;
};

type HeaderContextType = {
  showDesktopNavigation: boolean;
  showStaticMobileNavigation: boolean;
  showStickyMobileNavigation: boolean;
};

const HeaderActionsContext = createContext<
  HeaderActionsContextType | undefined
>(undefined);
const HeaderStateContext = createContext<HeaderContextType | undefined>(
  undefined
);

export const HeaderContainer = ({ children }: PropsWithChildren) => {
  const [showDesktopNavigation, setShowDesktopNavigation] = useState(false);
  const [showStaticMobileNavigation, setShowStaticMobileNavigation] =
    useState(false);
  const [showStickyMobileNavigation, setShowStickyMobileNavigation] =
    useState(false);

  const isScrolling = useIsScrolling();

  const topOffset = useResponsiveValue({ lg: 160 }, 100);
  const isPastTopOffset = useWindowScrollThreshold(topOffset);

  const isMobile = useIsMobile();

  const closeMobileNavigationMenu = useCallback(() => {
    setShowStaticMobileNavigation(false);
    setShowStickyMobileNavigation(false);
  }, []);

  useEffect(() => {
    if (!isPastTopOffset) {
      setShowDesktopNavigation(false);
    }

    if (isScrolling) {
      closeMobileNavigationMenu();
    }
  }, [closeMobileNavigationMenu, isPastTopOffset, isScrolling]);

  const toggleDesktopNavigation = useCallback(() => {
    setShowDesktopNavigation((prev) => !prev);
  }, []);

  const toggleStaticMobileNavigation = useCallback(() => {
    setShowStaticMobileNavigation((prev) => !prev);
  }, []);

  const toggleStickyMobileNavigation = useCallback(() => {
    setShowStickyMobileNavigation((prev) => !prev);
  }, []);

  const headerActionsValue = useMemo(
    () => ({
      closeMobileNavigationMenu,
      toggleDesktopNavigation,
      toggleStaticMobileNavigation,
      toggleStickyMobileNavigation,
    }),
    [
      closeMobileNavigationMenu,
      toggleDesktopNavigation,
      toggleStaticMobileNavigation,
      toggleStickyMobileNavigation,
    ]
  );

  const headerStateValue = useMemo(
    () => ({
      showDesktopNavigation,
      showStaticMobileNavigation,
      showStickyMobileNavigation,
    }),
    [
      showDesktopNavigation,
      showStaticMobileNavigation,
      showStickyMobileNavigation,
    ]
  );

  return (
    <HeaderActionsContext.Provider value={headerActionsValue}>
      <HeaderStateContext.Provider value={headerStateValue}>
        <SearchContainer>
          <header
            className={cn(
              "site-header bg-bg-default top-0 w-full",
              isPastTopOffset && "is-scrolling",
              ZIndexLevel.z50
            )}
          >
            <DeferredMobileSearchDialog isMobile={isMobile} />
            {children}
          </header>
        </SearchContainer>
      </HeaderStateContext.Provider>
    </HeaderActionsContext.Provider>
  );
};

export const useHeaderActions = () => {
  const context = useContext(HeaderActionsContext);
  if (!context) {
    throw new Error("useHeaderActions must be used within a HeaderContainer");
  }
  return context;
};

export const useHeaderContext = () => {
  return {
    ...useHeaderActions(),
    ...useHeaderState(),
  };
};

export const useHeaderState = () => {
  const context = useContext(HeaderStateContext);
  if (!context) {
    throw new Error("useHeaderState must be used within a HeaderContainer");
  }
  return context;
};
