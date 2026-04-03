import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale } from "next-intl";

export const SearchSuggestion = ({
  buttonProps,
  list,
  onSuggestionClick,
  title,
}: {
  buttonProps?: {
    onClick: () => void;
    text: string;
    visible: boolean;
  };
  list: string[];
  onSuggestionClick?: (suggestion: string) => void;
  title: string;
}) => {
  const locale = useLocale();
  const ChevronIcon = locale.includes("ar") ? ChevronLeft : ChevronRight;

  return (
    <div className="flex flex-col">
      <h3 className="text-text-primary mx-4 mb-2 text-sm font-semibold">
        {title}
      </h3>
      <div className="flex flex-col">
        {list.map((item, index) => {
          const parts = item.split(" In ");
          const primaryText = parts[0];
          const secondaryText = parts.length > 1 ? `In ${parts[1]}` : "";

          return (
            <div key={item}>
              <button
                className="flex w-full items-center justify-between px-4 py-3 hover:bg-gray-50"
                onClick={() => onSuggestionClick?.(item)}
                type="button"
              >
                <div className="flex flex-col">
                  <span className="text-text-primary text-xs font-normal">
                    {primaryText}
                  </span>
                  {secondaryText && (
                    <span className="text-text-secondary text-xs font-normal">
                      {secondaryText}
                    </span>
                  )}
                </div>
                <ChevronIcon className="h-4 w-4 text-gray-400" />
              </button>
              {index < list.length - 1 && (
                <div className="mx-4 border-b border-gray-100"></div>
              )}
            </div>
          );
        })}
      </div>
      {buttonProps?.visible && (
        <div className="px-4 py-2">
          <button
            className="text-text-danger hover:text-text-danger text-xs font-normal underline-offset-4 hover:underline"
            onClick={buttonProps.onClick}
            type="button"
          >
            {buttonProps.text}
          </button>
        </div>
      )}
    </div>
  );
};
