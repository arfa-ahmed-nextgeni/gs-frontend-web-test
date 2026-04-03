import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const LanguageSwitcherLinksSkeleton = ({
  language,
}: {
  language: string;
}) => {
  return (
    <>
      <div
        className={cn(
          "bg-bg-default flex h-5 items-center justify-center rounded-l-md px-1",
          {
            "bg-label-muted-bg rounded-md": language === "en",
          }
        )}
      >
        <Skeleton className="h-3.5 w-5" />
      </div>
      <div
        className={cn(
          "bg-bg-default flex h-5 items-center justify-center rounded-e-md px-1",
          {
            "bg-label-muted-bg rounded-md": language === "ar",
          }
        )}
      >
        <Skeleton className="h-3.5 w-5" />
      </div>
    </>
  );
};
