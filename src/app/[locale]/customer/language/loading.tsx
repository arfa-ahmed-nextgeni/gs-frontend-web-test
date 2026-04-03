import { LANGUAGE_SWITCH_OPTIONS } from "@/lib/constants/i18n";

export default function LanguageLoading() {
  return (
    <div className="gap-7.5 mt-7.5 flex flex-col">
      <div className="flex animate-pulse flex-col gap-5">
        <span className="w-15 mx-5 h-4 rounded bg-gray-200" />
        <div className="flex flex-col gap-0">
          {LANGUAGE_SWITCH_OPTIONS.map((option) => (
            <div
              className="h-12.5 bg-bg-default border-border-base flex items-center justify-between border-b px-5"
              key={option.value}
            >
              <div className="flex flex-1 flex-row items-center gap-5">
                <span className="w-6.5 h-5 rounded bg-gray-200" />
                <span className="w-17 h-4 rounded bg-gray-200" />
              </div>
              <span className="size-5 rounded-full bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
