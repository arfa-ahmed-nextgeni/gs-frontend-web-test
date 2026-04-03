import { cn } from "@/lib/utils";

export default function CustomerCardsLoading() {
  return (
    <div className="lg:mt-12.5 mt-2.5 flex flex-col gap-2.5 px-5 lg:px-0">
      <div className="bg-bg-default flex h-12 w-full animate-pulse items-center justify-center rounded-xl shadow-[0_1px_0_0_var(--color-bg-surface)]">
        <span className="w-35 h-5 rounded bg-gray-200" />
      </div>
      <div className="gap-1.25 grid grid-cols-1 lg:grid-cols-2 lg:gap-2.5">
        {[...Array(4)].map((_, index) => (
          <div
            className={cn(
              "bg-bg-default flex flex-col rounded-xl shadow-[0_1px_0_0_var(--color-bg-surface)]",
              {
                "bg-bg-surface lg:bg-bg-default": index !== 0,
              }
            )}
            key={index}
          >
            <div className="h-12.5 border-border-base flex animate-pulse flex-row items-center justify-between border-b px-5">
              <span className="w-7.5 h-5 rounded bg-gray-200" />
              <div className="flex flex-row gap-2.5">
                <span className="h-4 w-20 rounded bg-gray-200" />
                <span className="w-4.5 h-4 rounded bg-gray-200" />
              </div>
              <div className="flex flex-row gap-2.5">
                <span className="h-4 w-8 rounded bg-gray-200" />
                <span className="h-4 w-8 rounded bg-gray-200" />
              </div>
            </div>
            <div
              className={cn(
                "h-11.25 flex animate-pulse flex-row items-center justify-between px-5",
                {
                  "hidden lg:flex": index !== 0,
                }
              )}
            >
              {index === 0 ? (
                <span className="w-18.5 h-6 rounded-xl bg-gray-200" />
              ) : (
                <span className="h-6 w-24 rounded-xl bg-gray-200" />
              )}
              <span className="w-15.5 h-4 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
