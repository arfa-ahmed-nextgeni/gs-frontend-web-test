"use client";

import { useEffect, useRef } from "react";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useTranslations } from "next-intl";

import { SearchTracker } from "@/components/analytics/search-tracker";
import { CloseIcon } from "@/components/icons/close-icon";
import {
  useSearchActions,
  useSearchUiState,
} from "@/components/search/search-container";
import { SearchForm } from "@/components/search/search-form";
import { SearchResults } from "@/components/search/search-results";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import useBodyScroll from "@/hooks/use-body-scroll";

export const MobileSearchDialog = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  const { closeMobileSearch, handleAutoSearch, handleSearch } =
    useSearchActions();
  const { queryText, showMobileSearch } = useSearchUiState();

  useBodyScroll(showMobileSearch);

  useEffect(() => {
    if (showMobileSearch && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showMobileSearch]);

  const t = useTranslations("HomePage.header.search");

  return (
    <>
      <SearchTracker trackInit={showMobileSearch} />
      <Dialog open={showMobileSearch}>
        <VisuallyHidden>
          <DialogTitle>Search</DialogTitle>
          <DialogDescription>{t("mobilePlaceholder")}</DialogDescription>
        </VisuallyHidden>
        <DialogContent
          className="max-w-auto flex h-dvh w-full flex-col gap-0 rounded-none border-none p-0"
          showCloseButton={false}
        >
          <div className="mx-auto flex w-full flex-row gap-5 px-2.5 py-1.5">
            <SearchForm
              inputProps={{
                className: "focus:bg-bg-surface",
                name: "mobile-search",
                onChange: handleAutoSearch,
                ref: inputRef,
              }}
              onSubmit={handleSearch}
              placeholder={t("mobilePlaceholder")}
              searchId="mobile-search"
              value={queryText}
            />

            <DialogClose asChild>
              <button onClick={closeMobileSearch}>
                <CloseIcon />
              </button>
            </DialogClose>
          </div>
          <SearchResults inputFocus={showMobileSearch} isMobile />
        </DialogContent>
      </Dialog>
    </>
  );
};
