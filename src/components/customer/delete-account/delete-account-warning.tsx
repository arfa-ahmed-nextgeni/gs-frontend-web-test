import Image from "next/image";

import { useTranslations } from "next-intl";

import BrokenHeartIcon from "@/assets/icons/broken-heart-icon.svg";
import { AlertDescription } from "@/components/ui/alert/alert-description";
import { AlertTitle } from "@/components/ui/alert/alert-title";
import { cn } from "@/lib/utils";

export function DeleteAccountWarning() {
  const t = useTranslations("DeleteAccountPage");

  return (
    <div
      className={cn(
        "gap-3.75 py-3.75 bg-bg-warm mx-5 flex flex-row rounded-xl px-5",
        "bg-[radial-gradient(212px_circle_at_-42px,#ffa20033_0%,#ffa20033_0%,transparent_100%)] rtl:bg-[radial-gradient(212px_circle_at_calc(100%+42px),#ffa20033_0%,#ffa20033_0%,transparent_100%)]"
      )}
    >
      <Image alt="broken heart" src={BrokenHeartIcon} />
      <div className="gap-1.8 flex flex-col">
        <AlertTitle className="text-text-primary text-base font-semibold">
          {t("warning.title")}
        </AlertTitle>
        <AlertDescription className="text-text-secondary text-sm font-medium">
          {t("warning.message")}
        </AlertDescription>
      </div>
    </div>
  );
}
