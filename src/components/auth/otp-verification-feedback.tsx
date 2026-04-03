import { useTranslations } from "next-intl";

import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface OtpVerificationFeedbackProps {
  className?: string;
  variant: "page" | "popup";
}

export function OtpVerificationFeedback({
  className,
  variant,
}: OtpVerificationFeedbackProps) {
  const namespace =
    variant === "popup"
      ? "HomePage.header.otpLogin"
      : "HomePage.header.mobileOtpLogin";
  const t = useTranslations(namespace);

  return (
    <div
      className={cn(
        "border-border-brand-soft bg-label-primary mx-auto flex w-fit max-w-full flex-row gap-2.5 rounded-xl border p-5",
        className
      )}
    >
      <div className="flex shrink-0 items-center gap-2.5">
        <Spinner className="size-5 shrink-0" size={20} variant="dark" />
        <span className="text-text-primary text-xs font-semibold">
          {t("otpStep.verifyingButton")}
        </span>
      </div>

      <p className="text-text-primary whitespace-pre-line text-start text-xs font-normal">
        {t("otpStep.verifyingDescription")}
      </p>
    </div>
  );
}
