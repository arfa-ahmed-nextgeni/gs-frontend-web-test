"use client";

import React from "react";
import { useFormContext } from "react-hook-form";

import Image from "next/image";

import ForwardArrowIcon from "@/assets/icons/forward-arrow-icon.svg";
import { useAddressFormContext } from "@/contexts/address-form-context";
import { AddressFormSchemaType } from "@/lib/forms/manage-address";

export const AddressStepBreadcrumb = () => {
  const { currentStep, goToStep, selectedStep, steps } =
    useAddressFormContext();

  const { getValues } = useFormContext<AddressFormSchemaType>();

  return (
    <div className="flex flex-wrap items-center gap-2.5 px-5 pt-5">
      {steps.slice(0, currentStep).map((step, index) => {
        const stepSelectedValue = getValues(step.type as any);

        return (
          <React.Fragment key={step.title}>
            <button
              className="h-6.25 bg-btn-bg-surface text-text-secondary flex max-w-28 items-center justify-center rounded-xl px-2.5 text-sm font-medium"
              onClick={() => goToStep(index)}
              type="button"
            >
              <p className="truncate">{stepSelectedValue?.label}</p>
            </button>
            <Image
              alt="Forward"
              className="rtl:rotate-180"
              src={ForwardArrowIcon}
            />
          </React.Fragment>
        );
      })}
      <p className="text-text-secondary text-sm font-medium">
        {selectedStep?.title}
      </p>
    </div>
  );
};
