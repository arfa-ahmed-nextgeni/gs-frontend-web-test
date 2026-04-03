import { Label } from "@/components/ui/label";

export const CategoryCheckboxFilterListSkeleton = ({
  options,
}: {
  options: {
    count: number;
    label: string;
    value: string;
  }[];
}) => {
  return options.map(({ count, label, value }) => (
    <div
      className="transition-default flex transform animate-pulse items-center gap-2.5 py-1.5"
      key={value}
    >
      <div className="border-border-strong size-3 rounded-[4px] border"></div>
      <Label className="transition-default text-text-primary block text-xs font-normal peer-data-[state=checked]:font-semibold">
        {label}{" "}
        <span className="text-text-tertiary text-[8px] font-normal">
          ({count})
        </span>
      </Label>
    </div>
  ));
};
