import { ComponentProps } from "react";

import { cn } from "@/lib/utils";

const currencyConfig = {
  AED: {
    match: [/AED/, /د\.إ/],
    symbol: "<",
  },
  SAR: {
    match: [/SAR/, /ر\.س/],
    symbol: ">",
  },
} as const;

export const LocalizedPrice = ({
  containerProps,
  currencySymbolProps,
  price,
  valueProps,
}: {
  containerProps?: ComponentProps<"span">;
  currencySymbolProps?: ComponentProps<"span">;
  price?: string;
  valueProps?: ComponentProps<"span">;
}) => {
  const config = Object.values(currencyConfig).find((cfg) =>
    cfg.match.some((regex) => regex.test(price || ""))
  );

  const cleanedPrice = config
    ? config.match.reduce(
        (result, regex) => result.replace(regex, "").trim(),
        price || ""
      )
    : price;

  return (
    <span
      {...containerProps}
      className={cn("font-gilroy leading-none", containerProps?.className)}
      dir="ltr"
    >
      {config && (
        <span
          className={cn(
            "font-gilroy me-[3px] inline align-middle leading-none",
            currencySymbolProps?.className
          )}
          style={{
            lineHeight: "inherit",
            position: "relative",
            top: "calc(-0.04em + 0.3px)",
            verticalAlign: "middle",
          }}
        >
          {config.symbol}
        </span>
      )}
      <span
        {...valueProps}
        className={cn("align-middle leading-none", valueProps?.className)}
      >
        {cleanedPrice}
      </span>
    </span>
  );
};
