"use client";

import { useRef } from "react";

import Image from "next/image";

import SearchIcon from "@/assets/icons/search-icon.svg";
import { useAddressFormContext } from "@/contexts/address-form-context";

export const AddressStepSearchInput = ({
  searchQuery,
  setSearchQueryAction,
}: {
  searchQuery: string;
  setSearchQueryAction: (value: string) => void;
}) => {
  const { selectedStep } = useAddressFormContext();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="px-5">
      <div className="relative">
        <span className="absolute inset-y-0 start-0 flex items-center ps-5">
          <Image
            alt="search"
            className="size-5 rtl:rotate-90"
            height={20}
            src={SearchIcon}
            width={20}
          />
        </span>
        <input
          className="bg-bg-default focus:border-border-primary focus:bg-bg-body text-text-primary focus:outline-border-primary placeholder:text-text-placeholder rounded-4xl ps-15 block w-full border-none py-2 pe-5 text-base font-normal shadow-sm [appearance:textfield] focus:outline-[0.5px] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          onChange={(e) => setSearchQueryAction(e.target.value)}
          onClick={() => inputRef.current?.focus()}
          placeholder={selectedStep?.searchPlaceholder}
          ref={inputRef}
          type="text"
          value={searchQuery}
        />
      </div>
    </div>
  );
};
