"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PhoneNumberInput } from "@/components/ui/phone-number-input";
import { useCustomerQuery } from "@/hooks/queries/use-customer-query";
import { updateProfileFromAddress } from "@/lib/actions/customer/update-profile";
import { StoreCode } from "@/lib/constants/i18n";
import { cn } from "@/lib/utils";
import { getDefaultCountryCode, getPhoneDetails } from "@/lib/utils/country";
import { isOk } from "@/lib/utils/service-result";

const createJoinSchema = (hasPhoneNumber: boolean) =>
  z.object({
    email: z.string().email("Please enter a valid email address"),
    phoneNumber: hasPhoneNumber
      ? z.object({
          countryCode: z.string(),
          number: z.string(),
        })
      : z.object({
          countryCode: z.string().min(1, "Country code is required"),
          number: z
            .string()
            .min(1, "Phone number is required")
            .regex(
              /^5\d{8}$/,
              "Phone number must start with 5 and be 9 digits"
            ),
        }),
  });

type JoinFormData = z.infer<ReturnType<typeof createJoinSchema>>;

interface JoinModalProps {
  onClose: () => void;
  onJoin?: (data: JoinFormData) => void;
  open: boolean;
  storeCode?: StoreCode;
}

const getJoinPhoneDefaultValue = (
  phoneNumber: null | string | undefined,
  fallbackCountryCode: string
) => {
  if (!phoneNumber) {
    return {
      countryCode: fallbackCountryCode,
      number: "",
    };
  }

  const parsedPhone = getPhoneDetails(phoneNumber);
  if (parsedPhone.countryCode && parsedPhone.number) {
    return parsedPhone;
  }

  const fallbackCountryDigits = fallbackCountryCode.replace(/\D/g, "");
  let normalizedNumber = phoneNumber.replace(/\D/g, "");

  if (
    fallbackCountryDigits &&
    normalizedNumber.startsWith(fallbackCountryDigits)
  ) {
    normalizedNumber = normalizedNumber.slice(fallbackCountryDigits.length);
  }

  if (normalizedNumber.startsWith("0") && normalizedNumber.length > 1) {
    normalizedNumber = normalizedNumber.slice(1);
  }

  return {
    countryCode: fallbackCountryCode,
    number: normalizedNumber,
  };
};

export function JoinModal({
  onClose,
  onJoin,
  open,
  storeCode = "sa_en" as StoreCode,
}: JoinModalProps) {
  const t = useTranslations("JoinModal");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: currentCustomer } = useCustomerQuery();
  const countryCode = getDefaultCountryCode(storeCode);
  const resolvedPhoneNumber = currentCustomer?.phoneNumber;

  const parsedPhoneNumber = useMemo(() => {
    return getJoinPhoneDefaultValue(resolvedPhoneNumber, countryCode);
  }, [countryCode, resolvedPhoneNumber]);
  const hasPhoneNumber = parsedPhoneNumber.number.length > 0;

  const {
    control,
    formState: { errors, isValid },
    handleSubmit,
    register,
    setValue,
    watch,
  } = useForm<JoinFormData>({
    defaultValues: {
      email: "",
      phoneNumber: parsedPhoneNumber,
    },
    mode: "onChange",
    resolver: zodResolver(createJoinSchema(hasPhoneNumber)),
  });

  const email = watch("email");

  useEffect(() => {
    setValue("phoneNumber", parsedPhoneNumber, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: true,
    });
  }, [parsedPhoneNumber, setValue]);

  const onSubmit = async (data: JoinFormData) => {
    setIsSubmitting(true);
    try {
      // Only update email address
      const result = await updateProfileFromAddress({
        email: data.email,
      });

      if (isOk(result)) {
        if (onJoin) {
          onJoin(data);
        }
        onClose();
      } else {
        console.error("Failed to update email:", result.error);
      }
    } catch (error) {
      console.error("Error updating email:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog onOpenChange={onClose} open={open}>
      <DialogContent className="fixed bottom-0 left-0 right-0 top-auto h-auto max-h-[90dvh] !w-full !max-w-full translate-x-0 translate-y-0 gap-0 overflow-y-auto rounded-none p-0 pb-[max(30px,_env(safe-area-inset-bottom))] sm:bottom-auto sm:left-[50%] sm:right-auto sm:top-[50%] sm:h-[426px] sm:max-h-[90vh] sm:!w-[400px] sm:!max-w-[400px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:overflow-y-auto sm:rounded-3xl sm:pb-0">
        {/* Header */}
        <div className="space-y-2 px-6 pb-6 pt-8 sm:pt-6">
          <h2 className="pt-4 text-center text-[20px] font-normal text-[#374957] lg:text-[35px]">
            {t("title")}
          </h2>
          <p className="px-1.5 text-center text-[14px] leading-relaxed text-gray-500">
            {t("description")}
          </p>
        </div>

        {/* Form Content */}
        <form className="space-y-3 px-6 pb-6" onSubmit={handleSubmit(onSubmit)}>
          {/* Phone Number Field */}
          <Controller
            control={control}
            name="phoneNumber"
            render={({ field }) => (
              <PhoneNumberInput
                disabled={hasPhoneNumber}
                name={field.name}
                onChange={field.onChange}
                success={!!(field.value?.countryCode && field.value?.number)}
                value={field.value || { countryCode: "", number: "" }}
              />
            )}
          />

          {/* Email Field */}
          <div className="mt-[20px]">
            <Input
              autoFocus
              className={cn(
                "h-[50px] rounded-xl text-[18px] placeholder:text-[#BDC2C5] focus:border focus:border-[#374957] focus:bg-white focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0",
                email
                  ? "border border-[#374957] bg-white"
                  : "border-0 bg-[#F3F3F3]",
                errors.email && "border-[#FE5000]"
              )}
              id="email"
              placeholder={t("email.placeholder")}
              type="email"
              {...register("email")}
            />
          </div>

          {/* Join Button */}
          <Button
            className={cn(
              "mt-6 h-[50px] w-full rounded-xl text-[20px] font-normal transition-colors",
              isValid
                ? "bg-[#374957] text-white hover:bg-[#2a3740]"
                : "bg-[#D9D9D9] text-white"
            )}
            disabled={!isValid || isSubmitting}
            type="submit"
          >
            {isSubmitting ? t("joining") || "Joining..." : t("joinButton")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
