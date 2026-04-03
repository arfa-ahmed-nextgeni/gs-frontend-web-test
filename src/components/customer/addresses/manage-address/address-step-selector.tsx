"use client";

import React, { useEffect, useRef, useState } from "react";

import { AddressStepBreadcrumb } from "@/components/customer/addresses/manage-address/address-step-breadcrumb";
import { AddressStepOptionsList } from "@/components/customer/addresses/manage-address/address-step-options-list";
import { AddressStepSearchInput } from "@/components/customer/addresses/manage-address/address-step-search-input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAddressFormContext } from "@/contexts/address-form-context";

export const AddressStepSelector = () => {
  const scrollAreaRef = useRef<{ scrollToTop: VoidFunction }>(null);

  const { currentStep } = useAddressFormContext();

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    scrollAreaRef.current?.scrollToTop();
  }, [currentStep]);

  return (
    <div className="flex flex-1 flex-col gap-5">
      <AddressStepBreadcrumb />
      <AddressStepSearchInput
        searchQuery={searchQuery}
        setSearchQueryAction={setSearchQuery}
      />
      <ScrollArea
        className="lg:max-h-auto me-2.5 !max-h-[70dvh] flex-1 flex-col gap-5 overflow-y-auto pe-2.5 ps-5"
        scrollAreaRef={scrollAreaRef}
        type="hover"
      >
        <AddressStepOptionsList
          searchQuery={searchQuery}
          setSearchQueryAction={setSearchQuery}
        />
      </ScrollArea>
    </div>
  );
};
