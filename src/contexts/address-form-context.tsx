"use client";

import {
  createContext,
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { UseFormReturn } from "react-hook-form";

import { useTranslations } from "next-intl";

import { useAddressForm } from "@/components/customer/addresses/manage-address/hooks/use-address-form";
import { useMobileTopBarContext } from "@/contexts/mobile-top-bar-context";
import { useStoreCode } from "@/hooks/i18n/use-store-code";
import { useRouter } from "@/i18n/navigation";
import { ADD_ADDRESS_STEPS, AddressStepType } from "@/lib/constants/address";
import { AddressFormSchemaType } from "@/lib/forms/manage-address";
import { CustomerAddress } from "@/lib/models/customer-addresses";

export type AddressFormContextType = {
  addressForm: UseFormReturn<
    AddressFormSchemaType,
    unknown,
    AddressFormSchemaType
  >;
  closeDrawer: () => void;
  currentStep: number;
  customerData?: {
    email?: null | string;
    firstName?: null | string;
    lastName?: null | string;
    phoneNumber?: null | string;
  };
  goToStep: (step: number) => void;
  handleSubmitForm: (e?: React.BaseSyntheticEvent) => Promise<void>;
  hasNavigatedSteps: boolean;
  isEditMode: boolean;
  isFirstAddressInCheckout: boolean;
  nextStep: () => void;
  prevStep: () => void;
  rootBackAction: () => void;
  selectedStep: {
    searchPlaceholder: string;
    shortTitle: string;
    title: string;
    type: AddressStepType;
  } | null;
  setCurrentStep: Dispatch<SetStateAction<number>>;
  setHasNavigatedSteps: Dispatch<SetStateAction<boolean>>;
  setSkipArea: Dispatch<SetStateAction<boolean>>;
  setSkipState: Dispatch<SetStateAction<boolean>>;
  steps: {
    searchPlaceholder: string;
    shortTitle: string;
    title: string;
    type: AddressStepType;
  }[];
};

const AddressFormContext = createContext<AddressFormContextType | undefined>(
  undefined
);

export const AddressFormContextProvider = ({
  children,
  customerAddress,
  customerData,
  initialAddressLabel,
  initialSkipArea = false,
  initialSkipState = false,
  isFirstAddressInCheckout = false,
  onClose,
  onRootBack,
  onSuccess,
}: React.PropsWithChildren<{
  customerAddress?: {
    countryLabel?: string;
    stateLabel?: string;
  } & CustomerAddress;
  customerData?: {
    email?: null | string;
    firstName?: null | string;
    lastName?: null | string;
    phoneNumber?: null | string;
  };
  initialAddressLabel?: string;
  initialSkipArea?: boolean;
  initialSkipState?: boolean;
  isFirstAddressInCheckout?: boolean;
  onClose?: () => void;
  onRootBack?: () => void;
  onSuccess?: () => void;
}>) => {
  const t = useTranslations("CustomerAddAddressPage");
  const router = useRouter();
  const { isGlobal } = useStoreCode();
  const { setHandleBack } = useMobileTopBarContext();

  const isEditMode = !!customerAddress;

  const [skipArea, setSkipArea] = useState(initialSkipArea);
  const [skipState, setSkipState] = useState(initialSkipState);
  const [hasNavigatedSteps, setHasNavigatedSteps] = useState(
    isEditMode ? false : true
  );

  const closeDrawer = useCallback(() => {
    setHandleBack(null);
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  }, [onClose, router, setHandleBack]);

  const rootBackAction = useCallback(() => {
    if (onRootBack) {
      onRootBack();
    } else {
      closeDrawer();
    }
  }, [closeDrawer, onRootBack]);

  const { addressForm, handleSubmitForm } = useAddressForm({
    closeDrawer,
    customerAddress,
    customerAddressId: customerAddress?.id,
    customerData,
    initialAddressLabel,
    isFirstAddressInCheckout,
    onSuccess,
  });

  useEffect(() => {
    if (!isEditMode) {
      addressForm.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const steps = useMemo(() => {
    const allSteps = ADD_ADDRESS_STEPS.map((step) => ({
      searchPlaceholder: t(`${step}.searchPlaceholder` as any),
      shortTitle: t(`${step}.shortTitle` as any),
      title: t(`${step}.title` as any),
      type: step,
    }));

    if (isGlobal) {
      return allSteps.filter((step) =>
        skipState
          ? [AddressStepType.Country].includes(step.type)
          : [AddressStepType.Country, AddressStepType.State].includes(step.type)
      );
    }

    return allSteps.filter((step) =>
      skipArea
        ? [AddressStepType.City].includes(step.type)
        : [AddressStepType.Area, AddressStepType.City].includes(step.type)
    );
  }, [isGlobal, skipArea, skipState, t]);

  const [currentStep, setCurrentStep] = useState(() =>
    isEditMode ? steps.length : 0
  );

  useEffect(() => {
    if (currentStep > steps.length) {
      setTimeout(() => {
        setCurrentStep((prev) => Math.min(prev, steps.length));
      }, 0);
    }
  }, [currentStep, steps.length]);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  }, [steps.length]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToStep = useCallback(
    (step: number) => {
      setCurrentStep(Math.max(0, Math.min(step, steps.length)));
    },
    [steps.length]
  );

  useEffect(() => {
    setHandleBack(
      isEditMode
        ? () => {
            rootBackAction();
          }
        : currentStep > 0 && hasNavigatedSteps
          ? prevStep
          : () => {
              rootBackAction();
            }
    );
  }, [
    currentStep,
    hasNavigatedSteps,
    isEditMode,
    prevStep,
    rootBackAction,
    setHandleBack,
  ]);

  const selectedStep = steps[currentStep] ?? null;

  return (
    <AddressFormContext.Provider
      value={{
        addressForm,
        closeDrawer,
        currentStep,
        customerData,
        goToStep,
        handleSubmitForm,
        hasNavigatedSteps,
        isEditMode,
        isFirstAddressInCheckout,
        nextStep,
        prevStep,
        rootBackAction,
        selectedStep,
        setCurrentStep,
        setHasNavigatedSteps,
        setSkipArea,
        setSkipState,
        steps,
      }}
    >
      {children}
    </AddressFormContext.Provider>
  );
};

export const useAddressFormContext = () => {
  const context = useContext(AddressFormContext);
  if (!context) {
    throw new Error(
      "useAddressFormContext must be used within a AddressFormContextProvider"
    );
  }
  return context;
};
