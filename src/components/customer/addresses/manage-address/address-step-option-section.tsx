import { SelectOption } from "@/lib/types/ui-types";
import { cn } from "@/lib/utils";

export const AddressStepOptionSection = ({
  onSelect,
  options,
  selectedValue,
  title,
}: {
  onSelect: (option: SelectOption) => void;
  options: SelectOption[];
  selectedValue?: SelectOption;
  title?: string;
}) => {
  if (options.length === 0) return null;

  return (
    <div className="mb-5">
      {title && (
        <p className="text-text-secondary mb-2.5 text-sm font-medium">
          {title}
        </p>
      )}
      <ul className="flex flex-wrap gap-0.5">
        {options.map((region, index) => (
          <li key={`${region.value}-${index}`}>
            <button
              className={cn(
                "transition-default h-8.75 hover:bg-btn-bg-surface bg-btn-bg-inverse border-border-base text-text-primary flex items-center justify-center rounded-xl border px-2.5 text-xs font-normal",
                {
                  "bg-btn-bg-primary text-text-inverse hover:bg-btn-bg-primary border-none":
                    selectedValue?.value === region.value,
                }
              )}
              onClick={() => onSelect(region)}
              type="button"
            >
              {region.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
